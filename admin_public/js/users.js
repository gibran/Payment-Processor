async function newUser() {
    var user = prompt("What should the new user's username be? No symbols or numbers are allowed.", "Username");
    if ((user === null) || (user === "")) {
        alert("User creation failed.");
        return;
    }

    var pass = prompt("What should " + user + "'s new password be?'", "Password");
    if ((pass === null) || (pass === "")) {
        alert("User creation failed.");
        return;
    }

    var admin = confirm("Should this user be an admin?");
    if (admin !== true) {
        admin = false;
    }

    window.users.new(user, pass, admin);
}

async function changePassword(user) {
    var pass = prompt("What should " + user + "'s new password be?'", "Password");
    if ((pass === null) || (pass === "")) {
        alert("Changing " + user + "'s password failed.");
        return
    }
    window.users.changePassword(user, pass);
}

async function promote(user) {
    window.users.promote(user);
}

async function demote(user) {
    window.users.demote(user);
}

async function deleteUser(user) {
    window.users.delete(user);
}

async function createRow(user) {
    var userCell = document.createElement("td");
    userCell.innerHTML = user;

    var adminCell = document.createElement("td");
    adminCell.innerHTML = ((window.users.admins.indexOf(user) > -1) ? "Yes" : "No");

    var promoteDemoteCell = document.createElement("td");
    promoteDemoteCell.innerHTML = (
        (window.users.admins.indexOf(user) === -1)
        ? `<button type="button" onclick="promote('${user}')">Promote</button>`
        : `<button type="button" onclick="demote('${user}')">Demote</button>`
    );

    var changePasswordCell = document.createElement("td");
    changePasswordCell.innerHTML = `<button type="button" onclick="changePassword('${user}')">Change Password</button>`;

    var deleteCell = document.createElement("td");
    deleteCell.innerHTML = `<button type="button" onclick="deleteUser('${user}')">Delete</button>`;

    var row = document.createElement("tr");
    row.appendChild(userCell);
    row.appendChild(adminCell);
    row.appendChild(changePasswordCell);
    row.appendChild(promoteDemoteCell);
    row.appendChild(deleteCell);

    return row;
}

async function init() {
    if (Object.keys(window.users.users).length > 5) {
        document.getElementById("usersDiv").style["overflow-y"] = "scroll";
    }

    var users = document.getElementById("users");
    for (var i in window.users.users) {
        users.appendChild(
            await createRow(window.users.users[i])
        );
    }
}

//Wait until we have the price and users...
async function timeout() {
    if (
        (typeof(window.users.users) === "undefined") ||
        (typeof(window.users.admins) === "undefined")
    ) {
        setTimeout(timeout, 50);
        return;
    }

    init();
}
timeout();
