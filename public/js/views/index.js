var getProducts = function(){
    var result = JSON.parse('[{"productId":"1","name":"Cappuccino","price":"12","image":"cappuccino.png"},{"productId":"2","name":"Americano","price":"7","image":"americano.png"},{"productId":"3","name":"Espresso","price":"5","image":"espresso.png"}]');
    return result;
}

var buildingTable = function (data, elementName) {
    $.each(data, function (index, item) {
        var rowItem = $(`<tr id='${index}'></tr>`);

        var className = item.success 
                        ? 'success'
                        : ( item.success == undefined 
                            ? 'active'
                            : 'cancel');

        var columnAddress = $(`<td class="text-center text-lg text-medium ${className}" id='address'>${index}</td>`);
        rowItem.append(columnAddress);

        $(`#${elementName}`).append(rowItem);
    });
}

var order = function(){
    debugger;

    if (window.orderList.length == 0)
    {
        alert(`You didn't select any products`);
        return;
    }

    localStorage.setItem('CARD',  JSON.stringify( window.orderList ));
    window.location.href = "order.html";
}

var addProductInOrder = function (productId, qtdeValue){
    var item = {};
    item.productId = productId;
    item.qtd = qtdeValue;

    var itemFounded = false;

    $.each(window.orderList, function(index, item){
        if (item.productId == productId)
        {
            itemFounded = true;
            if (qtdeValue > 0)
                item.qtd = qtdeValue;
            else
                window.orderList.splice(index, 1);
        }
    });

    if (!itemFounded && item.qtd > 0)
        window.orderList.push(item);
}

var buildProductList = function(){
    var products = getProducts();
    $("#products").empty();

    products.forEach(product => {
        var cardDiv = $(`<div class='col-lg-4'></div>`)

        var style = `background: linear-gradient(rgba(255,255,255,1), rgba(255,255,255,.5)), url(img/assets/${product.image}) no-repeat center;`;
        var productContentDiv = $(`<div id='${product.productId}' class='single-menu productId' style='${style}'></div>`);
        var productHeaderDiv = $(` <div class='title-div justify-content-between d-flex'></div>`);

        var productData = $(`<h4> ${product.name} </h4><p class='price float-right'> $${product.price} </p>`);
        var productBody = $(`<p>Usage of the Internet is becoming more common due to rapid advance.</p>
                    <p class='float-right'>
					<input type="number" name="qtde" min="0" max="10" value="0" class="single-input-number-primary quantity">
                    </p>
                    <p class='font-weight-bold float-right'>Qtd:&nbsp;</p>`);

        productData.appendTo(productHeaderDiv);

        productHeaderDiv.appendTo(productContentDiv);
        productBody.appendTo(productContentDiv);
        productContentDiv.appendTo(cardDiv);
        cardDiv.appendTo( $('#products') );
    });
    
    //Automatic add quantity
    $('.quantity').on('click', function(e){
        e.stopPropagation();        
        var productId = $(this).closest('.productId').attr('id');
        var qtdeValue = parseInt( $(this).val() );

        addProductInOrder(productId, qtdeValue);
    });
}

window.currentlyOrder = [];
window.orderList = [];
buildProductList();