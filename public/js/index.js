var usd = 0;

async function updateTotals() {
    //Update the USD HTML.
    document.getElementById("usdTotalNum").innerHTML = usd;

    //Iterate over every product to get the array of what we're buying.
    var buying = [];
    for (var i in window.products.products) {
        for (var x = 0; x < window.products.products[i].cart; x++) {
            buying.push(parseInt(i));
        }
    }
    //Submit it to the server.
    await window.products.calculate(buying);

    //When we get a response...
    async function updateIOP() {
        if (typeof(window.products.price) === "undefined") {
            setTimeout(updateIOP, 10);
            return;
        }

        //Update the IOP price HTML.
        document.getElementById("iopTotalNum").innerHTML = window.products.price;
    }
    setTimeout(updateIOP, 10);
}

async function add(i) {
    //Add 1 to the amount of the product in the cart. Then, update the HTML.
    window.products.products[i].cart++;
    document.getElementById("product-" + i).innerHTML = window.products.products[i].cart;

    //Update the totals;
    usd += window.products.products[i].usdCost;
    updateTotals();
}

async function subtract(i) {
    //If the amount is 0, do nothing. You can't have negative items.
    if (window.products.products[i].cart === 0) {
        return;
    }
    //Subtract 1 to the amount of the product in the cart. Then, update the HTML.
    window.products.products[i].cart--;
    document.getElementById("product-" + i).innerHTML = window.products.products[i].cart;

    //Update the totals.
    usd -= window.products.products[i].usdCost;
    updateTotals();
}

async function order() {
    var customAmount = parseFloat(document.getElementById("customAmountInput").value);
    var buying;

    if (customAmount > 0) {
        window.products.price = parseFloat(await window.price.usdToIOP(customAmount));
    } else {
        buying = [];
        for (var i in window.products.products) {
            for (; window.products.products[i].cart > 0; window.products.products[i].cart--) {
                buying.push(parseInt(i));
            }
            delete window.products.products[i].cart;
        }

        if (buying.length === 0) {
            alert("The cart is empty.");
            return;
        }

        window.products.calculate(buying);
    }

    //Wait to get the price...
    async function placeOrder() {
        if (typeof(window.products.price) === "undefined") {
            setTimeout(placeOrder, 50);
            return;
        }

        window.orders.create(window.products.price, "Sale made by " + window.user + ".", buying);

        async function handleOrder() {
            if (typeof(window.orders.address) === "undefined") {
                setTimeout(handleOrder, 50);
                return;
            }

            if (window.orders.address === false) {
                alert("Order creation failed.");
                return;
            }

            window.location.href = "/order.html?address=" + window.orders.address;
        }
        handleOrder();
    }
    placeOrder();
}

async function init() {
    //If the table is bigger than 3x3, make it scrollable.
    if (window.products.products.length > 9) {
        document.getElementById("productsDiv").style["overflow-y"] = "scroll";
    }
    //Get the table. Create arrays for the rows and cells.
    var table = document.getElementById("products");
    var rows = [];
    var cells = [];

    //Create all the rows.
    var i;
    for (i = 0; i < Math.ceil(window.products.products.length / 3); i++) {
        rows.push(document.createElement("tr"));
    }
    //Create all the cells.
    for (i = 0; i < window.products.products.length; i++) {
        cells.push(document.createElement("td"));
        //Set the cells to say the product's name, cost, amount in cart, and have buttons to add/remove it from the cart.
        cells[i].innerHTML = `
            <div>
                <img src="/img/products/${window.products.products[i].assetPath}" class="productImg"></img>
                <br>
                ${window.products.products[i].name}: $${window.products.products[i].usdCost}
                <br>
                <button type="button" onclick="subtract(${i})">-</button> Quantity: <span id="product-${i}">0</span> <button type="button" onclick="add(${i})">+</button>
            </div>
        `;

        //While we're here, set the amount of each product in the cart to 0.
        window.products.products[i].cart = 0;
    }

    //Put the cells in the rows, and the rows in the table.
    for (i in cells) {
        rows[Math.floor(i / 3)].appendChild(cells[i]);
        table.appendChild(rows[Math.floor(i / 3)]);
    }
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
