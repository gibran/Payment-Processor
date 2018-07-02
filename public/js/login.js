document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

async function login() {
    window.users.login(document.getElementById("user").value, document.getElementById("pass").value);
}

disableEnter("user");
disableEnter("pass", login);
