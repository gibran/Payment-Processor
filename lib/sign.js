var randstring = require("randomstring").generate;

var routes = [
    "/iop/price",
    "/users/list",
    "/orders/active",
    "/orders/succeeded",
    "/orders/failed",
    "/products/list"
];

var challenges = [];
async newChallenge(res) {
    //Create a new challenge.
    var challenge = randstring();
    challenges.push(challenge);

    //Set it to be deleted in 1 minute.
    setTimeout(async () => {
        var i = challenges.indexOf(challenge);
        if (i > -1) {
            challenges.splice(i, 1);
        }
    }, 60*1000);

    res.end(challenge);
},

module.exports = {
    middleware: (req, res, next) => {
        if (req.method === "GET") {
            if (req.url === "/challenge/new") {
                newChallenge(res);
                return;
            }

            if (routes.indexOf(req.url) > -1) {
                //Check if GET argument had a signed challenge.
                if (true) {
                    //If so, delete the challenge.
                    next();
                    return;
                } else {
                    res.end("You didn't provide a challenge.");
                }
            }
        } else if (req.method === "POST") {
            //req.body.challenge
        }
    }
};
