var request = require("request-promise");

var user = "adminTwo";

(async () => {
    var deleted = await request({
        method: "POST",
        url: "http://localhost:8080/users/delete",
        body: {
            user: user
        },
        json: true,
        headers: {Cookie: "token=admin"}
    });

    if (deleted) {
        /*eslint-disable-next-line no-console*/
        console.log("Deleted the user with an username of \"" + user + "\". Please verify they're deleted by failing to login with their credentials.");
        return;
    }
    /*eslint-disable-next-line no-console*/
    console.log("Failed to delete the user. Was the username or token invalid?");
})();
