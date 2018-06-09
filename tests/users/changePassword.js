var request = require("request-promise");

var login = require("./login.js");

module.exports = async (token, user, pass) => {
    var changePassword = await request({
        method: "POST",
        url: "http://localhost:8080/users/changePassword",
        body: {
            user: user,
            pass: pass
        },
        json: true,
        headers: {Cookie: "token=" + token}
    });

    console.log("Changed the password of \"" + user + "\" to \"" + pass + "\". Server responded with the following: " + changePassword);
};

(async () => {
    if (require.main === module) {
        module.exports(await login("admin", "pass"), "admin", "pass");
    }
})();
