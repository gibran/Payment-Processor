var ajax = function(url, method, data, success, error){
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = (() => {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (success != null)
                success(xhr.responseText);
        }
        else if (xhr.readyState === XMLHttpRequest.DONE) {
            if (error != null)
                error(xhr.responseText);
        }
    });

    if (data != null)
        xhr.send(JSON.stringify(data));
    else
        xhr.send();
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
        var data = parseBoolean(response);

        if (data) {
            window.location.href = "login.html";
        }
    }

    var error = function(response){
        return false;
    }

    ajax(url, method, null, success, error);
}