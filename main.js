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
    data: path.join(process.cwd(), "data"),                              //Root of the data directory.

    orders: {                                                            //All of the orders paths.
        root: path.join(process.cwd(), "data", "orders"),                //Root of the orders directory.
        current: path.join(process.cwd(), "data", "orders", "current"),  //Current orders directory.
        archived: path.join(process.cwd(), "data", "orders", "archived") //Archived orders directory.
    },
                                                                         //These next three directories aren't for one of the core three parts.

                                                                         //This next one is a library usable by any UI.
    products: path.join(process.cwd(), "data", "products"),              //Products directory.

                                                                         //These next three are specific to the web server UI.

    users: {                                                             //All of the users paths.
        admins: path.join(process.cwd(), "data", "users", "admins"),     //Admins directory.
        cashiers: path.join(process.cwd(), "data", "users", "cashiers")  //Cashiers directory.
    },
    public: path.join(process.cwd(), "public"),                          //Directory of the files served by the server.
    admin: path.join(process.cwd(), "admin_public"),                     //Directory of the files served by the server that only the admin can access.
    ssl: path.join(process.cwd(), "data", "ssl"),                        //Directory of the SSL folder.

    settings: path.join(process.cwd(), "data", "settings.json")          //Path to the settings. This is used a couple of places.
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
