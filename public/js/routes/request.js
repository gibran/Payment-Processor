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
