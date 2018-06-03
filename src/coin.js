var client, confirms, confirmed, unconfirmed;

async function updateBalances(neededConfs, balances) {
    //Get every address with any balance, according to the needed confirmations.
    var list = await client.listReceivedByAddress(neededConfs);
    for (var i in list) {
        //If we're not tracking it, ignore it.
        if (typeof(balances[list[i].address]) !== "number") {
            continue;
        }
        //Update the balance (technically the total amount sent to it, but as addresses are single use, that's fine).
        balances[list[i].address] = list[i].amount;
    }
}

module.exports = async (settings) => {
    settings = require(settings);

    //Create the BTC client.
    client = new (require("bitcoin-core"))({
        host: "localhost",
        username: settings.rpcuser,
        password: settings.rpcpass,
        port: settings.rpcport,
        headers: false
    });
    confirms = settings.confirms;

    confirmed = {};
    unconfirmed = {};

    //Get the balances and update them every 20 seconds.
    await updateBalances(confirms, confirmed);
    await updateBalances(0, unconfirmed);
    setInterval(updateBalances, 20*1000, confirms, confirmed);
    setInterval(updateBalances, 20*1000, 0, unconfirmed);

    //Return the getNewAddress, get*Balance, and manual track/untrack functions.
    return {
        getNewAddress: async () => {
            var address = await client.getNewAddress();
            confirmed[address] = 0;
            unconfirmed[address] = 0;
            return address;
        },

        getConfirmedBalance: async (address) => {
            return confirmed[address];
        },

        getUnconfirmedBalance: async (address) => {
            return unconfirmed[address];
        },

        trackAddress: async (address) => {
            if (Object.keys(confirmed).indexOf(address) === -1) {
                confirmed[address] = 0;
                unconfirmed[address] = 0;
            }
        },

        untrackAddress: async (address) => {
            delete confirmed[address];
            delete unconfirmed[address];
        }
    }
}
