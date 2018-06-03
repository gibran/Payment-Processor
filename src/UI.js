var fs = require("fs");
var path = require("path");

var express = require("express");

var emitter, orders, succeeded, failed;

module.exports = async (emitterArg) => {
    emitter = emitterArg;
    orders = {};
    succeeded = [];
    failed = [];

    emitter.on("created", async (address, order, cb) => {
        orders[address] = order;
        console.log("Order has address of " + address);
        cb(address);
    });
    emitter.on("success", async (address) => {
        succeeded.push(address);
        delete orders[address];
    });
    emitter.on("failure", async (address) => {
        failed.push(address);
        delete orders[address];
    });

    express =
        express()
        .use(express.json())
        .use(require("nocache")())
        .use("/", express.static(path.join(__dirname, "public")));

    express.get("/", async (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    express.get("/getOrders", async (req, res) => {
        res.end(JSON.stringify(orders));
    });

    express.get("/getSucceeded", async (req, res) => {
        res.end(JSON.stringify(succeeded));
    });

    express.get("/getFailed", async (req, res) => {
        res.end(JSON.stringify(failed));
    });

    express.post("/new", async (req, res) => {
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

        emitter.emit("new", amount, req.body.note, async (address) => {
            res.end(address);
        });
    });

    express.post("/cancel", async (req, res) => {
        if (typeof(req.body.address) !== "string") {
            res.end("false");
        }
        if (typeof(orders[req.body.address]) !== "object") {
            res.end("false");
        }

        emitter.emit("cancel", req.body.address);
        res.end("true");
    });

    express.post("/updateSettings", async (req, res) => {
    });

    express.listen(8080, "0.0.0.0");
}

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
