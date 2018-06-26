//Needed libraries...
var express, cmc;

module.exports = async (config) => {
    express = config.express;
    cmc = config.cmc;

    var router = express.Router();

    router.get("/iop", async (req, res) => {
        res.end((await cmc.getIOPPrice()).toString());
    });

    return router;
};
