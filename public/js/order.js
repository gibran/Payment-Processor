var address, order, status;

async function cancel() {
    if (status !== "Pending") {
        alert("This order can't be cancelled.");
        return;
    }

    window.orders.cancel(address);
    setTimeout(async () => {
        window.location.href = window.location.href;
    }, 100);
}

async function paidInCash() {

}

async function done() {
    window.location.href = "/";
}

async function init() {
    address = window.location.search.substr(1).split("address=")[1].split("&")[0];
    document.getElementById("address").innerHTML = address;

    order =
        window.orders.active[address] ||
        window.orders.succeeded[address] ||
        window.orders.failed[address];

    status =
        (window.orders.active[address] ? "Pending" : null) ||
        (window.orders.succeeded[address] ? "Succeeded" : null) ||
        (window.orders.failed[address] ? "Failed" : null);

    document.getElementById("status").innerHTML = status;
    switch (status) {
        case "Pending":
            document.getElementById("statusDiv").style.background = "#6ac6d9";
            break;

        case "Succeeded":
            document.getElementById("statusDiv").style.background = "lightgreen";
            break;

        case "Failed":
            document.getElementById("statusDiv").style.background = "red";
            break;
    }

    document.getElementById("date").innerHTML = (new Date(order.time)).toString().split("GMT")[0];
    document.getElementById("usd").innerHTML = await window.price.format(order.usd);
    document.getElementById("iopPayment").innerHTML = await window.price.format(order.amount);
    document.getElementById("iopNow").innerHTML = await window.price.usdToIOP(order.usd);
    document.getElementById("note").innerHTML = order.note;
}

//Wait until we have the price and orders...
async function timeout() {
    if (
        (typeof(window.price.iop) === "undefined") ||
        (typeof(window.orders.active) === "undefined") ||
        (typeof(window.orders.succeeded) === "undefined") ||
        (typeof(window.orders.failed) === "undefined")
    ) {
        setTimeout(timeout, 50);
        return;
    }

    init();
}
timeout();
