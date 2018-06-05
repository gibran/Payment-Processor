var request = require("request-promise");
(async () => {
    var address = await request({
        method: "POST",
        url: "http://localhost:8080/orders/new",
        body: {
            amount: 0.3,
            note: "This is a test."
        },
        json: true,
        headers: {Cookie: "token=admin"}
    });
    console.log("Created a new order. It's address is " + address + " and it expects 0.3 IOP.");
})();
