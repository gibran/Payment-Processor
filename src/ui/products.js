//Needed libraries...
var express, products, cmc;

module.exports = async (config) => {
    express = config.express;
    products = config.products;
    cmc = config.cmc;

    var router = express.Router();

    //Route to get the list of all products.
    router.get("/list", async (req, res) => {
        res.end(JSON.stringify(await products.load()));
    });

    //Route to create a new product.
    router.post("/new", async (req, res) => {
        res.end((await products.add(req.body)).toString());
    });

    //Route to delete a product.
    router.post("/delete", async (req, res) => {
        //Filter input.
        if (typeof(req.body.index) !== "number") {
            res.end("false");
            return;
        }
        if (req.body.index < 0) {
            res.end("false");
            return;
        }
        if (typeof(req.body.name) !== "string") {
            res.end("false");
            return;
        }

        res.end((await products.remove(req.body.index, req.body.name)).toString());
    });

    //Route to buy some products.
    router.post("/buy", async (req, res) => {
        if (typeof(req.body) !== "object") {
            res.end("false");
            return;
        }

        cart = await products.load();
        for (var i in req.body) {
            if (typeof(req.body[i]) !== "number") {
                res.end("false");
                return;
            }
            if (!((0 <= req.body[i]) && (req.body[i] < cart.length))) {
                res.end("false");
                return;
            }
        }

        var usd = 0;
        for (var i in req.body) {
            products.bought(req.body[i], 1);
            usd += cart[req.body[i]].usdCost;
        }

        res.end(cmc.iopFormat(await cmc.usdToIOP(usd)));
    });

    return router;
};