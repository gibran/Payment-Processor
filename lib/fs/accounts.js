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
            console.log(err);
            return;
        }

        //Iterate through the files.
        for (var i in files) {
            //Read the file.
            fs.readFile(path.join(dir, files[i]), async (err2, content) => {
                if (err2) {
                    console.log(err2);
                    return;
                }

                content = content.toString();
                //Create the user object, which is a salt an a hash keyed by the username.
                users[files[i]] = {
                    salt: content.substr(0, 32),
                    hash: content.substr(33, content.length)
                };

                if (admin) {
                    admins.push(files[i]);
                }
            });
        }
    });
}

//Loads the users from disk.
async function loadFromDisk() {
    //Clear the user cache.
    users = {};

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
    fs.writeFile(path.join(dir, user), salt + "|" + hash, async (err) => {
        if (err) {
            console.log(err);
        }
    });

    //Add them to the RAM cache.
    users[user] = {
        salt: salt,
        hash: hash
    }
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
            console.log(err);
        }
    });

    //Delete them from the RAM cache.
    delete users[user];
}

module.exports = async (pathsArg) => {
    paths = pathsArg;

    admins = [];

    //Start loading the users. Since it uses a callback, await is somewhat pointless.
    await loadFromDisk();

    return {
        load: load,
        list: list,
        listAdmins: listAdmins,
        isAdmin: isAdmin,
        save: save,
        remove: remove
    };
}
