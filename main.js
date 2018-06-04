var path = require("path");
var paths = {
    data: path.join(__dirname, "data"),
    users: path.join(__dirname, "data", "users"),
    orders: {
        root: path.join(__dirname, "data", "orders"),
        current: path.join(__dirname, "data", "orders", "current"),
        archived: path.join(__dirname, "data", "orders", "archived")
    },
    settings: path.join(__dirname, "data", "settings.json"),
    public: path.join(__dirname, "public")
};

var cmc = require("./lib/cmc.js");
var fs = require("./lib/fs.js")(paths);

var events = require("events");

var settings = require(paths.settings);

async function main() {
    var coin = await require("./src/coin.js")(settings);

    var orderEmitter = new events();
    var orders = await (require("./src/orders.js"))({
        coin: coin,
        cmc: cmc,
        fs: fs,
        emitter: orderEmitter,
        zeroConfUSD: settings.zeroConfUSD
    });

    var uiEmitter = new events();
    orderEmitter.on("success", async (address) => {
        console.log("Order " + address + " succeeded.");
        uiEmitter.emit("success", address);
    });
    orderEmitter.on("failure", async (address) => {
        console.log("Order " + address + " failed.");
        uiEmitter.emit("failure", address);
    });

    uiEmitter.on("new", async (amount, note, cb) => {
        console.log("Creating order for " + amount + " with note of " + note);
        var order = await orders.new(amount, note);
        uiEmitter.emit("created", order.address, order.order, cb);
    });
    uiEmitter.on("cancel", async (address) => {
        console.log("Cancelling order " + address);
        await orders.cancel(address);
    });

    var UI = require("./src/UI.js")({
        emitter: uiEmitter,
        publicPath: paths.public,
        cmc: cmc,
        fs: fs
    });
}

(async () => {
    try {
        await main();
    } catch(e) {
        console.log(e);
    }
})();
