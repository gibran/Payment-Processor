//fs, salt, and cookies lib.
var fs, salt, cookies;

//Create a new user.
async function newUser(user, pass, admin) {
    //Make sure their username doesn't have "..", "\"", or any volatile symbols.
    if (!(/^[a-zA-Z]+$/i.test(user))) {
        return false;
    }

    //Salt their password.
    var data = await salt.create(pass);

    if (admin === true) {
        admin = true;
    } else {
        admin = false;
    }

    //Save the user to disk.
    await fs.save({
        user: user,
        admin: ((admin === true) ? true : false),
        salt: data.salt,
        hash: data.hash
    });

    return true;
}

//Change a password.
async function changePassword(user, pass) {
    //Make sure the account exists.
    if ((await fs.load(user)) === false) {
        return false;
    }

    //Delete and recreate the user.
    await fs.remove(user);
    setTimeout(async () => {
        await newUser(user, pass);
    }, 100);
    return true;
}

async function promote(user) {
    return await fs.promote(user);
}

async function demote(user) {
    return await fs.demote(user);
}

//Delete an user.
async function deleteUser(user) {
    //Make sure the account exists.
    if ((await fs.load(user)) === false) {
        return false;
    }

    //Log the user out.
    await cookies.deleteUser(user);

    //Delete the user.
    await fs.remove(user);
    return true;
}

//fs passthrough of getting an array of all users.
async function list() {
    return (await fs.list());
}

//fs passthrough of getting an array of all admins.
async function listAdmins() {
    return (await fs.listAdmins());
}

module.exports = async (fsArg, saltArg, cookiesArg) => {
    fs = fsArg;
    salt = saltArg;
    cookies = cookiesArg;

    return {
        new: newUser,
        changePassword: changePassword,
        promote: promote,
        demote: demote,
        delete: deleteUser,

        list: list,
        listAdmins: listAdmins
    };
};
