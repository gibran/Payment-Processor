var cancelOrder = function(address){

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
        address: address
    };

    POST("/orders/cancel", message, success, error);
}

var processOrderList = function (url, elementName, enabledCancel) {
    var success = function (data) {
        buildingTable(data, elementName, enabledCancel);
    }

    var error = function (response) {
        return false;
    }

    GET(url, null, success, error);
}

var buildingTable = function (data, elementName, enabledCancel) {
    $(`#${elementName}`).empty();

    $.each(data, function (index, item) {
        var rowItem = $(`<tr id='${index}'></tr>`);
        var columnTime = $(`<td class="text-center text-lg text-medium" id='address'>${formatDate(new Date(item.time))}</td>`);
        var columnAddress = $(`<td class="text-lg text-medium" id='address'>${index}</td>`);
        var columnNote = $(`<td class="text-center text-lg text-medium" id='usdPrice'>${item.note}</td>`);
        var columnUsd = $(`<td class="text-center text-lg text-medium" id='usdPrice'>$${item.usd}</td>`);
        var columnIoP = $(`<td class="text-center text-lg text-medium iopPrice" id='iopPrice'>${item.amount}</td>`);

        rowItem.append(columnTime);
        rowItem.append(columnAddress);
        rowItem.append(columnNote);
        rowItem.append(columnUsd);
        rowItem.append(columnIoP);

        if (enabledCancel) {
            var columnButton = $(`<td class="text-center text-lg text-medium"><button type="button" class="genric-btn primary small" onclick="javascript:cancelOrder('${index}')">Cancel</button></td>`);
            rowItem.append(columnButton);
            
        }

        $(`#${elementName}`).append(rowItem);
    });
}

var initialize = function () {
    processOrderList("/orders/active", 'tbodyActiveOrder', true);
    processOrderList("/orders/succeeded", 'tbodySucceededOrder', false);
    processOrderList("/orders/failed", 'tbodyFailedOrder', false);
}

initialize();
setInterval(initialize, 30000);