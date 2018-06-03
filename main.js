var path = require("path");
var settingsPath = path.join(__dirname, "data", "settings.json");
var ordersPath = path.join(__dirname, "data", "orders");

var events = require("events");

var settings = require(settingsPath);

(async () => {
    var coin = await require("./src/coin.js")(settingsPath);

    var orderEmitter = new events();
    var orders = await require("./src/orders.js")(orderEmitter, coin, ordersPath, settings.zeroConfUSD);

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

    var UI = require("./src/UI.js")(uiEmitter);
})();
