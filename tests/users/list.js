var request = require("request-promise");

var login = require("./login.js");

module.exports = async (token) => {
    var res = await request({
        method: "GET",
        url: "http://localhost:8080/users/list",
        headers: {Cookie: "token=" + token}
    });

    console.log(res);
};

(async () => {
    if (require.main === module) {
        module.exports(await login("admin", "pass"));
    }
})();
