//Require the actual fs lib, along with path.
var fs = require("fs");
var path = require("path");
//Var for the paths passed in.
var paths;

//RAM cache for the users.
var users;

//RAM cache of the products and recently bought products.
var products, boughtProducts;

//Saves the passed in argument to the settings files.
async function saveSettings(settings) {
    fs.writeFile(paths.settings, JSON.stringify(settings, null, 4), async (err) => {
        if (err) {
            console.log(err);
        }
    });
}

//Saves an order. The order is written to data/orders/current/ADDRESS.json.
async function saveOrder(address, order) {
    fs.writeFile(path.join(paths.orders.current, (address + ".json")), JSON.stringify(order, null, 4), async (err) => {
        if (err) {
            console.log(err);
        }
    });
}

//Moves an order from data/orders/current to data/orders/archived.
//Before moving it, fs marks the order as the success or failure.
async function archiveOrder(address, order, success) {
    order.success = success;
    await saveOrder(address, order);

    fs.rename(path.join(paths.orders.current, (address + ".json")), path.join(paths.orders.archived, (address + ".json")), async (err) => {
        if (err) {
            console.log(err);
        }
    });
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
                };
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

//Loads the products from disk.
async function loadProductsFromDisk() {
    products = [];
    boughtProducts = [];

    //Read every file in the users directory.
    fs.readdir(paths.products, async (err, files) => {
        if (err) {
            console.log(err);
            return;
        }

        //Iterate through the files.
        for (var i in files) {
            //Read the file.
            products.push(require(path.join(paths.products, files[i])));
        }
    });
}

//Returns the products RAM cache.
async function loadProducts() {
    return products;
}

//Save a product to a disk using the name stored in i (a nonce).
async function saveProduct(i, product) {
    fs.writeFile(path.join(paths.products, i + ".json"), JSON.stringify(product), async (err) => {
        if (err) {
            console.log(err);
        }
    });
}

//Save the products to disk as 0.json, 1.json, 2.json...
async function saveProducts() {
    //Reset products with unsaved purchases.
    boughtProducts = [];

    //Save each products.
    for (var i in products) {
        saveProduct(i, products[i]);
    }
}

//Deletes a product from the DB.
async function deleteProduct(i) {
    //If i is invalid, return false.
    if (i >= products.length) {
        return false;
    }

    //Else, splice it and resave the array.
    products.splice(i, 1);
    saveProducts();
    return true;
}

//Add a product to the db.
async function addProduct(product) {
    //It must be an object with a price. It doesn't need a name or assetPath (path to an image).
    if (typeof(product) !== "object") {
        return false;
    }
    if (typeof(product.name) !== "string") {
        product.name = "New Product";
    }
    if (typeof(product.assetPath) !== "string") {
        product.assetPath = "";
    }
    if (typeof(product.usdCost) !== "number") {
        return false;
    }

    //Listing time is now.
    product.start = (new Date()).getTime();
    //No purchases.
    product.purchases = [];

    //Push it and save the DB.
    products.push(product);
    saveProducts();

    return true;
}

//Product i had amount bought.
async function productBought(i, amount) {
    //Calculate how many days it has been since the product was listed.
    var now = (new Date()).getTime();
    var variance = now - products[i].start;
    var days = Math.floor(variance % (24*60*60*1000));

    //Make sure the array has the days to match the days it's been listed.
    while (products[i].purchases.length <= days) {
        products[i].purchases.push(0);
    }
    //Add the amount purchased.
    products[i].purchases[days] += amount;

    //If it isn't cued to be saved, cue it.
    if (boughtProducts.indexOf(i) === -1) {
        boughtProducts.push(i);
    }
}
//Save the products with new purchases every hour.
setInterval(async () => {
    for (var i in boughtProducts) {
        saveProduct(boughtProducts[i], products[boughtProducts[i]])
    }

    //Clear the boughtProducts array.
    boughtProducts = [];
}, 60*60*1000);

module.exports = async (pathsArg) => {
    paths = pathsArg;

    //Make sure we have the users ready.
    await loadUsersFromDisk();

    //Make sure we have the products ready.
    await loadProductsFromDisk();

    return {
        saveSettings: saveSettings,
        saveOrder: saveOrder,
        archiveOrder: archiveOrder,
        deleteUser: deleteUser,
        loadUser: loadUser,
        saveUser: saveUser,
        loadProducts: loadProducts,
        deleteProduct: deleteProduct,
        addProduct: addProduct,
        productBought: productBought
    };
}
