var parseResponse = function (data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}

var formatDate = function (date) {
    return date.getFullYear() +
        "-" + ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" + ("0" + date.getDate()).slice(-2) +
        " " +
        ("0" + date.getHours() + 1).slice(-2) +
        ":" + ("0" + date.getMinutes()).slice(-2) +
        ":" + ("0" + date.getSeconds()).slice(-2);
}

async function POST (url, data, success, error) {
    var dataJson = null;
    if (data != null)
        dataJson = JSON.stringify(data);

    $.ajax({
        url: url,
        async: true,
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        data: dataJson,
        success: function(data){ 
            if (success != null) 
                success(parseResponse(data)); 
        },
        error: error
    });
}

async function GET (url, data, success, error) {
    var dataJson = null;
    if (data != null)
        dataJson = JSON.stringify(data);

    $.ajax({
        url: url,
        method: 'GET',
        contentType: "application/json; charset=utf-8",
        data: dataJson,
        success: function(data){ 
            if (success != null) 
                success(parseResponse(data)); 
        },
        error: error
    });
}

var logout = function () {

    var success = function (response) {
        if (response) {
            localStorage.removeItem('CARD');
            localStorage.removeItem('USERNAME');

            window.location.href = "login.html";
        }
    }

    var error = function (response) {
        return false;
    }

    POST("/users/logout", null, success, error);
}