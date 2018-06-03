var request = require("request-promise");
request({
    method: "POST",
    uri: "http://localhost:8080/new",
    body: {
        amount: 0.3,
        note: "This is a test."
    },
    json: true
});
