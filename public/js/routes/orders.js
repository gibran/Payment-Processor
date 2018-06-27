window.orders = {
    getActive: async () => {
        GET("/orders/active", async (res) => {
            if (typeof(res) !== "object") {
                return;
            }

            window.orders.active = res;
        });
    },

    getSucceeded: async () => {
        GET("/orders/succeeded", async (res) => {
            if (typeof(res) !== "object") {
                return;
            }

            window.orders.succeeded = res;
        });
    },

    getFailed: async () => {
        GET("/orders/failed", async (res) => {
            if (typeof(res) !== "object") {
                return;
            }

            window.orders.failed = res;
        });
    },

    create: async (amount, note) => {
        POST("/orders/new", {
            amount: amount,
            note: note
        }, async (res) => {
            window.orders.address = res;
        });
    },

    cash: async (address) => {
        POST("/orders/cash", {
            address: address
        }, async (res) => {
            if (res === false) {
                alert("The marking of order " + address + " as paid has failed.");
                return;
            }

            setTimeout(async () => {
                window.location.reload();
            }, 100);
        });
    },

    cancel: async (address) => {
        POST("/orders/cancel", {
            address: address
        }, async (res) => {
            if (res === false) {
                alert("The cancelling of order " + address + " failed.");
                return;
            }

            setTimeout(async () => {
                window.location.reload();
            }, 100);
        });
    }
};

window.orders.getActive();
window.orders.getSucceeded();
window.orders.getFailed();
