var request = require("request-promise");
(async () => {
    var price = await request({
        url: "http://localhost:8080/iop/price",
        headers: {Cookie: "token=admin"}
    });
    /*eslint-disable-next-line no-console*/
    console.log("The IOP price, according to the server, is " + price + ".");
})();
