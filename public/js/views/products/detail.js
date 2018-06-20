var beforeSave = function () {
    var form = $('#newProductForm')[0];

    if (!form.checkValidity()){
        const tmpSubmit = document.createElement('button')
        form.appendChild(tmpSubmit)
        tmpSubmit.click()
        form.removeChild(tmpSubmit)
    }
    else{
        saveProduct();
    }
}

var saveProduct = function () {
    var success = function (response) {
        var data = response;
        if (data) {
            document.location.href = "index.html";
        } else {
            alert('Error');
        }
    }
    
    var message = {
        name: $('#productName').val(),
        assetPath: $('#assetPath').val(),
        usdCost: parseFloat($('#usdCost').val()),
    };

    POST("/products/new", message, success);
}
