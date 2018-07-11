//Needed libraries...
var express, accounts, products, cmc;

module.exports = async (config) => {
    express = config.express;
    accounts = config.accounts;
    products = config.products;
    cmc = config.cmc;

    var router = express.Router();

    //Route to get the list of all products.
    router.get("/list", async (req, res) => {
        res.end(JSON.stringify(await products.load()));
    });

    //Route to calculate the price of some products.
    router.post("/calculate", async (req, res) => {
        if (typeof(req.body) !== "object") {
            res.end("false");
            return;
        }

        var cart = await products.load();
        var i;
        for (i in req.body) {
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
        for (i in req.body) {
            usd += cart[req.body[i]].usdCost;
        }

        res.end(await cmc.iopFormat(await cmc.usdToIOP(usd)));
    });

    //Route to buy some products.
    router.post("/buy", async (req, res) => {
        if (typeof(req.body) !== "object") {
            res.end("false");
            return;
        }

        var cart = await products.load();
        var i;
        for (i in req.body) {
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
        for (i in req.body) {
            products.bought(req.body[i], 1);
            usd += cart[req.body[i]].usdCost;
        }

        res.end(await cmc.iopFormat(await cmc.usdToIOP(usd)));
    });

    router.use(accounts.middlewares.admin);

    //Route to create a new product.
    router.post("/new", async (req, res) => {
        var product = req.body;

        //It must be an object with a price. It doesn't need a name or assetPath (path to an image).
        if (typeof(product) !== "object") {
            return false;
        }
        if (typeof(product.name) !== "string") {
            name = "";
        }
        if (typeof(product.assetPath) !== "string") {
            product.assetPath = "";
        }
        if (typeof(product.usdCost) !== "number") {
            return false;
        }

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

    return router;
};
