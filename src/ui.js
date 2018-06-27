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

//OS, HTTPS, and Path lib.
var os = require("os");
var https = require("https");
var path = require("path");

//Global var for the address.
var address;
//Get the local network IP.
var networkInterfaces = os.networkInterfaces();
for (var i in networkInterfaces) {
    for (var x in networkInterfaces[i]) {
        if (networkInterfaces[i][x].address.substr(0, 8) === "192.168.") {
            address = networkInterfaces[i][x].address;
        }
    }
}

//Global vars that are passed in. The emitter and path to files to serve staticly.
var useSSL, emitter, publicPath;

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

    //Create the web server with:
    express =
        express()
        .use(express.json())                      //JSON Parsing
        .use(require("cookie-parser")())          //Cookies
        .use(useSSL ? async (req, res, next) => { //Use the middleware to not allow remote connections if SSL is disabled.
            next();
        } : ssl.noSSLMiddleware)
        .use(accounts.middleware)                 //Accounts (if you aren't logged in, you can only see the login page)
        .use(require("nocache")())                //No Caching
        .use("/price", await priceRouter({        //Price Route(s) (more will come in the future)
            express: express,
            cmc: cmc
        }))
        .use("/orders", await ordersRouter({      //Orders Routes
            express: express,
            cmc: cmc,
            emitter: emitter
        }))
        .use("/qr", await qrRouter({               //QR Route
            express: express
        }))
        .use("/users", await usersRouter({        //Users Routes
            express: express,
            accounts: accounts
        }))
        .use("/products", await productsRouter({  //Products Routes
            express: express,
            products: fs.products,
            cmc: cmc
        }))
        .use("/settings", await settingsRouter({   //Settings Routes
            express: express,
            settings: fs.settings
        }))
        .use("/", express.static(publicPath))      //Static Rendering of /public
        .get("/", async (req, res) => {            //GET handling of / to display index.html
            res.sendFile(path.join(publicPath, "index.html"));
        })
        .use("/", await adminRouter({              //Admin Locked Static Files. It must be after everything else because else it locks everything.
            express: express,
            accounts: accounts,
            adminPath: adminPath
        }));

    if (useSSL) {
        https.createServer(await ssl.generateSSLCert(address), express).listen(8443, "0.0.0.0");
        console.log("The UI is running at https://" + address + ":8443.");
    } else {
        express.listen(8080, "0.0.0.0");
        console.log("The UI is running at http://127.0.0.1:8080.");
    }
}
