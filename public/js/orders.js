async function createRow(data) {
    var addressCell = document.createElement("td");
    addressCell.innerHTML = `<a href="/order.html?address=${data.address}">${data.address}</a>`;

    var noteCell = document.createElement("td");
    noteCell.innerHTML = data.note;

    var amountCell = document.createElement("td");
    amountCell.innerHTML = data.amount;

    var timeCell = document.createElement("td");
    timeCell.innerHTML = data.time;

    var row = document.createElement("tr");
    row.appendChild(addressCell);
    row.appendChild(noteCell);
    row.appendChild(amountCell);
    row.appendChild(timeCell);

    return row;
}

async function init() {
    var pending = document.getElementById("pending");
    var succeeded = document.getElementById("succeeded");
    var failed = document.getElementById("failed");

    var address, order, i;
    for (address in window.orders.active) {
        order = window.orders.active[address];
        pending.appendChild(
            await createRow({
                address: address,
                note: order.note,
                time: (new Date(order.time)).toString().split("GMT")[0],
                amount: await window.price.format(order.usd)
            })
        );
    }

    for (address in window.orders.succeeded) {
        order = window.orders.succeeded[address];
        succeeded.appendChild(
            await createRow({
                address: address,
                note: order.note,
                amount: await window.price.format(order.usd),
                time: (new Date(order.time)).toString().split("GMT")[0]
            })
        );
    }

    for (address in window.orders.failed) {
        order = window.orders.failed[address];
        failed.appendChild(
            await createRow({
                address: address,
                note: order.note,
                time: (new Date(order.time)).toString().split("GMT")[0],
                amount: await window.price.format(order.usd)
            })
        );
    }
}

//Wait until we have the price and orders...
async function timeout() {
    if (
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
