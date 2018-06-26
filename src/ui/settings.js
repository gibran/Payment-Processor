//Needed libraries...
var express, settings;

module.exports = async (config) => {
    express = config.express;
    settings = config.settings;

    var router = express.Router();

    //Route in progress to update the settings.
    router.post("/update", async (req, res) => {

    });

    return router;
};
