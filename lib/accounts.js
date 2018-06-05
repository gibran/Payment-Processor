//Needed libs.
var salt = require("./salt.js"), fs;

//Used to generate cookies.
var randstring = require("randomstring").generate;

//RAM cache of users who are logged in.
var cookies = {
    admin: {
        user: "admin",
        time: (new Date()).getTime()
    }
};

//Create a new user. This isn't in the below object because below functions calll it.
async function newUser(user, pass) {
    //Make sure their username doesn't have .. or " or any volatile symbols.
    if (!(/^[a-zA-Z]+$/i.test(user))) {
        console.log("Username failed the safety checks.");
        return false;
    }

    //Salt their password.
    var data = await salt.create(pass);
    //Save the user to disk.
    await fs.saveUser(user, data.salt, data.hash);

    return true;
}

//Files never to block access to. CSS, JS, and photos.
var assetFileEndings = [
    "css",
    "js",
    "png",
    "jpg",
    "jpeg",
    "ico"
];
//Function that tells you if an url points to an asset or not.
async function isAsset(url) {
    //Iterate through the asset file endings.
    for (var i in assetFileEndings) {
        var ending = "." + assetFileEndings[i];
        //See if the url ends in that ending.
        if (url.substr(0 - ending.length, ending.length) === ending) {
            //If so, return true.
            return true;
        }
    }

    //If not, return false.
    return false;
}

module.exports = (fsArg) => {
    //Set the fs lib var.
    fs = fsArg;

    return {
        newUser: newUser,

        //Validate a login.
        login: async (user, pass) => {
            //Load them from the RAM cache.
            var data = await fs.loadUser(user);
            //Return false if they don't exist.
            if (data === false) {
                return false;
            }
            //Check their login.
            if (await salt.verify(pass, data.salt, data.hash)) {
                //If they're valid, generate a token for them.
                var token;
                do {
                    token = randstring();
                } while (typeof(cookies[token]) === "object");

                //Store their login in the RAM cache and return the token.
                cookies[token] = {
                    user: user,
                    time: (new Date()).getTime()
                };
                return token;
            }

            return false;
        },

        //Change a password.
        changePassword: async (user, pass) => {
            //Make sure the account exists.
            if ((await fs.loadUser(user)) === false) {
                return false;
            }
            //Delete and recreate the user.
            await fs.deleteUser(user);
            await newUser(user, pass);
            return true;
        },

        //Delete the user.
        deleteUser: async (user) => {
            //Make sure the account exists.
            if ((await fs.loadUser(user)) === false) {
                return false;
            }
            //Delete the user.
            await fs.deleteUser(user);
            return true;
        },

        middleware: async (req, res, next) => {
            //If the user isn't logged in...
            if (typeof(cookies[req.cookies.token]) !== "object") {
                //And they're trying to get a web page/data...
                if (req.method === "GET") {
                    //And it's not an asset or the login page...
                    if ((!(await isAsset(req.url))) && (req.url !== "/login.html")) {
                        //Give them the login page.
                        res.redirect("/login.html");
                        return;
                    }
                }

                //If they're trying to edit data...
                if (req.method === "POST") {
                    //And they're not trying to login...
                    if (req.url !== "/users/login") {
                        //Give them an error and end the request.
                        res.end("You are not logged in.");
                        return;
                    }
                }
            }

            //If it made past all that, move on.
            next();
        }
    };
}
