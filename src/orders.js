var coin;
var cmc;
var fs;

var path = require("path");

var emitter, zeroConfUSD;
var zeroConf, orders;

async function updateZeroConf() {
    zeroConf = parseFloat(
        (zeroConfUSD / (await cmc.getIOPPrice()))
        .toPrecision(4)
    );
}
setInterval(updateZeroConf, 60*60*1000);

async function archiveOrder(address, success) {
    await coin.untrackAddress(address);
    fs.archiveOrder(address, orders[address], success);
    delete orders[address];
    emitter.emit((success ? "success" : "failure"), address);
}

module.exports = async (config) => {
    coin = config.coin;
    cmc = config.cmc;
    fs = config.fs;

    emitter = config.emitter;

    zeroConfUSD = config.zeroConfUSD;
    await updateZeroConf();

    orders = {};

    return {
        new: async (amount, note) => {
            var address = await coin.getNewAddress();

            orders[address] = {
                amount: amount,
                usd: parseFloat((await cmc.iopToUsd(amount)).toPrecision(2)),
                note: note,
                time: (new Date()).getTime()
            }
            fs.saveOrder(address, orders[address]);

            return {
                address: address,
                order: orders[address]
            };
        },

        cancel: async (address) => {
            if (typeof(orders[address]) === "object") {
                archiveOrder(address, false);
            }
        }
    };
}

setInterval(async () => {
    var hoursAgo = (new Date()).getTime() - (24*60*60*1000);
    for (var address in orders) {
        if (orders[address].time <= hoursAgo) {
            archiveOrder(address, false);
        }

        if (orders[address].amount <= zeroConf) {
            console.log("Checking unconfirmed balance.");
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
