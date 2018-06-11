var request = require("request-promise");

var login = require("../users/login.js");

module.exports = async (token) => {
    var res = await request({
        method: "POST",
        url: "http://localhost:8080/products/buy",
        body: {
            products: [0, 1, 0, 1, 0]
        },
        json: true,
        headers: {Cookie: "token=" + token}
    });

    console.log(res);
};

(async () => {
    if (require.main === module) {
        module.exports(await login("admin", "pass"));
    }
})();
