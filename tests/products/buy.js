var request = require("request-promise");

var login = require("../users/login.js");

module.exports = async (token) => {
    var res = await request({
        method: "POST",
        url: "http://localhost:8080/products/buy",
        body: [
            0,
            1,
            0,
            1,
            0
        ],
        json: true,
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
