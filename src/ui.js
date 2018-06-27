//Needed libs.
var cmc, fs, accounts;

//Express web server.
var express = require("express");
//Non-admin routers.
var priceRouter = require("./ui/price.js");
var ordersRouter = require("./ui/orders.js");
var qrRouter = require("./ui/qr.js");
//Admin routers.
var adminRouter = require("./ui/admin.js");
var usersRouter = require("./ui/users.js");
var productsRouter = require("./ui/products.js");
var settingsRouter = require("./ui/settings.js");

//Automatic SSL lib.
var ssl = require("./ui/ssl.js");
//Config vars for the SSL lib.
var useSSL, sslPath;

//OS, HTTPS, and Path lib.
var os = require("os");
var https = require("https");
var path = require("path");

//Global var for the IP.
var ip;
//Get the local network IP.
var networkInterfaces = os.networkInterfaces();
for (var i in networkInterfaces) {
    for (var x in networkInterfaces[i]) {
        if (networkInterfaces[i][x].address.substr(0, 8) === "192.168.") {
            ip = networkInterfaces[i][x].address;
        }
    }
}

//Global vars that are passed in.
//The emitter is used to interface with orders.
//The paths are used to files to serve staticly.
var emitter, publicPath, adminPath;

module.exports = async (config) => {
    //Set/include the libs.
    cmc = config.cmc;
    fs = config.fs;
    accounts = await require("../lib/accounts.js")(fs.accounts);

    //Set the global vars.
    emitter = config.emitter;
    publicPath = config.publicPath;
    adminPath = config.adminPath;

    //Whether or not to use SSL.
    useSSL = config.ssl;
    sslPath = config.sslPath;

    //Create the web server with:
    express =
        express()
            //JSON Parsing
            .use(express.json())
            //Cookies
            .use(require("cookie-parser")())
            //Middleware to disallow remote connections if SSL is disabled
            .use(useSSL ? async (req, res, next) => {
                next();
            } : ssl.noSSLMiddleware)
            //Accounts Middleware (if you aren't logged in, you can only see the login page)
            .use(accounts.middleware)
            //No Caching
            .use(require("nocache")())
            //Price Router
            .use("/price", await priceRouter({
                express: express,
                cmc: cmc
            }))
            //Orders Router
            .use("/orders", await ordersRouter({
                express: express,
                cmc: cmc,
                emitter: emitter
            }))
            //QR Router
            .use("/qr", await qrRouter({
                express: express
            }))
            //Users Router
            .use("/users", await usersRouter({
                express: express,
                accounts: accounts
            }))
            //Products Router
            .use("/products", await productsRouter({
                express: express,
                products: fs.products,
                cmc: cmc
            }))
            //Settings Router
            .use("/settings", await settingsRouter({
                express: express,
                settings: fs.settings
            }))
            //Static Rendering of /public
            .use("/", express.static(publicPath))
            //Have the site root show index.html
            .get("/", async (req, res) => {
                res.sendFile(path.join(publicPath, "index.html"));
            })
            //Admin Locked Static Files
            //It must be after everything else because of how middleware works
            .use("/", await adminRouter({
                express: express,
                accounts: accounts,
                adminPath: adminPath
            }));

    if (useSSL) {
        https.createServer(await ssl.loadSSL(ip, sslPath), express).listen(8443, "0.0.0.0");
        /*eslint-disable-next-line no-console*/
        console.log("The UI is running at https://" + ip + ":8443.");
    } else {
        express.listen(8080, "0.0.0.0");
        /*eslint-disable-next-line no-console*/
        console.log("The UI is running at http://127.0.0.1:8080.");
    }
};
