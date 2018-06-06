var submitForm = function () {
    var result = false;

    var url = "/users/login";
    var method = "POST";
    var message = { 
        user: $('#username').val(),
        pass: $('#password').val()
    };

    var success = function(response){
        var data = parseBoolean(response);

        if (!data) {
            $("#message").text('User or password invalid.');
            $("#message").show();
        }else{
            $("#message").hide(); 
            window.location.href = "index.html";           
        }
    }

    var error = function(response){
        return false;
    }

    ajax(url, method, message, success, error);
}

var initialize = function () {
    //----- OPEN
    $('[data-popup-open]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        e.preventDefault();
    });

    //----- CLOSE
    $('[data-popup-close]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
        e.preventDefault();
    });
}

initialize();