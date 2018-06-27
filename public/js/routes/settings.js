window.settings = {
    update: async (settings) => {
        POST("/settings/update", {
            settings: settings
        }, async (res) => {
            if (res === true) {
                window.location.reload();
            } else {
                alert("Updating the settings failed.");
            }
        });
    }
};
