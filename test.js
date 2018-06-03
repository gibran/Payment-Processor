var request = require("request-promise");
(async () => {
    var address = await request({
        method: "POST",
        uri: "http://localhost:8080/new",
        body: {
            amount: 0.3,
            note: "This is a test."
        },
        json: true
    });
    console.log(await request({
        uri: "http://localhost:8080/getOrders"
    }));
    console.log(await request({
        method: "POST",
        uri: "http://localhost:8080/cancel",
        body: {
            address: address
        },
        json: true
    }));
})();
