var deleteProduct = function(index, name){
    var success = function (response) {
        var data = response;
        if (data) {
            initialize();
        } else {
            alert('Error');
        }
    }

    var error = function (response) {
        return false;
    }

    var message = {
        index: index,
        name: name
    };

    POST("/products/delete", message, success, error);
}

var listProducts = function (url, elementName) {
    var success = function (data) {
        buildingTable(data, elementName);
    }

    var error = function (response) {
        return false;
    }

    GET(url, null, success, error);
}

var buildingTable = function (data, elementName) {
    $(`#${elementName}`).empty();

    $.each(data, function (index, item) {
        var rowItem = $(`<tr id='${index}'></tr>`);
        
        var columnImage = $(`<td>
        <div class="product-item">
            <img src="../img/assets/${item.assetPath}" alt="${item.name}" style="max-height: 64px; max-width: 64px">
            <span class="text-center text-lg text-medium">${item.name}</span>
        </div>
        </td>`);

        var columnPrice = $(`<td class="text-center text-lg text-medium" id='usdPrice'>$${item.usdCost}</td>`);
        var columnButton = $(`<td class="text-center text-lg text-medium"><button type="button" class="genric-btn primary small" onclick="javascript:deleteProduct(${index}, '${item.name}')">Delete</button></td>`);

        rowItem.append(columnImage);
        rowItem.append(columnPrice);
        rowItem.append(columnButton);

        $(`#${elementName}`).append(rowItem);
    });
}

var initialize = function () {
    listProducts("/products/list", 'tbodyProducts');
}

initialize();
setInterval(initialize, 60000);