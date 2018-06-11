var request = require("request-promise");

var login = require("../users/login.js");

module.exports = async (token) => {
    var res = await request({
        method: "POST",
        url: "http://localhost:8080/products/delete",
        body: {
            index: 1,
            name: "Product 2"
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
