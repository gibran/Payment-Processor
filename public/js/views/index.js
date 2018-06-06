var getProducts = function(){
    var result = JSON.parse('[{"productId":"1","name":"Cappuccino","price":"12","image":"cappuccino.png"},{"productId":"2","name":"Americano","price":"7","image":"americano.png"},{"productId":"3","name":"Espresso","price":"5","image":"espresso.png"}]');
    return result;
}

var order = function(){
    localStorage.setItem('CARD',  JSON.stringify( window.orderList ));
    window.location.href = "order.html";
}

var buildProductList = function(){
    var products = getProducts();
    $("#products").empty();

    products.forEach(product => {
        var cardDiv = $(`<div class='col-lg-4'></div>`)

        //TODO: Alterar o css menu-coffee
        var style = `background: linear-gradient(rgba(255,255,255,1), rgba(255,255,255,.5)), url(img/assets/${product.image}) no-repeat center;`;
        var productContentDiv = $(`<div id='${product.productId}' class='single-menu' style='${style}'></div>`);
        var productHeaderDiv = $(` <div class='title-div justify-content-between d-flex'></div>`);

        var productData = $(`<h4> ${product.name} </h4><p class='price float-right'> $${product.price} </p>`);
        var productBody = $(`<p>Usage of the Internet is becoming more common due to rapid advance.</p>
                    <p class='float-right'>
					<span name="qtde" class="ingle-input-number-primary">0</span>
                    </p>
                    <p class='font-weight-bold float-right'>Qtd:&nbsp;</p>`);

        productData.appendTo(productHeaderDiv);

        productHeaderDiv.appendTo(productContentDiv);
        productBody.appendTo(productContentDiv);
        productContentDiv.appendTo(cardDiv);
        cardDiv.appendTo( $('#products') );
    });
    
    //Automatic add quantity
    $('.single-menu').on('click', function(){
        var productId = $(this).attr('id');
        var value = $(this).find('span');

        var qtdeValue = parseInt( value.text() );
        qtdeValue +=1;

        value.text(qtdeValue);
        var item = {};
        item.productId = productId;
        item.qtd = qtdeValue;

        var itemFounded = false;
        window.orderList.forEach(item => {
            if (item.productId == productId)
            {
                item.qtd = qtdeValue;
                itemFounded = true;
            }
        });

        if (!itemFounded)
            window.orderList.push(item);
    });
}

window.orderList = [];
buildProductList();