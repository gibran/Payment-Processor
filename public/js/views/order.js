var getIopCurrentlyPrice = function () {
    var success = function (response) {
        var data = parseFloat(response);

        window.iopUnitPrice = data;
        $('#iopCurrentlyPrice').text('$ ' + window.iopUnitPrice.toFixed(2));
    }

    var error = function (response) {
        return false;
    }

    GET("/iop/price", null, success, error);
}

var confirmedPay = function () {
    $('[data-popup=popup-1]').fadeOut(350);
}

var generateIoPAddressToPay = function(iopCost){
    var success = function (response) {
        var data = response;

        if (data) {
            $(`#confirmItems`).text(window.orderedList.length);
            $(`#confirmUsdCost`).text(`$` + window.usdTotal);
            $(`#confirmIopPrice`).text(iopCost);

            $('[data-popup=popup-1]').fadeIn(350);
            qrcode.makeCode(data);
            $('#address').text(data);

        } else {
            alert('Error');
        }
    }

    var error = function (response) {
        return false;
    }

    var message = {
        amount: iopCost,
        note: `Product sale by ${localStorage.getItem('USERNAME')}`
    };

    POST("/orders/new", message, success, error);
}

var confirmedOrder = function () {
    var success = function (response) {
        var data = response;

        if (data) {
            generateIoPAddressToPay(data);
        } else {
            alert('Error');
        }
    }

    var error = function (response) {
        return false;
    };

    var orderedProducts = [];


    window.orderedList.forEach(item => {
        for (let index = 0; index < item.qtd; index++) {
            orderedProducts.push(item.productId);
        }
    });

    POST("/products/buy", orderedProducts, success, error);
}

var loadCart = function(products){
    if (typeof(window.iopUnitPrice) === "undefined") {
        setTimeout(loadCart, 100, products);
        return;
    }

    var data = localStorage.getItem('CARD');
    localStorage.removeItem('CARD');

    var cardItems = [];

    if (data != null) cardItems = JSON.parse(data);

    var result = [];

    window.usdTotal = 0.0;

    cardItems.forEach(item => {
        $.each(products, function(index, product){
            if (item.productId != index) return;

            var orderedItem = {};
            orderedItem.productId = index;
            orderedItem.name = product.name;
            orderedItem.qtd = item.qtd;
            orderedItem.unitCost = product.usdCost;
            orderedItem.usdCost = (parseFloat(orderedItem.unitCost) * parseFloat(item.qtd));
            orderedItem.image = product.assetPath;
            window.usdTotal += orderedItem.usdCost;
            window.iopTotal = parseFloat(window.usdTotal.toFixed(2)) * parseFloat(window.iopUnitPrice.toFixed(2));

            result.push(orderedItem);
        });
    });

    window.orderedList = result;
    buildOrderedList();
}

var getProductsInCard = function () {
    var success = function (data) {
        if (data != null)
            loadCart(data);
    }

    var error = function (response) {
        return false;
    }

    GET("/products/list", null, success, error);
}

var buildOrderedList = function () {
    if (typeof(window.iopUnitPrice) === "undefined") {
        setTimeout(buildOrderedList, 100);
        return;
    }

    $("#tbodyOrder").empty();

    window.orderedList.forEach(item => {

        var rowItem = $(`<tr id='${item.productId}'></tr>`);

        var columnImage = $(`<td>
        <div class="product-item">
            <img src="img/assets/${item.image}" alt="${item.name}" style="max-height: 64px; max-width: 64px">
            <span class="text-center text-lg text-medium">${item.name}</span>
        </div>
        </td>`);

        var columnQtd = $(`
        <td class="text-center">
            <div class="count-input">
                <input type='number' id='quantity' min='0' max='10' value='${item.qtd}' class='quantity single-input-number-primary'>
            </div>
        </td>
        `);

        var columnUSDCost = $(`<td class="text-center text-lg text-medium" id='usdCost'>$${item.usdCost.toFixed(2)}</td>`);
        var columnIOPCost = $(`<td class="text-center text-lg text-medium" id='iopCost'>${parseFloat(item.usdCost.toFixed(2)) * parseFloat(window.iopUnitPrice.toFixed(2))}</td>`);

        rowItem.append(columnImage);
        rowItem.append(columnQtd);
        rowItem.append(columnUSDCost);
        rowItem.append(columnIOPCost);

        $("#tbodyOrder").append(rowItem);
    });

    $('.quantity').on('change', function () {
        var tr = $(this).closest('tr');
        var productId = parseInt($(tr).attr('id'));
        var usdCost = $(tr).find('#usdCost')

        window.usdTotal = 0.0;

        window.orderedList.forEach(item => {
            if (item.productId != productId) {
                window.usdTotal += item.usdCost;
                window.iopTotal = parseFloat(window.usdTotal.toFixed(2)) * parseFloat(window.iopUnitPrice.toFixed(2));
                return;
            }

            item.qtd = parseInt(this.value);
            item.usdCost = (parseFloat(item.unitCost) * parseFloat(item.qtd));
            usdCost.text('$' + item.usdCost.toFixed(2));
            window.usdTotal += item.usdCost;
            window.iopTotal = parseFloat(window.usdTotal.toFixed(2)) * parseFloat(window.iopUnitPrice.toFixed(2));
        });

        $(`#total td:nth-child(${2})`).text('$' + window.usdTotal.toFixed(2));
        $(`#total td:nth-child(${3})`).text('$' + window.iopTotal.toFixed(2));

    });

    $(`#total td:nth-child(${2})`).text('$' + window.usdTotal.toFixed(2));
    $(`#total td:nth-child(${3})`).text('$' + window.iopTotal.toFixed(2));
}

var initialize = function () {
    //----- CLOSE
    $('[data-popup-close]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
        e.preventDefault();
    });
}

window.orderedList = [];
var qrcode = new QRCode("qrcode", {
    width: 180,
    height: 180
});

initialize();
getIopCurrentlyPrice();
setInterval(getIopCurrentlyPrice, 60000);
getProductsInCard();
