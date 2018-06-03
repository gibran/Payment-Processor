var fs = require("fs");
var path = require("path");

var express = require("express");

var emitter, orders, succeeded, failed;

module.exports = async (emitterArg) => {
    emitter = emitterArg;
    orders = {};
    succeeded = [];
    failed = [];

    emitter.on("created", async (address, amount, note, cb) => {
        orders[address] = {
            amount: amount,
            note: note
        }
        console.log("Order has address of " + address);
        cb(address);
    });
    emitter.on("success", async (address) => {
        succeeded.push(address);
        delete orders[address];
    });
    emitter.on("failure", async (address) => {
        failed.push(address);
        delete order[address];
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

    express.post("/new", async (req, res) => {
        console.log("UI recieved order for " + req.body.amount);
        emitter.emit("new", req.body.amount, req.body.note, async (address) => {
            res.end(address);
        });
    });

    express.listen(8080, "0.0.0.0");
}
