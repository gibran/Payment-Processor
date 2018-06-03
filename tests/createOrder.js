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
    console.log("Created a new order. It's address is " + address + " and it expects 0.3 IOP.");
})();
