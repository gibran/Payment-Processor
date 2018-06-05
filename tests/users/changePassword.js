var request = require("request-promise");

var user = "admin";
var pass = "pass";

(async () => {
    var changePassword = await request({
        method: "POST",
        url: "http://localhost:8080/users/changePassword",
        body: {
            user: user,
            pass: pass
        },
        json: true,
        headers: {Cookie: "token=admin"}
    });

    console.log("Changed the password of \"" + user + "\" to \"" + pass + "\". Server responded with the following: " + changePassword);
})();
