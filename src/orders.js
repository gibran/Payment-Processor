var request = require("request-promise");
var randstring = require("randomstring").generate;

var fs = require("fs");
var path = require("path");

var emitter, coin, addressesPath, addresses, currentPath, archivedPath, zeroConfUSD;
var orders, zeroConf;

async function saveAddresses() {
    fs.writeFile(addressesPath, JSON.stringify(addresses, null, 4), async()=>{});
}

async function saveOrder(id) {
    fs.writeFile(path.join(currentPath, id + ".json"), JSON.stringify(orders[id], null, 4), async()=>{});
}

async function archiveOrder(id, success) {
    await coin.untrackAddress(orders[id].address);

    orders[id].success = success;
    await saveOrder(id);
    delete orders[id];

    fs.rename(path.join(currentPath, id + ".json"), path.join(archivedPath, id + ".json"), async()=>{});
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

module.exports = async (emitterArg, coinArg, addressesPathArg, ordersPath, zeroConfUSDArg) => {
    emitter = emitterArg;
    coin = coinArg;
    addressesPath = addressesPathArg;
    addresses = require(addressesPath);
    currentPath = path.join(ordersPath, "current");
    archivedPath = path.join(ordersPath, "archived");
    zeroConfUSD = zeroConfUSDArg;

    orders = {};
    await updateZeroConf();

    return {
        new: async (amount, note) => {
            var id;
            do {
                id = randstring();
            } while (addresses[id] === "string");

            addresses[id] = await coin.getNewAddress();
            saveAddresses();

            orders[id] = {
                address: addresses[id],
                amount: amount,
                time: (new Date()).getTime(),
                note: note
            }
            saveOrder(id);

            return {
                id: id,
                address: addresses[id]
            };
        }
    };
}

setInterval(async () => {
    var hoursAgo  = (new Date()).getTime() - (24*60*60*1000);
    for (var id in orders) {
        if (orders[id].time <= hoursAgo) {
            archiveOrder(id, false);
            emitter.emit("failure", id);
        }

        if (orders[id].amount <= zeroConf) {
            console.log("Checking unconfirmed balance.");
            if (await coin.getUnconfirmedBalance(orders[id].address) >= orders[id].amount) {
                archiveOrder(id, true);
                emitter.emit("success", id);
            }
            return;
        }

        if (await coin.getConfirmedBalance(orders[id].address) >= orders[id].amount) {
            archiveOrder(id, true);
            emitter.emit("success", id);
        }
    }
}, 20*1000);
