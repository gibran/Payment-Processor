var fs = require("fs");
var path = require("path");
var paths;

async function saveSettings(settings) {
    fs.writeFile(paths.settings, JSON.stringify(settings, null, 4), async()=>{});
}

async function saveOrder(address, order) {
    fs.writeFile(path.join(paths.orders.current, (address + ".json")), JSON.stringify(order, null, 4), async()=>{});
}

async function archiveOrder(address, order, success) {
    order.success = success;
    await saveOrder(address, order);

    fs.rename(path.join(paths.orders.current, (address + ".json")), path.join(paths.orders.archived, (address + ".json")), async()=>{});
}

module.exports = (pathsArg) => {
    paths = pathsArg;

    return {
        saveOrder: saveOrder,
        archiveOrder: archiveOrder
    };
}
