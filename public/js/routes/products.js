window.products = {
    list: async () => {
        GET("/products/list", async (res) => {
            if (typeof(res) !== "object") {
                return;
            }

            window.products.products = res;
        });
    },

    create: async (name, assetPath, usdCost) => {
        POST("/products/new", {
            name: name,
            assetPath: assetPath,
            usdCost: usdCost
        }, async (res) => {
            if (res === true) {
                window.location.href = window.location.href;
            } else {
                alert("Product creation failed.");
            }
        });
    },

    calculate: async (products) => {
        var result = {
            usd: 0,
            iop: 0
        };

        for (var i in products) {
            var product = window.products.products[products[i].index];
            result.usd += product.usdCost;
        }
        result.iop = await window.price.usdToIOP(result.usd);

        return result;
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
                window.location.href = window.location.href;
            } else {
                alert("Product deletion failed.");
            }
        });
    }
};

window.products.list();
