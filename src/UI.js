//Needed libs.
var cmc, fs, accounts;

//Express web server.
var express = require("express");

//Path lib.
var path = require("path");

//Global vars that are passed in. The emitter and path to files to serve staticly.
var emitter, publicPath;
//Global vars that handle orders.
var orders, succeeded, failed;

module.exports = async (config) => {
    //Set/include the libs.
    cmc = config.cmc;
    fs = config.fs;
    accounts = require("../lib/accounts.js")(fs);

    //Set the global vars.
    emitter = config.emitter;
    publicPath = config.publicPath;

    //Init the vars that handle orders.
    orders = {};
    succeeded = [];
    failed = [];

    //Handle events.
    emitter.on("created", async (address, order, cb) => {
        orders[address] = order;
        console.log("Order has address of " + address);
        cb(address);
    });
    emitter.on("success", async (address) => {
        console.log("Order " + address + " succeeded.")
        succeeded.push(address);
        delete orders[address];
    });
    emitter.on("failure", async (address) => {
        failed.push(address);
        delete orders[address];
    });

    //Create the web server with nocache. This is for dev purposes.
    //This will soon have a middleware to guarantee the user is authed.
    express =
        express()
        .use(express.json())
        .use(require("nocache")())
        .use("/", express.static(publicPath));

    //Redirect the site root to index.html
    express.get("/", async (req, res) => {
        res.sendFile(path.join(publicPath, "index.html"));
    });

    //Route to get the IOP price.
    express.get("/iop/price", async (req, res) => {
        res.end(await cmc.getIOPPrice());
    });

    //GET route to get the orders.
    express.get("/orders/active", async (req, res) => {
        res.end(JSON.stringify(orders));
    });

    //GET route to get the succeeded orders.
    express.get("/orders/succeeded", async (req, res) => {
        res.end(JSON.stringify(succeeded));
    });

    //Route to get the failed orders.
    express.get("/orders/failed", async (req, res) => {
        res.end(JSON.stringify(failed));
    });

    //POST route to login.
    express.post("/users/login", async (req, res) => {
        if (await accounts.login(req.body.user, req.body.pass)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //POST route to create a new user.
    express.post("/users/new", async (req, res) => {
        if (await accounts.newUser(req.body.user, req.body.pass)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //POST route to change a password.
    express.post("/users/changePassword", async (req, res) => {
        if (await accounts.changePassword(req.body.user, req.body.pass)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //POST route to delete an user.
    express.post("/users/delete", async (req, res) => {
        if (await accounts.deleteUser(req.body.user)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //POST route to create an order.
    express.post("/orders/new", async (req, res) => {
        //Validate the input.
        if (typeof(req.body.amount) !== "number") {
            res.end("false");
        }
        var amount = parseFloat(req.body.amount.toPrecision(4));

        if (amount <= 0) {
            res.end("false");
        }

        if (typeof(req.body.note) !== "string") {
            res.end("false");
        }

        //Emit the new order event.
        emitter.emit("new", amount, req.body.note, async (address) => {
            res.end(address);
        });
    });

    //POST route to cancel an order.
    express.post("/orders/cancel", async (req, res) => {
        //Validate the input.
        if (typeof(req.body.address) !== "string") {
            res.end("false");
        }
        if (typeof(orders[req.body.address]) !== "object") {
            res.end("false");
        }

        //Emit the cancel event and tell the user it worked.
        emitter.emit("cancel", req.body.address);
        res.end("true");
    });

    //POST route in progress to update the settings.
    express.post("/settings/update", async (req, res) => {

    });

    express.listen(8080, "0.0.0.0");
}

//Interval that deletes all orders that are 24 hours old, AKA force archived.
//This runs every day. It also serves to prepare the processor for a new day of orders.
setInterval(async () => {
    var hoursAgo = (new Date()).getTime() - (24*60*60*1000);
    for (var address in orders) {
        if (orders[address].time <= hoursAgo) {
            delete orders[address];
        }
    }
    for (var address in succeeded) {
        if (succeeded[address].time <= hoursAgo) {
            delete succeeded[address];
        }
    }
    for (var address in failed) {
        if (failed[address].time <= hoursAgo) {
            delete failed[address];
        }
    }
}, 24*60*60*1000);
