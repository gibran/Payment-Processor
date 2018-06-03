var request = require("request-promise");

var fs = require("fs");
var path = require("path");

var emitter, coin, currentPath, archivedPath, zeroConfUSD;
var orders, zeroConf;

async function saveOrder(address) {
    fs.writeFile(path.join(currentPath, address + ".json"), JSON.stringify(orders[address], null, 4), async()=>{});
}

async function archiveOrder(address, success) {
    await coin.untrackAddress(address);

    orders[address].success = success;
    await saveOrder(address);
    delete orders[address];

    fs.rename(path.join(currentPath, address + ".json"), path.join(archivedPath, address + ".json"), async()=>{});
}

async function updateZeroConf() {
    zeroConf =
        zeroConfUSD /
        (await request({
            uri: "https://api.coinmarketcap.com/v2/ticker/1464/",
            json: true
        })).data.quotes.USD.price;
    console.log("Zero Conf Amount in IOP is: " + zeroConf);
}
setInterval(updateZeroConf, 60*60*1000)

module.exports = async (emitterArg, coinArg, ordersPath, zeroConfUSDArg) => {
    emitter = emitterArg;
    coin = coinArg;
    currentPath = path.join(ordersPath, "current");
    archivedPath = path.join(ordersPath, "archived");
    zeroConfUSD = zeroConfUSDArg;

    orders = {};
    await updateZeroConf();

    return {
        new: async (amount, note) => {
            var address = await coin.getNewAddress();

            orders[address] = {
                amount: amount,
                time: (new Date()).getTime(),
                note: note
            }
            saveOrder(address);

            return address;
        }
    };
}

setInterval(async () => {
    var hoursAgo  = (new Date()).getTime() - (24*60*60*1000);
    for (var address in orders) {
        if (orders[address].time <= hoursAgo) {
            archiveOrder(address, false);
            emitter.emit("failure", address);
        }

        if (orders[address].amount <= zeroConf) {
            console.log("Checking unconfirmed balance.");
            if (await coin.getUnconfirmedBalance(address) >= orders[address].amount) {
                archiveOrder(address, true);
                emitter.emit("success", address);
            }
            return;
        }

        if (await coin.getConfirmedBalance(address) >= orders[address].amount) {
            archiveOrder(address, true);
            emitter.emit("success", address);
        }
    }
}, 20*1000);
