var request = require("request-promise");

module.exports = async (user, pass) => {
    var login = await request({
        method: "POST",
        url: "http://localhost:8080/users/login",
        body: {
            user: user,
            pass: pass
        },
        json: true,
        resolveWithFullResponse: true
    });

    return ((login.body === false) ? false : login.headers["set-cookie"][0].split("token=")[1].split(";")[0]);
};

if (require.main === module) {
    var assert = require("../assert.js");
    (async () => {
        var user = "admin";
        var pass = "pass";

        /*eslint-disable-next-line no-console*/
        console.log("Running the login tests using the variables inside this file.");

        /*eslint-disable-next-line no-console*/
        console.log("Logging in with the correct login...");
        var token = await module.exports(user, pass);
        assert(token.length === 32);

        /*eslint-disable-next-line no-console*/
        console.log("Logging in with an invalid username...");
        assert((await module.exports(user + "1", pass)) === false);

        /*eslint-disable-next-line no-console*/
        console.log("Logging in with an invalid password...");
        assert((await module.exports(user, pass + "1")) === false);

        /*eslint-disable-next-line no-console*/
        console.log("Logging in with an invalid username and password...");
        assert((await module.exports(user + "1", pass + "1")) === false);

        /*eslint-disable-next-line no-console*/
        console.log("Logging in with an empty username...");
        assert((await module.exports("", pass)) === false);

        /*eslint-disable-next-line no-console*/
        console.log("Logging in with an empty password...");
        assert((await module.exports(user, "")) === false);

        /*eslint-disable-next-line no-console*/
        console.log("Trying to do a POST request to log us out with the auth token from the correct login.");
        var logout = await request({
            method: "POST",
            url: "http://localhost:8080/users/logout",
            json: true,
            headers: {Cookie: "token=" + token}
        });
        assert(logout === true);

        /*eslint-disable-next-line no-console*/
        console.log("Trying to redo that POST request without logging in again.");
        logout = await request({
            method: "POST",
            url: "http://localhost:8080/users/logout",
            json: true,
            headers: {Cookie: "token=" + token}
        });
        assert(logout === "You are not logged in.");

        /*eslint-disable-next-line no-console*/
        console.log("Finally, trying this with a blank token.");
        logout = await request({
            method: "POST",
            url: "http://localhost:8080/users/logout",
            json: true,
            headers: {Cookie: "token=;"}
        });
        assert(logout === "You are not logged in.");

        /*eslint-disable-next-line no-console*/
        console.log("All tests succeeded.");
    })();
}
