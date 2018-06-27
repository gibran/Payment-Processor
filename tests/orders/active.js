var request = require("request-promise");

async function createOrder(amount) {
    amount = parseFloat(amount.toPrecision(4));
    return await request({
        method: "POST",
        url: "http://localhost:8080/orders/new",
        body: {
            amount: amount,
            note: ("This is a test for " + amount + " IOP.")
        },
        json: true,
        headers: {Cookie: "token=admin"}
    });
}

(async () => {
    var orders = {};
    for (var i = 1; i <= 5; i++) {
        orders[await createOrder(i*0.1)] = (i*0.1);
    }
    /*eslint-disable-next-line no-console*/
    console.log("Created five new orders. They were stored {address: amount}. Here they are.");
    /*eslint-disable-next-line no-console*/
    console.log(JSON.stringify(orders, null, 4));

    /*eslint-disable-next-line no-console*/
    console.log("Now, let's get the orders.");
    var getOrders = JSON.parse(await request({
        url: "http://localhost:8080/orders/active",
        headers: {Cookie: "token=admin"}
    }));
    /*eslint-disable-next-line no-console*/
    console.log("Printing the response...");
    /*eslint-disable-next-line no-console*/
    console.log(JSON.stringify(getOrders, null, 4));
})();
