/*eslint no-console: ["error", {allow: ["error"]}]*/

//Require the actual fs lib, along with path.
var fs = require("fs");
var path = require("path");
//Var for the path passed in.
var productsDir;

//RAM cache of the products and recently bought products.
var products, boughtProducts;

//Loads the products from disk.
async function loadFromDisk() {
    products = [];
    boughtProducts = [];

    //Read every file in the users directory.
    fs.readdir(productsDir, async (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        //Iterate through the files.
        for (var i in files) {
            //Read the file.
            products.push(require(path.join(productsDir, files[i])));
        }
    });
}

//Save a product to a disk using the name stored in i (a nonce).
async function save(i, product) {
    fs.writeFile(path.join(productsDir, i + ".json"), JSON.stringify(product), async (err) => {
        if (err) {
            console.error(err);
        }
    });
}

//Save the products to disk as 0.json, 1.json, 2.json...
async function saveAll() {
    //Reset products with unsaved purchases.
    boughtProducts = [];

    //Save each products.
    for (var i in products) {
        save(i, products[i]);
    }
}

//Returns the products RAM cache.
async function load() {
    return products;
}

//Add a product to the db.
async function add(product) {
    //It must be an object with a price. It doesn't need a name or assetPath (path to an image).
    if (typeof(product) !== "object") {
        return false;
    }
    if (typeof(product.name) !== "string") {
        return false;
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
    saveAll();

    return true;
}

//Deletes a product from the DB.
async function remove(i, name) {
    //If i is invalid, return false.
    if (i >= products.length) {
        return false;
    }

    //If the name doesn't match up, return false.
    if (products[i].name !== name) {
        return false;
    }

    //Else, delete the last file, splice the product, and resave the array.
    fs.unlink(path.join(productsDir, (products.length-1) + ".json"), async (err) => {
        if (err) {
            console.error(err);
        }
    });
    products.splice(i, 1);
    saveAll();
    return true;
}

//Product i had amount bought.
async function bought(i, amount) {
    //Calculate how many days it has been since the product was listed.
    var now = (new Date()).getTime();
    var variance = now - products[i].start;
    var days = Math.floor(variance / (24*60*60*1000));

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
        save(boughtProducts[i], products[boughtProducts[i]]);
    }

    //Clear the boughtProducts array.
    boughtProducts = [];
}, 60*60*1000);

module.exports = async (productsDirArg) => {
    productsDir = productsDirArg;

    //Make sure we have the products ready.
    await loadFromDisk();

    return {
        load: load,
        add: add,
        remove: remove,
        bought: bought
    };
};
