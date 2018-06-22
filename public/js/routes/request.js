async function parseRes(data) {
    if (data === null) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch(e) {
        return data;
    }
}

async function GET(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            cb(await parseRes(xhr.responseText));
        }
    }
    xhr.open("GET", url, true);
    xhr.send(null);
}

async function POST(url, data, cb) {
    if (typeof(data) === "string") {
        return false;
    }
    if (data !== null) {
        data = JSON.stringify(data);
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            cb(await parseRes(xhr.responseText));
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}
