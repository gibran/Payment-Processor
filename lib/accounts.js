var salt = require("./salt.js"), fs;

//Create a new user.
async function newUser(user, pass) {
    //Make sure their username doesn't have .. or " or any volatile symbols.
    if (!(/^[a-zA-Z]+$/i.test(user))) {
        console.log("Username failed the safety checks.");
        return false;
    }

    //Salt their password.
    var data = await salt.create(pass);
    //Save the user to disk.
    await fs.saveUser(user, data.salt, data.hash);

    return true;
}

//Validate a login.
async function login(user, pass) {
    //Load them from the RAM cache.
    var data = await fs.loadUser(user);
    //Return false if they don't exist.
    if (data === false) {
        return false;
    }
    //Check their login.
    return await salt.verify(pass, data.salt, data.hash);
}

module.exports = (fsArg) => {
    //Set the fs lib var.
    fs = fsArg;

    return {
        newUser: newUser,

        login: login,

        //Change a password.
        changePassword: async (user, pass) => {
            //Make sure the account exists.
            if ((await fs.loadUser(user)) === false) {
                return false;
            }
            //Delete and recreate the user.
            await fs.deleteUser(user);
            await newUser(user, pass);
            return true;
        },

        //Delete the user.
        deleteUser: async (user) => {
            //Make sure the account exists.
            if ((await fs.loadUser(user)) === false) {
                return false;
            }
            //Delete the user.
            await fs.deleteUser(user);
            return true;
        }
    }
}
