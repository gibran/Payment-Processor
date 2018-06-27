async function disableEnter(field, cb) {
    async function handleEnter(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            if (cb) {
                cb();
            }
        }
    }

    document.getElementById(field).addEventListener("keydown", handleEnter);
    document.getElementById(field).addEventListener("keyup", handleEnter);
    document.getElementById(field).addEventListener("keypress", handleEnter);
    document.getElementById(field).addEventListener("input", handleEnter);
}

if (document.cookie.indexOf("user=") > -1) {
    window.user = document.cookie.split("user=")[1].split(";")[0];
}
