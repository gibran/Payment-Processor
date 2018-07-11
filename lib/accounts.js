//FS lib.
var fs;

//Account subsublibraries.
var salt = require("./accounts/salt.js");
var cookies = require("./accounts/cookies.js");

//Account sublibraries.
var users = require("./accounts/users.js");
var web = require("./accounts/web.js");

module.exports = async (fsArg) => {
    //Set the fs var.
    fs = fsArg;

    //Init all the account subsub and sublibraries.
    cookies = await cookies(fs, salt);
    users = await users(fs, salt, cookies);
    web = await web(fs, cookies);

    return {
        login: cookies.login,
        logout: cookies.deleteToken,

        newUser: users.new,
        changePassword: users.changePassword,
        promote: users.promote,
        demote: users.demote,
        deleteUser: users.delete,

        list: users.list,
        listAdmins: users.listAdmins,

        middlewares: {
            user: web.user,
            admin: web.admin
        }
    };
};
