var request = require("request-promise");

var login = require("../users/login.js");

module.exports = async (token) => {
    var res = await request({
        method: "GET",
        url: "http://localhost:8080/products/list",
        headers: {Cookie: "token=" + token}
    });

    /*eslint-disable-next-line no-console*/
    console.log(res);
};

(async () => {
    if (require.main === module) {
        module.exports(await login("admin", "pass"));
    }
})();
