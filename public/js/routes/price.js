window.price = {
    format: async (amount) => {
        amount = amount.toString();
        if (amount.indexOf(".") > -1) {
            amount = amount.split(".");
            amount[1] = amount[1].substr(0, 2);
            amount = amount.join(".");
        }
        return amount;
    },

    getIOP: async () => {
        GET("/iop/price", async (res) => {
            if (Number.isNaN(parseFloat(res))) {
                return;
            }

            //Set a global variable.
            window.price.iop = await window.price.format(res);
            //Update the HTML field if it exists.
            var iopHTML = document.getElementById("iopValueNum");
            if (iopHTML !== null) {
                iopHTML.innerHTML = window.price.iop;
            }
        });
    },

    iopToUSD: async (amount) => {
        return (await window.price.format(amount * window.price.iop));
    },

    usdToIOP: async (amount) => {
        return (await window.price.format(amount / window.price.iop));
    }
};

window.price.getIOP();
