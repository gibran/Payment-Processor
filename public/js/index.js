async function init() {
    //Set the IOP prive var, populate the products table...
}

async function timeout() {
    if (
        (typeof(window.price.iop) === "undefined") ||
        (typeof(window.products.products) === "undefined")
    ) {
        setTimeout(timeout, 50);
        return;
    }

    init();
}
timeout();
