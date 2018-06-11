//Import all of this modules submodules.
var orders = require("./fs/orders.js");
var products = require("./fs/products.js");
var accounts = require("./fs/accounts.js");
var settings = require("./fs/settings.js");

module.exports = async (paths) => {
    //Init each of the submodules.
    orders = await orders(paths);
    products = await products(paths);
    accounts = await accounts(paths);
    settings = await settings(paths);

    return {
        orders: orders,
        accounts: accounts,
        products: products,
        settings: settings
    };
}
