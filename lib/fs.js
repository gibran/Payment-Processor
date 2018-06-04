var fs = require("fs");
var path = require("path");
var paths;

var users;

async function saveSettings(settings) {
    fs.writeFile(paths.settings, JSON.stringify(settings, null, 4), async()=>{});
}

async function saveOrder(address, order) {
    fs.writeFile(path.join(paths.orders.current, (address + ".json")), JSON.stringify(order, null, 4), async()=>{});
}

async function archiveOrder(address, order, success) {
    order.success = success;
    await saveOrder(address, order);

    fs.rename(path.join(paths.orders.current, (address + ".json")), path.join(paths.orders.archived, (address + ".json")), async()=>{});
}

async function loadUsersFromDisk() {
    fs.readdir(paths.users, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }

        for (var i in files) {
            fs.readFile(path.join(paths.users, files[i]), (err2, content) => {
                if (err2) {
                    console.log(err2);
                    return;
                }

                content = content.toString();
                users[files[i]] = {
                    salt: content.substr(0, 32),
                    hash: content.substr(33, content.length)
                }
            });
        }
    });
}

async function deleteUser(username) {

}

async function loadUser(username) {
    if (Object.keys(users).indexOf(username) === -1) {
        return false;
    }

    return users[username];
}

async function saveUser(username, salt, hash) {

}

module.exports = async (pathsArg) => {
    paths = pathsArg;

    users = {};
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
