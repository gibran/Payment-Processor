var fs = require("fs");
var path = require("path");

var express = require("express");

var emitter, orders, succeeded, failed;

module.exports = async (emitterArg) => {
    emitter = emitterArg;
    orders = {};
    succeeded = [];
    failed = [];

    emitter.on("created", async (coinData, amount, note) => {
        orders[coinData.id] = {
            address: coinData.address,
            amount: amount,
            note: note
        }
        console.log("Order " + coinData.id + " has address of " + coinData.address);
    });
    emitter.on("success", async (id) => {
        succeeded.push(id);
        delete orders[id];
    });
    emitter.on("failure", async (id) => {
        failed.push(id);
        delete order[id];
    });

    express =
        express()
        .use(express.json())
        .use(require("nocache")())
        .use("/", express.static(path.join(__dirname, "public")));

    express.get("/", async (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    express.post("/new", async (req, res) => {
        console.log("UI recieved order for " + req.body.amount);
        emitter.emit("new", req.body.amount, req.body.note);
        res.end("true");
    });

    express.listen(8080, "0.0.0.0");
}
