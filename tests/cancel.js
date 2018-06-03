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
    console.log("Created the order with address " + address + ". Proof is in getOrders: ");
    console.log(JSON.stringify(JSON.parse(await request({
        uri: "http://localhost:8080/getOrders"
    }))));
    console.log("");
    console.log("Cancelling the order... result: " + (await request({
        method: "POST",
        uri: "http://localhost:8080/cancel",
        body: {
            address: address
        },
        json: true
    })));
})();
