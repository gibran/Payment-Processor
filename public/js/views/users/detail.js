var beforeSave = function () {
    var form = $('#newUserForm')[0];

    if (!form.checkValidity()){
        const tmpSubmit = document.createElement('button')
        form.appendChild(tmpSubmit)
        tmpSubmit.click()
        form.removeChild(tmpSubmit)
    }
    else{
        saveUser();
    }
}

var saveUser = function () {
    var success = function (response) {
        var data = response;
        if (data) {
            document.location.href = "index.html";
        } else {
            alert('Error');
        }
    }

    var error = function (response) {
        return false;
    }

    var message = {
        user: $('#user').val(),
        pass: $('#pass').val(),
    };

    POST("/users/new", message, success, error);
}