//Needed libraries...
var express, accounts;

//Mapping of token to user.
var tokens = {};

module.exports = async (config) => {
    express = config.express;
    accounts = config.accounts;

    var router = express.Router();

    //Route to get an array of all usernames.
    router.get("/list", async (req, res) => {
        res.end(JSON.stringify(await accounts.list()));
    });

    //Route to get a list of all admins.
    router.get("/admins", async (req, res) => {
        res.end(JSON.stringify(await accounts.listAdmins(tokens[req.cookies.token])));
    });

    //Route to login.
    router.post("/login", async (req, res) => {
        var login = await accounts.login(req.body.user, req.body.pass);
        if (typeof(login) === "string") {
            tokens[login] = req.body.user;
            res.cookie("token", login, {maxAge: 24*60*60*1000});
            res.end("true");
            return;
        }
        res.end("false");
    });

    //Route to logout.
    router.post("/logout", async (req, res) => {
        delete tokens[req.cookies.token];
        await accounts.logout(req.cookies.token);
        res.clearCookie("token");
        res.end("true");
    });

    //Route to create a new user.
    router.post("/new", async (req, res) => {
        if (await accounts.newUser(tokens[req.cookies.token], req.body.user, req.body.pass, req.body.admin)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //Route to change a password.
    router.post("/changePassword", async (req, res) => {
        if (await accounts.changePassword(tokens[req.cookies.token], req.body.user, req.body.pass)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    //Route to delete an user.
    router.post("/delete", async (req, res) => {
        if (await accounts.deleteUser(tokens[req.cookies.token], req.body.user)) {
            res.end("true");
            return;
        }
        res.end("false");
    });

    return router;
};
