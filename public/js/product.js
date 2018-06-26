async function newProduct() {
    window.location.href = "";
}

async function init() {

}

//Wait until we have the price and products...
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
