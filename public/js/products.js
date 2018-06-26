async function newProduct() {
    window.location.href = "/product.html";
}

async function deleteProduct(index, name) {
    window.products.delete(index, name);
}

async function createRow(data) {
    var assetCell = document.createElement("td");
    assetCell.innerHTML = `<img src="/img/products/${data.asset}" class="productImg"></img>`;

    var nameCell = document.createElement("td");
    nameCell.innerHTML = `<a href="/product.html?index=${data.index}">${data.name}</a>`;

    var priceCell = document.createElement("td");
    priceCell.innerHTML = data.price;

    var deleteCell = document.createElement("td");
    deleteCell.innerHTML = `<button type="button" onclick="deleteProduct(${data.index}, '${data.name}')" class="deleteButton">Delete</button>`;

    var row = document.createElement("tr");
    row.appendChild(assetCell);
    row.appendChild(nameCell);
    row.appendChild(priceCell);
    row.appendChild(deleteCell);

    return row;
}

async function init() {
    if (Object.keys(window.products.products).length > 5) {
        document.getElementById("productsDiv").style["overflow-y"] = "scroll";
    }

    var products = document.getElementById("products");
    for (var i in window.products.products) {
        products.appendChild(
            await createRow({
                index: i,
                name: window.products.products[i].name,
                asset: window.products.products[i].assetPath,
                price: window.products.products[i].usdCost
            })
        );
    }
}

//Wait until we have the price and products...
async function timeout() {
    if (typeof(window.products.products) === "undefined") {
        setTimeout(timeout, 50);
        return;
    }

    init();
}
timeout();
