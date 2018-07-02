async function changePassword() {
    var pass = prompt("What should your new password be?'", "Password");
    if ((pass === null) || (pass === "")) {
        alert("Changing your password failed.");
        return;
    }
    window.users.changePassword(window.user, pass);
}

async function createRow() {
    var userCell = document.createElement("td");
    userCell.innerHTML = window.user;

    var changePasswordCell = document.createElement("td");
    changePasswordCell.innerHTML = `<button type="button" onclick="changePassword('${user}')">Change Password</button>`;

    var row = document.createElement("tr");
    row.appendChild(userCell);
    row.appendChild(changePasswordCell);

    return row;
}

async function init() {
    var users = document.getElementById("users");
    users.appendChild(await createRow());
}

//Wait until we have the price and users...
async function timeout() {
    if (typeof(window.user) === "undefined") {
        setTimeout(timeout, 50);
        return;
    }

    init();
}
timeout();
