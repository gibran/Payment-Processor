//Express library...
var express;

//QR lib.
var qr = require("qr-image");

module.exports = async (config) => {
    express = config.express;

    var router = express.Router();

    //Route to get the QR code for an address.
    router.get("/:address", async (req, res) => {
        res.setHeader("Content-Type", "image/svg+xml");
        res.end(qr.imageSync(req.params.address, {type: "svg"}));
    });

    return router;
};
