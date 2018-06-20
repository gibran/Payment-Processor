function deleteUser(username) {
    POST("/users/delete", {
        user: username
    }, (res) => {
        if (res) {
            initialize();
        } else {
            alert("Error");
        }
    });
}

var listUsers = function (users) {
    $("#tbodyUsers").empty();

    $.each(users, function (index, username) {
        var rowItem = $(`<tr id='${index}'></tr>`);

        var columnUsername = $(`<td class="text-center text-lg text-medium" id='userName'>${username}</td>`);
        var columnButton = $(`<td class="text-center text-lg text-medium"><button type="button" class="genric-btn primary small" onclick="javascript:deleteUser('${username}')">Delete</button></td>`);

        rowItem.append(columnUsername);
        rowItem.append(columnButton);

        $("#tbodyUsers").append(rowItem);
    });
}

function initialize() {
    GET("/users/list", (data) => {
        listUsers(data);
    });
}

initialize();
setInterval(initialize, 60000);
