//Needed libs.
var cmc, fs, accounts;

//Express web server and all its routers.
var express = require("express");
var priceRouter = require("./ui/price.js");
var usersRouter = require("./ui/users.js");
var ordersRouter = require("./ui/orders.js");
var productsRouter = require("./ui/products.js");
var qrRouter = require("./ui/qr.js");
var settingsRouter = require("./ui/settings.js");

//Path lib.
var path = require("path");

//Global vars that are passed in. The emitter and path to files to serve staticly.
var emitter, publicPath;

module.exports = async (config) => {
    //Set/include the libs.
    cmc = config.cmc;
    fs = config.fs;
    accounts = require("../lib/accounts.js")(fs);

    //Set the global vars.
    emitter = config.emitter;
    publicPath = config.publicPath;

    //Create the web server with:
    express =
        express()
        .use(express.json())                                 //JSON Parsing
        .use(require("cookie-parser")())                     //Cookies
        .use(accounts.middleware)                            //Accounts (if you aren't logged in, you can only see the login page)
        .use(require("nocache")())                           //No Caching
        .use("/price", await priceRouter({                   //Price Route(s) (more will come in the future)
            express: express,
            cmc: cmc
        }))
        .use("/users", await usersRouter({                   //Users Routes
            express: express,
            accounts: accounts
        }))
        .use("/orders", await ordersRouter({                 //Orders Routes
            express: express,
            cmc: cmc,
            emitter: emitter
        }))
        .use("/products", await productsRouter({             //Products Routes
            express: express,
            products: fs.products,
            cmc: cmc
        }))
        .use("/qr", await qrRouter({                         //QR Route
            express: express
        }))
        .use("/settings", await settingsRouter({             //Settings Routes
            express: express,
            settings: fs.settings
        }))
        .use("/", express.static(publicPath))                //Static Rendering of /public
        .get("/", async (req, res) => {                      //GET handling of / to display index.html
            res.sendFile(path.join(publicPath, "index.html"));
        });

    express.listen(8080, "0.0.0.0");
}
