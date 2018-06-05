var request = require("request-promise");

var user = "admin";
var pass = "pass";

(async () => {
    var newUser = await request({
        method: "POST",
        url: "http://localhost:8080/users/new",
        body: {
            user: user,
            pass: pass
        },
        json: true,
        headers: {Cookie: "token=admin"}
    });

    if (newUser) {
        console.log("Created a new user with an username of \"" + user + "\" and a password of \"" + pass + "\". Please try logging in with these credentials.");
        return;
    }
    console.log("Failed to create a new user. Was the username or token invalid?");
})();
