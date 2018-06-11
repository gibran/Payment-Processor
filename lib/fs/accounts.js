//Require the actual fs lib, along with path.
var fs = require("fs");
var path = require("path");
//Var for the paths passed in.
var paths;

//RAM cache for the users.
var users;

//Loads the users from disk.
async function loadFromDisk() {
    //Clear the user cache.
    users = {};

    //Read every file in the users directory.
    fs.readdir(paths.users, async (err, files) => {
        if (err) {
            console.log(err);
            return;
        }

        //Iterate through the files.
        for (var i in files) {
            //Read the file.
            fs.readFile(path.join(paths.users, files[i]), async (err2, content) => {
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
            });
        }
    });
}

//Returns an user from the RAM cache.
async function load(user) {
    //Make sure the user exists.
    if (Object.keys(users).indexOf(user) === -1) {
        return false;
    }

    return users[user];
}

//Saves an user to disk.
async function save(user, salt, hash) {
    //Write them to disk.
    fs.writeFile(path.join(paths.users, user), salt + "|" + hash, async (err) => {
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
    //Delete their file.
    fs.unlink(path.join(paths.users, user), async (err) => {
        if (err) {
            console.log(err);
        }
    });
    //Delete them from the RAM cache.
    delete users[user];
}

//Returns an array of all users.
async function list() {
    return Object.keys(users);
}

module.exports = async (pathsArg) => {
    paths = pathsArg;

    //Make sure we have the users ready.
    await loadFromDisk();

    return {
        load: load,
        save: save,
        remove: remove,
        list: list
    };
}
