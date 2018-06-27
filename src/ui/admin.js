//Needed libraries...
var express, accounts;

//Global var.
var adminPath;

module.exports = async (config) => {
    express = config.express;
    accounts = config.accounts;
    adminPath = config.adminPath;

    var router =
        express.Router()
            .use(accounts.adminMiddleware)
            .use("/", express.static(adminPath));

    return router;
};
