//Implements password salting using scrypt. ~0.1 seconds per pasword.
var scrypt = require("scrypt");
//Randomstring is used to create the salts.
var randstring = require("randomstring").generate;

//Takes data and a salt, and returns the string hash.
async function createHash(data, salt) {
    return (await scrypt.hash(data, {
        "N": 16,
        "r": 8,
        "p": 1
    }, 64, salt)).toString();
}

module.exports = {
    //Create a salted hash based just on data. Returns a salt and a hash.
    create: async (data) => {
        var salt = randstring();
        return {
            salt: salt,
            hash: await createHash(data, salt)
        };
    },

    //verify a salted hash. Takes data, a salt, and a hash. Returns a bool.
    verify: async (data, salt, hash) => {
        return (await createHash(data, salt)) === hash;
    }
};
