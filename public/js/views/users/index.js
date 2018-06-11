var deleteUser = function(username){
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
        username: username
    };

    POST("/users/delete", message, success, error);
}

var listUsers = function (data) {
    $(`#${`tbodyUsers`}`).empty();

    $.each(data, function (index, item) {
        var rowItem = $(`<tr id='${index}'></tr>`);
        
        var columnUsername = $(`<td class="text-center text-lg text-medium" id='userName'>$${item.username}</td>`);
        var columnButton = $(`<td class="text-center text-lg text-medium"><button type="button" class="genric-btn primary small" onclick="javascript:deleteUser('${item.username}')">Delete</button></td>`);

        rowItem.append(columnUsername);
        rowItem.append(columnButton);

        $(`#${elementName}`).append(rowItem);
    });
}

var initialize = function () {
    var success = function (data) {
        listUsers(data);
    }

    var error = function (response) {
        return false;
    }

    GET("/users/list", null, success, error);
}

initialize();
setInterval(initialize, 60000);