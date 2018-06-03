var path = require("path");
var settingsPath = path.join(__dirname, "data", "settings.json");
var addressesPath = path.join(__dirname, "data", "addresses.json");
var ordersPath = path.join(__dirname, "data", "orders");

var events = require("events");

var settings = require(settingsPath);

(async () => {
    var coin = await require("./src/coin.js")(settingsPath);

    var orderEmitter = new events();
    var orders = await require("./src/orders.js")(orderEmitter, coin, addressesPath, ordersPath, settings.zeroConfUSD);

    var uiEmitter = new events();
    orderEmitter.on("success", async (id) => {
        console.log("Order " + id + " succeeded.");
        uiEmitter.emit("success", id);
    });
    orderEmitter.on("failure", async (id) => {
        console.log("Order " + id + " failed.");
        uiEmitter.emit("failure", id);
    });
    uiEmitter.on("new", async (amount, note) => {
        console.log("Creating order for " + amount + " with note of " + note);
        uiEmitter.emit("created", await orders.new(amount, note), amount, note);
    });

    var UI = require("./src/UI.js")(uiEmitter);
})();
