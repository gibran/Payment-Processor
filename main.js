//Core files.
var coin, orders, ui;
//Lib files that support the core files.
var cmc = require("./lib/cmc.js"), fs;

//EventEmitters.
var events = require("events");
var emitter;

//Paths, and all the folders we need.
var path = require("path");
var paths = {
    data: path.join(__dirname, "data"),                              //Root of the data directory.
    orders: {                                                        //All the orders paths.
        root: path.join(__dirname, "data", "orders"),                //Root of the orders directory.
        current: path.join(__dirname, "data", "orders", "current"),  //Current orders directory.
        archived: path.join(__dirname, "data", "orders", "archived") //Archived orders directory.
    },                                                               //Theses next three directories aren't for one of the core three parts.
                                                                     //This next one is a library used by any UI.
    products: path.join(__dirname, "data", "products"),              //Products directory.
                                                                     //These next two are specific to the web server UI.
    users: path.join(__dirname, "data", "users"),                    //Users directory.
    public: path.join(__dirname, "public"),                          //HTML/CSS/JS/images/files served by the web server directory.
    settings: path.join(__dirname, "data", "settings.json")          //Path to the settings. This is used a couple of places.
};

//Load the settings.
var settings = require(paths.settings);

//We need out code to be async, so we have this main function.
//It was anonymous, but we couldn't get error reports.
//The solution was to get a main function called by an anonymous function.
async function main() {
    //Require the lib that had an async constructor.
    fs = await require("./lib/fs.js")(paths);

    //Initialize the coin code.
    coin = await require("./src/coin.js")(settings);

    //Create an event emitter for the UI/orders to pass messages through..
    emitter = new events();
    //Initialize orders, with all needed libs/it's emitter/the 0-Conf setting.
    orders = await (require("./src/orders.js"))({
        coin: coin,
        cmc: cmc,
        fs: fs,
        emitter: emitter,
        zeroConfUSD: settings.zeroConfUSD
    });

    //Define handlers for the new order/cancel order event.
    emitter.on("new", async (amount, note, cb) => {
        console.log("Creating order for " + amount + " with note of " + note);
        //Create the order.
        var order = await orders.new(amount, note);
        //Tell UI it was created, here's the address, order data, and carry the cb.
        emitter.emit("created", order.address, order.order, cb);
    });
    emitter.on("cancel", async (address) => {
        console.log("Cancelling order " + address);
        //Cancel the order.
        await orders.cancel(address);
    });

    //Now that the emitter is ready, create the UI.
    //It also needs the path to the files it serves, the CMC lib, and the fs lib.
    ui = require("./src/ui.js")({
        emitter: emitter,
        publicPath: paths.public,
        cmc: cmc,
        fs: fs
    });
}

//Anonymous function to call the code in a try/catch.
(async () => {
    try {
        await main();
    } catch(e) {
        console.log(e);
    }
})();
