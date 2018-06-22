async function login() {
    window.users.login(document.getElementById("user").value, document.getElementById("pass").value);
}

disableEnter("user");
disableEnter("pass", login);
