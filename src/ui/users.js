//Needed libraries...
var express, accounts;

module.exports = async (config) => {
    express = config.express;
    accounts = config.accounts;

    var router =
        express.Router()
        .use(accounts.adminMiddleware);

    //Route to get an array of all usernames.
    router.get("/list", async (req, res) => {
        res.end(JSON.stringify(await accounts.list()));
    });

    //Route to get a list of all admins.
    router.get("/admins", async (req, res) => {
        res.end(JSON.stringify(await accounts.listAdmins()));
    });

    //Route to login.
    router.post("/login", async (req, res) => {
        var login = await accounts.login(req.body.user, req.body.pass);
        if (typeof(login) === "string") {
            res.cookie("token", login, {maxAge: 24*60*60*1000});
            res.end("true");
            return;
        }
        res.end("false");
    });

    //Route to logout.
    router.post("/logout", async (req, res) => {
        await accounts.logout(req.cookies.token);
        res.clearCookie("token");
        res.end("true");
    });

    //Route to create a new user.
    router.post("/new", async (req, res) => {
        if (await accounts.newUser(req.body.user, req.body.pass, req.body.admin)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //Route to change a password.
    router.post("/changePassword", async (req, res) => {
        if (await accounts.changePassword(req.body.user, req.body.pass)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //Route to delete an user.
    router.post("/delete", async (req, res) => {
        if (await accounts.deleteUser(req.body.user)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    return router;
};
