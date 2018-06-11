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
        user: username
    };

    POST("/users/delete", message, success, error);
}

var listUsers = function (users) {
    $('#tbodyUsers').empty();

    $.each(users, function (index, username) {
        var rowItem = $(`<tr id='${index}'></tr>`);
        
        var columnUsername = $(`<td class="text-center text-lg text-medium" id='userName'>${username}</td>`);
        var columnButton = $(`<td class="text-center text-lg text-medium"><button type="button" class="genric-btn primary small" onclick="javascript:deleteUser('${username}')">Delete</button></td>`);

        rowItem.append(columnUsername);
        rowItem.append(columnButton);

        $('#tbodyUsers').append(rowItem);
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