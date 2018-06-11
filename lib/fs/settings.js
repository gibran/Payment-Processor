//Require the actual fs lib.
var fs = require("fs");
//Var for the paths passed in.
var paths;

//Saves the passed in argument to the settings files.
async function save(settings) {
    fs.writeFile(paths.settings, JSON.stringify(settings, null, 4), async (err) => {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = async (pathsArg) => {
    paths = pathsArg;
    return {
        save: save
    };
}
