//fs and emitter.
var fs, emitter;

//RAM cache of orders -> products.
var orders;

module.exports = async (settings) => {
    //Set the vars in settings.
    fs = settings.fs;
    emitter = settings.emitter;

    //Init the orders cache.
    orders = {};

    //When an order succeeds, mark the products as bought.
    emitter.on("success", async (address) => {
        await fs.bought(orders[address]);
    });

    return {
        //Handles a new order.
        new: async (address, order, products) => {
            //Put it in our RAM cache.
            orders[address] = products;

            //Load the cart.
            var productsDB = await fs.load();
            //Add a product object to the order.
            order.products = {};

            var name;
            //For each product...
            for (var i in products) {
                //Skip it if it's invalid.
                if (typeof(productsDB[i]) === "undefined") {
                    continue;
                }

                //Get it's name.
                name = productsDB[products[i]].name;
                //If it's not already in the order's products object, define it.
                if (typeof(order.products[name]) === "undefined") {
                    order.products[name] = 0;
                }
                //Increase the amount of time the product was ordered.
                order.products[name]++;
            }

            //Emit an update event with the updated order.
            emitter.emit("update", address, order);
        }
    };
};
