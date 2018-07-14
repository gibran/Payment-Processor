/*eslint no-console: ["error", {allow: ["error"]}]*/

//Require the actual fs lib, along with path.
var fs = require("fs");
var path = require("path");
//Var for the paths passed in.
var paths;

//RAM cache for the users/array of all admins.
var users, admins;

//Loads the users from a dir.
async function loadFromDir(dir, admin) {
    //Read every file in the dir
    fs.readdir(dir, async (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        //Iterate through the files.
        for (var i in files) {
            //Skip past the file used to upload a folder to GitHub.
            if (files[i] === ".folder") {
                continue;
            }

            //Read the file.
            fs.readFile(path.join(dir, files[i]), async (err2, content) => {
                if (err2) {
                    console.error(err2);
                    return;
                }

                content = content.toString();
                //Create the user object, which is a salt an a hash keyed by the username.
                users[files[i].split(".json")[0]] = {
                    salt: content.substr(0, 32),
                    hash: content.substr(33, content.length)
                };

                if (admin) {
                    admins.push(files[i].split(".json")[0]);
                }
            });
        }
    });
}

//Loads the users from disk.
async function loadFromDisk() {
    //Clear the user cache.
    users = {};
    //Clear the admins array.
    admins = [];

    //Load from each of the dirs.
    await loadFromDir(paths.admins, true);
    await loadFromDir(paths.cashiers, false);
}

//Returns an user from the RAM cache.
async function load(user) {
    //Make sure the user exists.
    if (Object.keys(users).indexOf(user) === -1) {
        return false;
    }

    return users[user];
}

//Returns an array of all users.
async function list() {
    return Object.keys(users);
}

//Returns an array of all admins.
async function listAdmins() {
    return admins;
}

function isAdmin(user) {
    return admins.indexOf(user) > -1;
}

//Saves an user to disk.
async function save(config) {
    var user = config.user;
    var salt = config.salt;
    var hash = config.hash;

    var dir = paths.cashiers;
    if (config.admin) {
        dir = paths.admins;
    }

    //Write them to disk.
    fs.writeFile(path.join(dir, user + ".json"), salt + "|" + hash, async (err) => {
        if (err) {
            console.error(err);
        }
    });

    //Add them to the RAM cache.
    users[user] = {
        salt: salt,
        hash: hash
    };
}

//Promotes an user.
async function promote(user) {
    if ((typeof(users[user]) !== "object") || (isAdmin(user))) {
        return false;
    }

    fs.rename(path.join(paths.cashiers, user + ".json"), path.join(paths.admins, user + ".json"), async (err) => {
        if (err) {
            console.error(err);
        }
    });
    admins.push(user);
    return true;
}

//Demotes an user.
async function demote(user) {
    if ((typeof(users[user]) !== "object") || (isAdmin(user) === false)) {
        return false;
    }

    fs.rename(path.join(paths.admins, user + ".json"), path.join(paths.cashiers, user + ".json"), async (err) => {
        if (err) {
            console.error(err);
        }
    });
    admins.splice(admins.indexOf(user), 1);
    return true;
}

//Deletes an user.
async function remove(user) {
    var dir = paths.cashiers;
    if (admins.indexOf(user) > -1) {
        //Remove them from admins.
        admins.splice(admins.indexOf(user), 1);
        //Update dir to be the correct directory.
        dir = paths.admins;
    }

    //Delete their file.
    fs.unlink(path.join(dir, user), async (err) => {
        if (err) {
            console.error(err);
        }
    });

    //Delete them from the RAM cache.
    delete users[user];
}

module.exports = async (pathsArg) => {
    paths = pathsArg;

    //Start loading the users. Since it uses a callback, await is somewhat pointless.
    await loadFromDisk();

    return {
        load: load,

        list: list,
        listAdmins: listAdmins,
        isAdmin: isAdmin,

        save: save,
        promote: promote,
        demote: demote,
        remove: remove
    };
};
