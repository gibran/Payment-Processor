window.products = {
    list: async () => {
        GET("/products/list", async (res) => {
            if (typeof(res) !== "object") {
                return;
            }

            window.products.products = res;
        });
    },

    new: async (name, assetPath, usdCost) => {
        POST("/products/new", {
            name: name,
            assetPath: assetPath,
            usdCost: usdCost
        }, async (res) => {
            if (res === true) {
                window.location.reload();
            } else {
                alert("Product creation failed.");
            }
        });
    },

    buy: async (products) => {
        POST("/products/buy", products, async (res) => {
            if (res !== false) {
                window.products.price = res;
            } else {
                alert("Product buying failed.");
            }
        });
    },

    delete: async (index, name) => {
        POST("/products/delete", {
            index: index,
            name: name
        }, async (res) => {
            if (res === true) {
                window.location.reload();
            } else {
                alert("Product deletion failed.");
            }
        });
    }
};

window.products.list();
