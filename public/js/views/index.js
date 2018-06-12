var getProducts = function(){
    var success = function (data) {

        if (data != null)
            buildProductList(data);
    }

    var error = function (response) {
        return false;
    }

    GET("/products/list", null, success, error);
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

var buildProductList = function(products){
    $("#products").empty();

    $.each(products, function(index, product){
        var cardDiv = $(`<div class='col-lg-4'></div>`)

        var style = `background: linear-gradient(rgba(255,255,255,1), rgba(255,255,255,.5)), url(img/assets/${product.assetPath}) no-repeat center;`;
        var productContentDiv = $(`<div id='${index}' class='single-menu productId' style='${style}'></div>`);
        var productHeaderDiv = $(` <div class='title-div justify-content-between d-flex'></div>`);

        var productData = $(`<h4> ${product.name} </h4><p class='price float-right'> $${product.usdCost} </p>`);
        var productBody = $(`<p>&nbsp;&nbsp;</p>
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
getProducts();