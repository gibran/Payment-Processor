var request = require("request-promise");

var login = require("./login.js");

var user = "adminTwo";
var pass = "pass";

(async () => {
    var token = await login("admin", "pass");

    var newUser = await request({
        method: "POST",
        url: "http://localhost:8080/users/new",
        body: {
            user: user,
            pass: pass
        },
        json: true,
        headers: {Cookie: "token=" + token}
    });

    if (newUser) {
        console.log("Created a new user with an username of \"" + user + "\" and a password of \"" + pass + "\". Please try logging in with these credentials.");
        return;
    }
    console.log("Failed to create a new user. Was the username or token invalid?");
})();
