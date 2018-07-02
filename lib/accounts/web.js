//fs and cookies lib.
var fs, cookies;

//Files never to block access to. CSS, JS, and photos.
var assetFileEndings = [
    "css",
    "js",
    "png",
    "jpg",
    "jpeg",
    "ico"
];

//Function that tells you if an url points to an asset or not.
async function isAsset(url) {
    //Iterate through the asset file endings.
    for (var i in assetFileEndings) {
        var ending = "." + assetFileEndings[i];
        //See if the url ends in that ending.
        if (url.substr(0 - ending.length, ending.length) === ending) {
            //If so, return true.
            return true;
        }
    }

    //If not, return false.
    return false;
}

//Middleware to stop users who aren't logged in, yet still allows assets.
async function user(req, res, next) {
    //If the user isn't logged in...
    if (!(await cookies.isLoggedIn(req.cookies.token))) {
        //And they're trying to get a web page/data...
        if (req.method === "GET") {
            //And it's not an asset or the login page...
            if ((!(await isAsset(req.url))) && (req.url !== "/login.html")) {
                //Give them the login page.
                res.redirect("/login.html");
                return;
            }
        }

        //If they're trying to edit data...
        if (req.method === "POST") {
            //And they're not trying to login...
            if (req.url !== "/users/login") {
                //Give them an error and end the request.
                res.end("You are not logged in.");
                return;
            }
        }
    }

    //If it made past all that, move on.
    next();
}

//Middleware to stop users from performing admin actions.
//This should only be used by routers.
async function admin(req, res, next) {
    //The general account middleware will stop people who aren't logged in.
    //This middleware only has to stop logged in users.
    if (!(await cookies.isLoggedIn(req.cookies.token))) {
        next();
        return;
    }

    //Make sure the user doing this is an admin.
    if (!(fs.isAdmin(await cookies.getUser(req.cookies.token)))) {
        //Overrides.
        if (req.method === "GET") {
            if (req.url === "/users.html") {
                res.redirect("/user/users.html");
                return;
            }
        }

        if (req.method === "POST") {
            //If the user is changing their own password...
            if ((req.url === "/changePassword") && ((await cookies.getUser(req.cookies.token)) === req.body.user)) {
                next();
                return;
            }
        }

        res.redirect("/adminsOnly.html");
        return;
    }

    next();
}

module.exports = async (fsArg, cookiesArg) => {
    //Set the fs and cookies var.
    fs = fsArg;
    cookies = cookiesArg;

    //Return the middlewares.
    return {
        user: user,
        admin: admin
    };
}
