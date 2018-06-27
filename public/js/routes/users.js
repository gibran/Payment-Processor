window.users = {
    login: async (user, pass) => {
        POST("/users/login", {
            user: user,
            pass: pass
        }, async (res) => {
            if (res === true) {
                document.cookie = "user=" + user;
                window.location.href = "/";
            } else {
                alert("That login is invalid.");
            }
        });
    },

    logout: async () => {
        POST("/users/logout", null, async (res) => {
            if (res === true) {
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                window.location.href = "/login.html";
            } else {
                alert("You are not logged in.");
            }
        });
    },

    list: async () => {
        GET("/users/list", async (res) => {
            if (typeof(res) !== "object") {
                return;
            }

            window.users.users = res;
        });
    },

    listAdmins: async () => {
        GET("/users/admins", async (res) => {
            if (res === false) {
                return;
            }

            window.users.admins = res;
        });
    },

    new: async (user, pass, admin) => {
        POST("/users/new", {
            user: user,
            pass: pass,
            admin: admin
        }, async (res) => {
            if (res === true) {
                window.location.reload();
            } else {
                alert("User creation failed.");
            }
        });
    },

    changePassword: async (user, pass) => {
        POST("/users/changePassword", {
            user: user,
            pass: pass
        }, async (res) => {
            if (res === true) {
                alert("Success.");
            } else {
                alert("Changing " + user + "'s password failed.");
            }
        });
    },

    delete: async (user) => {
        POST("/users/delete", {
            user: user
        }, async (res) => {
            if (res === true) {
                window.location.reload();
            } else {
                alert("User deletion failed.");
            }
        });
    }
};

window.users.list();
window.users.listAdmins();
