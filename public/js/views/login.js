var submitForm = function () {
    var success = function(response){
        if (!response) {
            $("#message").text('User or password invalid.');
            $("#message").show();
        }else{
            $("#message").hide(); 
            localStorage.setItem('USERNAME', $('#username').val());            
            window.location.href = "index.html";           
        }
    }

    var error = function(response){
        return false;
    }

    var message = { 
        user: $('#username').val(),
        pass: $('#password').val()
    };
    POST("/users/login", message, success, error);
}

var initialize = function () {
    //----- OPEN
    $('[data-popup-open]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        e.preventDefault();
        $('#username').focus();
    });

    //----- CLOSE
    $('[data-popup-close]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
        e.preventDefault();
    });

    $(document).keypress(function(e) {
        if(e.which == 13) {
            submitForm();
        }
    });
}

initialize();