//One of the three parts of the processor.
var coin;

//Needed libs.
var cmc, fs;

//Passed in variables.
//The emitter is for message passing and zeroConfUSD is the max amount of USD to accept with 0 confs.
var emitter, zeroConfUSD;
//zeroConf in IOP and the order book.
var zeroConf, orders;

//Updates the zeroConf amount in IOP. Runs every half hour.
async function updateZeroConf() {
    zeroConf = parseFloat(
        (await cmc.usdToIOP(zeroConfUSD))
        .toPrecision(4)
    );
}
setInterval(updateZeroConf, 30*60*1000);

//Function to archive an order. Takes in an order ID (ID = address), and if it succedded or failed.
async function archiveOrder(address, success) {
    //Stop tracking the address.
    await coin.untrackAddress(address);
    //Move it from current orders to archived.
    fs.orders.archive(address, orders[address], success);
    //Delete it from the cache.
    delete orders[address];
    //Emit the order and it's status.
    emitter.emit((success ? "success" : "failure"), address);
}

module.exports = async (config) => {
    //Store the config variables in global variables.
    coin = config.coin;

    cmc = config.cmc;
    fs = config.fs;

    emitter = config.emitter;

    zeroConfUSD = config.zeroConfUSD;
    //Make sure we have a zeroConf IOP amount and not just one for USD.
    await updateZeroConf();

    //Init the orders cache.
    orders = {};

    //Return an object that can create a new order and cancel one.
    return {
        new: async (amount, note) => {
            //Get an address.
            var address = await coin.getNewAddress();

            //Create the order object. Amount, USD value, note, and time index.
            orders[address] = {
                amount: amount,
                usd: parseFloat((await cmc.iopToUSD(amount)).toPrecision(2)),
                note: note,
                time: (new Date()).getTime()
            }
            //Save it to disk.
            fs.orders.save(address, orders[address]);

            //Return the address and order.
            return {
                address: address,
                order: orders[address]
            };
        },

        //Cancels an order in progress.
        cancel: async (address) => {
            //If the order exists, archive it as a fail.
            if (typeof(orders[address]) === "object") {
                archiveOrder(address, false);
            }
        }
    };
}

//20 second interval. Code checks the status of orders, such as:
//    If an order is 24 hours old, it is an automatic failure
//    If it has an unconfirmed balance that is at least the  order amount AND less than the 0conf limit, mark it as a success.
//    If it has a confirmed balance that at least the order amount, or is greater, mark it as a success.
setInterval(async () => {
    var hoursAgo = (new Date()).getTime() - (24*60*60*1000);
    for (var address in orders) {
        if (orders[address].time <= hoursAgo) {
            archiveOrder(address, false);
        }

        if (orders[address].amount <= zeroConf) {
            if (await coin.getUnconfirmedBalance(address) >= orders[address].amount) {
                archiveOrder(address, true);
            }
            return;
        }

        if (await coin.getConfirmedBalance(address) >= orders[address].amount) {
            archiveOrder(address, true);
        }
    }
}, 20*1000);
