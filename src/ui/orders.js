//Needed libraries...
var express, cmc;

//Var for the orders emitter.
var emitter;
//Vars for the orders.
var orders, succeeded, failed;

module.exports = async (config) => {
    //Move the vars out of the config object.
    express = config.express;
    cmc = config.cmc;

    emitter = config.emitter;

    //Init the vars that handle orders.
    orders = {};
    succeeded = {};
    failed = {};

    //Handle events.
    emitter.on("created", async (address, order, cb) => {
        //Store the order in the RAM cache.
        orders[address] = order;

        //Delete this order in 24 hours, AKA when it's force archived.
        //This also stops the UI from showing a year's of orders.
        setTimeout(async () => {
            delete orders[address];
            delete succeeded[address];
            delete failed[address];
        }, 24*60*60*1000);

        //Call the callback that handles the response to the original request.
        cb(address);
    });
    emitter.on("success", async (address) => {
        //When an order succeeds, move it over to the succeeded object.
        succeeded[address] = orders[address];
        delete orders[address];
    });
    emitter.on("failure", async (address) => {
        //When an order fails, move it over to the failed object.
        failed[address] = orders[address];
        delete orders[address];
    });

    var router = express.Router();

    //Route to get the orders.
    router.get("/active", async (req, res) => {
        res.end(JSON.stringify(orders));
    });

    //Route to get the succeeded orders.
    router.get("/succeeded", async (req, res) => {
        res.end(JSON.stringify(succeeded));
    });

    //Route to get the failed orders.
    router.get("/failed", async (req, res) => {
        res.end(JSON.stringify(failed));
    });

    //Route to create an order.
    router.post("/new", async (req, res) => {
        //Validate the input.
        if (typeof(req.body.amount) !== "number") {
            res.end("false");
            return;
        }
        var amount = parseFloat(await cmc.iopFormat(req.body.amount));

        if (amount <= 0.01) {
            res.end("false");
            return;
        }

        if (typeof(req.body.note) !== "string") {
            res.end("false");
            return;
        }

        //Emit the new order event.
        emitter.emit("new", amount, req.body.note, async (address) => {
            res.end(address);
        });
    });

    //Route to mark an order as paid in cash.
    router.post("/cash", async (req, res) => {
        //Validate the input.
        if (typeof(req.body.address) !== "string") {
            res.end("false");
            return;
        }
        if (typeof(orders[req.body.address]) !== "object") {
            res.end("false");
            return;
        }

        //Emit the cash event and tell the user it worked.
        emitter.emit("cash", req.body.address);
        res.end("true");
    });

    //Route to cancel an order.
    router.post("/cancel", async (req, res) => {
        //Validate the input.
        if (typeof(req.body.address) !== "string") {
            res.end("false");
            return;
        }
        if (typeof(orders[req.body.address]) !== "object") {
            res.end("false");
            return;
        }

        //Emit the cancel event and tell the user it worked.
        emitter.emit("cancel", req.body.address);
        res.end("true");
    });

    return router;
};
