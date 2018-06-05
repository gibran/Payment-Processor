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

    console.log("Logged in with \"" + user + "\" and \"" + pass + "\". Server responded with the following: " +
    ((login.body === false) ? login.body : JSON.stringify(login.headers["set-cookie"])));

    return ((login.body === false) ? false : login.headers["set-cookie"][0].split("token=")[1].split(";")[0]);
};

if (require.main === module) {
    (async () => {
        var user = "admin";
        var pass = "pass";

        console.log("Running the login tests using the variables inside this file.");

        console.log("Logging in with the correct login...");
        var token = await module.exports(user, pass);
        console.log("Logging in with an invalid username...");
        await module.exports(user + "1", pass);
        console.log("Logging in with an invalid password...");
        await module.exports(user, pass + "1");
        console.log("Logging in with an invalid username and password...");
        await module.exports(user + "1", pass + "1");
        console.log("Logging in with an empty username...");
        await module.exports("", pass);
        console.log("Logging in with an empty password...");
        await module.exports(user, "");

        console.log("Trying to do a POST request to log us out with the auth token from the correct login.");
        var logout = await request({
            method: "POST",
            url: "http://localhost:8080/users/logout",
            json: true,
            headers: {Cookie: "token=" + token}
        });
        console.log("Did we logout? " + logout);

        console.log("Trying to redo that POST request without logging in again.");
        logout = await request({
            method: "POST",
            url: "http://localhost:8080/users/logout",
            json: true,
            headers: {Cookie: "token=" + token}
        });
        console.log("Did we logout? " + logout);

        console.log("Finally, trying this with a blank token.");
        logout = await request({
            method: "POST",
            url: "http://localhost:8080/users/logout",
            json: true,
            headers: {Cookie: "token=;"}
        });
        console.log("Did we logout? " + logout);
    })();
}
