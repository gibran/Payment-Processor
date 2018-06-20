function parseRes(data) {
    if (data === null) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch(e) {
        return data;
    }
}

function formatDate(date) {
    return date.getFullYear() +
        "-" + ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" + ("0" + date.getDate()).slice(-2) +
        " " +
        ("0" + (date.getHours() + 1)).slice(-2) +
        ":" + ("0" + (date.getMinutes())).slice(-2) +
        ":" + ("0" + (date.getSeconds())).slice(-2);
}

async function GET(url, success) {
    $.ajax({
        url: url,
        method: "GET",
        success: (res) => {
            res = parseRes(res);
            success(res);
        },
        error: () => {
            console.log("The GET request to " + url + "faiiled.")
        }
    });
}

async function POST(url, data, success) {
    if (typeof(data) === "string") {
        return false;
    }
    if (data !== null) {
        data = JSON.stringify(data);
    }

    if (success === null) {
        success = async () => {};
    }

    $.ajax({
        url: url,
        method: "POST",
        contentType: "application/json",
        data: data,
        success: (res) => {
            res = parseRes(res);
            success(res);
        },
        error: () => {
            console.log("The POST request to " + url + "faiiled.")
        }
    });
}

async function logout() {
    POST("/users/logout", null, async (res) => {
        if (res === true) {
            localStorage.removeItem("CARD");
            localStorage.removeItem("USERNAME");

            window.location.href = "login.html";
        } else {
            console.log("The logout function has encountered an unknown bug.");
        }
    });
}
