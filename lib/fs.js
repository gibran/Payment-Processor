//Require the actual fs lib, along with path.
var fs = require("fs");
var path = require("path");
//Var for the paths passed in.
var paths;

//RAM cache for the users.
var users;

//Saves the passed in argument to the settings files.
async function saveSettings(settings) {
    fs.writeFile(paths.settings, JSON.stringify(settings, null, 4), async()=>{});
}

//Saves an order. The order is written to data/orders/current/ADDRESS.json.
async function saveOrder(address, order) {
    fs.writeFile(path.join(paths.orders.current, (address + ".json")), JSON.stringify(order, null, 4), async()=>{});
}

//Moves an order from data/orders/current to data/orders/archived.
//Before moving it, fs marks the order as the success or failure.
async function archiveOrder(address, order, success) {
    order.success = success;
    await saveOrder(address, order);

    fs.rename(path.join(paths.orders.current, (address + ".json")), path.join(paths.orders.archived, (address + ".json")), async()=>{});
}

//Loads the users from disk.
async function loadUsersFromDisk() {
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
                }
            });
        }
    });
}

//Deletes an user.
async function deleteUser(user) {
    //Delete their file.
    fs.unlink(path.join(paths.users, user), async (err) => {
        if (err) {
            console.log(err);
        }
    });
    //Delete them from the RAM cache.
    delete users[user];
}

//Returns an user from the RAM cache.
async function loadUser(user) {
    //Make sure the user exists.
    if (Object.keys(users).indexOf(user) === -1) {
        return false;
    }

    return users[user];
}

//Saves an user to disk.
async function saveUser(user, salt, hash) {
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

module.exports = async (pathsArg) => {
    paths = pathsArg;

    //make sure we have the users ready.
    await loadUsersFromDisk();

    return {
        saveSettings: saveSettings,
        saveOrder: saveOrder,
        archiveOrder: archiveOrder,
        deleteUser: deleteUser,
        loadUser: loadUser,
        saveUser: saveUser
    };
}
