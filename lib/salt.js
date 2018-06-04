var scrypt = require("scrypt");
var randstring = require("randomstring").generate;

async function createHash(data, salt) {
    return (await scrypt.hash(data, {
        "N": 16,
        "r": 8,
        "p": 1
    }, 64, salt)).toString();
}

module.exports = {
    create: async (data) => {
        var salt = randstring();
        return {
            salt: salt,
            hash: await createHash(data, salt)
        };
    },

    verify: async (data, salt, hash) => {
        return (await createHash(data, salt)) === hash;
    }
};
