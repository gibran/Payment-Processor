var ajax = function(url, method, dataType, data, success, error){
    var dataJson = null;
    if (data != null)
        dataJson = JSON.stringify(data);

    $.ajax({
        url: url,
        method: method,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: dataType,  
        data: dataJson,
        success: success,
        error: error
    });
}

var parseBoolean = function(data){
   switch (data.toLowerCase()) {
       case 'true':
           return true;
       default:
           return false;
   }
}


var logout = function(){
    var url = "/users/logout";
    var method = "POST";

    var success = function(response){
        if (response) {
            localStorage.removeItem('CARD');
            localStorage.removeItem('USERNAME');

            window.location.href = "login.html";
        }
    }

    var error = function(response){
        return false;
    }

    ajax(url, method, "json", null, success, error);
}