/*eslint no-console: ["error", {allow: ["error"]}]*/

//Core files.
var coin, orders;
//Lib files that support the core files.
var cmc = require("./lib/cmc.js"), fs;

//EventEmitters.
var events = require("events");
var emitter;

//Paths, and all the folders we need.
var path = require("path");
var paths = {
    //Root of the data directory.
    data: path.join(process.cwd(), "data"),

    //All of the orders paths.
    orders: {
        //Root of the orders directory.
        root: path.join(process.cwd(), "data", "orders"),
        //Current orders directory.
        current: path.join(process.cwd(), "data", "orders", "current"),
        //Archived orders directory.
        archived: path.join(process.cwd(), "data", "orders", "archived")
    },

    //Products directory.
    products: path.join(process.cwd(), "data", "products"),

    //All of the users paths.
    users: {
        //Admins directory.
        admins: path.join(process.cwd(), "data", "users", "admins"),
        //Cashiers directory.
        cashiers: path.join(process.cwd(), "data", "users", "cashiers")
    },

    //Directory of the files served by the server.
    public: path.join(process.cwd(), "public"),
    //Directory of the files served by the server that only the admin can access.
    admin: path.join(process.cwd(), "admin_public"),
    //Directory of the SSL folder.
    ssl: path.join(process.cwd(), "data", "ssl"),
    
    //Path to the settings. This is used a couple of places.
    settings: path.join(process.cwd(), "data", "settings.json")
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
        //Create the order.
        var order = await orders.new(amount, note);
        //Tell UI it was created, here's the address, order data, and carry the cb.
        emitter.emit("created", order.address, order.order, cb);
    });
    emitter.on("cash", async (address) => {
        //Mark the order as paid in cash.
        await orders.paidInCash(address);
    });
    emitter.on("cancel", async (address) => {
        //Cancel the order.
        await orders.cancel(address);
    });

    //Now that the emitter is ready, create the UI.
    //It also needs the path to the files it serves, the CMC lib, and the fs lib.
    await require("./src/ui.js")({
        cmc: cmc,
        fs: fs,
        emitter: emitter,
        ssl: settings.ssl,
        publicPath: paths.public,
        adminPath: paths.admin,
        sslPath: paths.ssl
    });
}

//Anonymous function to call the code in a try/catch.
(async () => {
    try {
        await main();
    } catch(e) {
        console.error(e);
    }
})();
