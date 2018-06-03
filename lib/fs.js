var fs = require("fs");
var path = require("path");

var dirPath, currentPath, archivedPath;

async function saveOrder(address, order) {
    fs.writeFile(path.join(currentPath, address + ".json"), JSON.stringify(order, null, 4), async()=>{});
}

async function archiveOrder(address, order, success) {
    order.success = success;
    await saveOrder(address, order);

    fs.rename(path.join(currentPath, address + ".json"), path.join(archivedPath, address + ".json"), async()=>{});
}

async function saveSettings(settings) {
    fs.writeFile(path.join(dirPath, "data", "settings.json"), JSON.stringify(settings, null, 4), async()=>{});
}

module.exports = (config) => {
    dirPath = config.dirPath;
    currentPath = config.currentPath;
    archivedPath = config.archivedPath;

    return {
        saveOrder: saveOrder,
        archiveOrder: archiveOrder
    };
}
