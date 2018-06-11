//Needed libs.
var salt = require("./salt.js"), fs;

//Used to generate cookies.
var randstring = require("randomstring").generate;

//RAM cache of users who are logged in.
var cookies;

//Create a new user.
//This isn't in the below object because below functions calll it.
async function newUser(user, pass) {
    //Make sure their username doesn't have .. or " or any volatile symbols.
    if (!(/^[a-zA-Z]+$/i.test(user))) {
        console.log("Username failed the safety checks.");
        return false;
    }

    //Salt their password.
    var data = await salt.create(pass);
    //Save the user to disk.
    await fs.accounts.save(user, data.salt, data.hash);

    return true;
}

//Logs an user out.
//This isn't in the below object because below functions calll it.
async function logout(user) {
    //Iterate through every token.
    for (var i in cookies) {
        //If they match, delete the token.
        if (cookies[i].user === user) {
            delete cookies[i];
            //Since we allow multiple logins, do not break.
        }
    }
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
//Not in the below object because it shouldn't be exported.
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

    cookies = {};

    return {
        newUser: newUser,

        //Validate a login.
        login: async (user, pass) => {
            //Load them from the RAM cache.
            var data = await fs.accounts.load(user);
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

                //Store their login in the RAM cache.
                cookies[token] = {
                    user: user
                };

                //Set a timeout to delete the token after 24 hours.
                setTimeout(async () => {
                    delete cookies[token];
                }, 24*60*60*1000);

                //Return the token.
                return token;
            }

            return false;
        },

        //The UI knows the token, not the username. Hence this function.
        //We could get the token and call the existing function...
        //Which would just find the token again...
        //Or we can do this one line delete.
        logout: async (token) => {
            delete cookies[token];
            return true;
        },

        //Change a password.
        changePassword: async (user, pass) => {
            //Make sure the account exists.
            if ((await fs.accounts.load(user)) === false) {
                return false;
            }
            //Delete and recreate the user.
            await fs.accounts.remove(user);
            await newUser(user, pass);
            return true;
        },

        //Delete the user.
        deleteUser: async (user) => {
            //Make sure the account exists.
            if ((await fs.accounts.load(user)) === false) {
                return false;
            }

            //Log them out.
            logout(user);

            //Delete the user.
            await fs.accounts.remove(user);
            return true;
        },

        //fs passthrough of getting an array of all users.
        list: async () => {
            return (await fs.accounts.list());
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
