//fs and salt lib.
var fs, salt;

//Used to generate cookies.
var randstring = require("randomstring").generate;

//RAM cache of users who are logged in.
var cookies;

async function getUser(token) {
    return cookies[token];
}

//Returns if an user is logged in.
async function isLoggedIn(token) {
    return typeof(cookies[token]) === "string";
}

//Logs an user in.
async function login(user, pass) {
    //Load them from the filesystem.
    var data = await fs.load(user);
    //Return false if they don't exist.
    if (data === false) {
        return false;
    }

    //If they're login is valid...
    if (await salt.verify(pass, data.salt, data.hash)) {
        //If they're valid, generate a token for them.
        var token;
        do {
            token = randstring();
        } while (typeof(cookies[token]) === "object");

        //Store their login in the RAM cache.
        cookies[token] = user;

        //Set a timeout to delete the token after 24 hours.
        setTimeout(async () => {
            delete cookies[token];
        }, 24*60*60*1000);

        //Return the token.
        return token;
    }

    return false;
}

async function deleteToken(token) {
    delete cookies[token];
    return true;
}

async function deleteUser(user) {
    //Iterate through every token.
    for (var i in cookies) {
        //If they match, delete the token.
        if (cookies[i].user === user) {
            delete cookies[i];
            //Since we allow multiple logins, do not break.
        }
    }
}

module.exports = async (fsArg, saltArg) => {
    //Set the fs and salt vars.
    fs = fsArg;
    salt = saltArg;

    //Init the cookies var.
    cookies = {};

    return {
        getUser: getUser,
        isLoggedIn: isLoggedIn,
        login: login,
        deleteToken: deleteToken,
        deleteUser: deleteUser
    };
};
