var request = require("request-promise");
(async () => {
    console.log(await request({
        //method: "POST",
        uri: "http://localhost:8080/getOrders",
        /*body: {
            amount: 0.3,
            note: "This is a test."
        },
        json: true*/
    }));
})();
