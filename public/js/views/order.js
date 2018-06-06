var getIopCurrentlyPrice = function(){
    var url = "/iop/price";
    var method = "GET";

    var success = function(response){
        var data = parseFloat(response);

        window.iopUnitPrice = data;
        $('#iopCurrentlyPrice').text('$ ' + window.iopUnitPrice.toFixed(2));
        recalculatePrice();
        calcultateTotal();
    }

    var error = function(response){
        return false;
    }

    ajax(url, method, null, success, error);
}

var confirmedPay = function() {
    var result = false;

    var url = "/orders/new";
    var method = "POST";
    var message = {
        amount: window.iopPrice,
        note: `Coffee sale by ${localStorage.getItem('USERNAME')}`
    };

    var success = function(response){
        var data = response;

        if (data != 'false') {            
            alert('Confirmed');
            $('#address').text(data);
        }else{
            alert('Error');
        }
    }

    var error = function(response){
        return false;
    }

    ajax(url, method, message, success, error);
}

var getProductsInCard = function () {
    var data = localStorage.getItem('CARD');
    localStorage.removeItem('CARD');

    var cardItems = [];

    if (data != null) cardItems = JSON.parse(data);
    var products = JSON.parse('[{"productId":"1","name":"Cappuccino","price":"12","image":"cappuccino.png"},{"productId":"2","name":"Americano","price":"7","image":"americano.png"},{"productId":"3","name":"Espresso","price":"5","image":"espresso.png"}]');

    var result = [];

    cardItems.forEach(item => {
        products.forEach(product => {
            if (item.productId != product.productId) return;

            var orderedItem = {};
            orderedItem.productId = product.productId;
            orderedItem.name = product.name;
            orderedItem.qtd = item.qtd;
            orderedItem.unitPrice = product.price;
            orderedItem.usdPrice = (parseFloat(orderedItem.unitPrice) * parseFloat(item.qtd));
            orderedItem.iopPrice = (orderedItem.usdPrice / window.iopUnitPrice);
            orderedItem.image = product.image;

            result.push(orderedItem)
        });
    });

    return result;
}

var calcultateTotal = function () {
    var usdPrice = 0.0;
    var iopPrice = 0.0;

    window.orderedList.forEach(item => {
        usdPrice += item.usdPrice;
        iopPrice += item.iopPrice;
    });

    $(`#total td:nth-child(${2})`).text('$' + usdPrice.toFixed(2));
    $(`#total td:nth-child(${3})`).text(iopPrice.toFixed(8));

    window.usdPrice = usdPrice;
    window.iopPrice = iopPrice;

    $('#confirmItems').text(window.orderedList.length);
    $('#confirmUsdPrice').text('$'+ usdPrice);
    $('#confirmIopPrice').text(iopPrice);
}

var recalculatePrice = function(){
    window.orderedList.forEach(item => {
        var tr = $(`#${item.productId}`);
        var usdPrice = $(tr).find('#usdPrice');
        var iopPrice = $(tr).find('#iopPrice');

        item.usdPrice = (parseFloat(item.unitPrice) * parseFloat(item.qtd));
        item.iopPrice = (item.usdPrice / window.iopUnitPrice);

        usdPrice.text('$' + item.usdPrice.toFixed(2));
        iopPrice.text(item.iopPrice.toFixed(2));
    });
}

var buildOrderedList = function () {
    window.orderedList = getProductsInCard();

    $("#tbodyOrder").empty();

    window.orderedList.forEach(item => {

        var rowItem = $(`<tr id='${item.productId}'></tr>`);

        var columnImage = $(`<td>
        <div class="product-item">
            <img src="img/menu/${item.image}" alt="${item.name}" style="max-height: 64px; max-width: 64px">
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

        var columnPrice = $(`<td class="text-center text-lg text-medium" id='usdPrice'>$${item.usdPrice}</td>`);
        var columnIoPPrice = $(`<td class="text-center text-lg text-medium iopPrice" id='iopPrice'>${item.iopPrice}</td>`);
        var columnRemoveItem = $(`<td class="text-center"><a class="remove-from-cart" href="#" data-toggle="tooltip" title="" data-original-title="Remove item"><i class="icon-cross"></i></a></td>`);

        rowItem.append(columnImage);
        rowItem.append(columnQtd);
        rowItem.append(columnPrice);
        rowItem.append(columnIoPPrice);
        rowItem.append(columnRemoveItem);

        $("#tbodyOrder").append(rowItem);
    });

    calcultateTotal();

    $('.quantity').on('change', function () {
        var tr = $(this).closest('tr');
        var productId = $(tr).attr('id');
        var usdPrice = $(tr).find('#usdPrice')
        var iopPrice = $(tr).find('#iopPrice')

        window.orderedList.forEach(item => {
            if (item.productId != productId) return;

            item.qtd = parseInt(this.value);
            item.usdPrice = (parseFloat(item.unitPrice) * parseFloat(item.qtd));
            item.iopPrice = (item.usdPrice / window.iopUnitPrice);

            usdPrice.text('$' + item.usdPrice.toFixed(2));
            iopPrice.text(item.iopPrice.toFixed(2));
        });

        //Recalculate total
        calcultateTotal();
    });

    //----- OPEN
    $('[data-popup-open]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        e.preventDefault();
    });

    //----- CLOSE
    $('[data-popup-close]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
        e.preventDefault();
    });
}

window.orderedList = [];

getIopCurrentlyPrice();
setInterval(getIopCurrentlyPrice, 60000);
buildOrderedList();