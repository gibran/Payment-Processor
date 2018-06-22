window.orders = {
    getActive: async () => {
        GET("/orders/active", async (res) => {
            window.orders.active = res;
        });
    },

    getSucceeded: async () => {
        GET("/orders/succeeded", async (res) => {
            window.orders.succeeded = res;
        });
    },

    getFailed: async () => {
        GET("/orders/failed", async (res) => {
            window.orders.failed = res;
        });
    },

    create: async (amount, note) => {
        window.orders.address = 0;
        POST("/orders/new", {
            amount: amount,
            note: note
        }, async (res) => {
            window.orders.address = res;
        });
    },

    cancel: async (address) => {
        POST("/orders/cancel", {
            address: address
        }, async (res) => {
            if (res === false) {
                alert("The cancelling of order " + address + " failed.");
            }

            window.orders.getActive();
            window.orders.getFailed();
        });
    }
};
