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

            window.price.iop = await window.price.format(res);
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
