//Global variables for the IOP client, confirms needed, confirmed address->balance, and unconfirmed address->balance.
var client, confirms, confirmed, unconfirmed;

//Updates the balances of all tracked addresses.
//Takes in the confs needed and a var to store them in.
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
    //Create the BTC client.
    client = new (require("bitcoin-core"))({
        host: "localhost",
        username: settings.rpcuser,
        password: settings.rpcpass,
        port: settings.rpcport,
        headers: false
    });

    //Set the confirms.
    confirms = settings.confirms;

    //Init the RAM caches.
    confirmed = {};
    unconfirmed = {};

    //Get the balances, confirmed and unconfirmed, and update them every 20 seconds.
    await updateBalances(confirms, confirmed);
    await updateBalances(0, unconfirmed);
    setInterval(updateBalances, 20*1000, confirms, confirmed);
    setInterval(updateBalances, 20*1000, 0, unconfirmed);

    //Return the getNewAddress, get*Balance, and manual track/untrack functions.
    return {
        getNewAddress: async () => {
            //Get a new address from the node.
            var address = await client.getNewAddress();
            //Init their place in the RAM cache.
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

        //This is for loading orders from the previous boot that were never archived.
        trackAddress: async (address) => {
            if (Object.keys(confirmed).indexOf(address) === -1) {
                confirmed[address] = 0;
                unconfirmed[address] = 0;
            }
        },

        //This is for untracking an address when the order is archived.
        untrackAddress: async (address) => {
            delete confirmed[address];
            delete unconfirmed[address];
        }
    };
}
