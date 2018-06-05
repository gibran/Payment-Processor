var request = require("request-promise");

var user = "admin";
var pass = "pass";

(async () => {
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

    console.log(login.body);
    console.log("Logged in with \"" + user + "\" and \"" + pass + "\". Server responded with the following: " +
    ((login.body === false) ? login.body : JSON.stringify(login.headers["set-cookie"])));
})();
