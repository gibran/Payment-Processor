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
    console.log("Created the order with address " + address + ". Proof is in getOrders: ");
    console.log(JSON.stringify(JSON.parse(await request({
        url: "http://localhost:8080/orders/active",
        headers: {Cookie: "token=admin"}
    }))));
    console.log("");
    console.log("Cancelling the order... result: " + (await request({
        method: "POST",
        url: "http://localhost:8080/orders/cancel",
        body: {
            address: address
        },
        json: true,
        headers: {Cookie: "token=admin"}
    })));
})();
