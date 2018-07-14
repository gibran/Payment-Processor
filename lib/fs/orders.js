/*eslint no-console: ["error", {allow: ["error"]}]*/

//Require the actual fs lib, along with path.
var fs = require("fs");
var path = require("path");
//Var for the paths passed in.
var paths;

var last = false;
//Loads the previous current orders from the disk.
async function loadFromDisk() {
    //Read every file in the users directory.
    fs.readdir(paths.current, async (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        //Iterate through the files.
        var buffer = {};
        for (var i in files) {
            //Don't read the file used to upload the folder to GitHub.
            if (files[i] === ".folder") {
                continue;
            }

            //Read the file.
            buffer[files[i].split(".json")[0]] = require(path.join(paths.current, files[i]));
        }

        last = buffer;
    });
}

async function getLastorders() {
    return last;
}

//Saves an order. The order is written to data/orders/current/ADDRESS.json.
async function save(address, order) {
    fs.writeFile(path.join(paths.current, (address + ".json")), JSON.stringify(order, null, 4), async (err) => {
        if (err) {
            console.error(err);
        }
    });
}

//Moves an order from data/orders/current to data/orders/archived.
//Before moving it, fs marks the order as the success or failure.
async function archive(address, order, success) {
    order.success = success;
    await save(address, order);

    fs.rename(path.join(paths.current, (address + ".json")), path.join(paths.archived, (address + ".json")), async (err) => {
        if (err) {
            console.error(err);
        }
    });
}

module.exports = async (pathsArg) => {
    paths = pathsArg;

    loadFromDisk();

    return {
        getLastorders: getLastorders,
        save: save,
        archive: archive
    };
};
