var request = require("request-promise");

//Gets the price in IOP.
async function getIOPPrice() {
    //Connect to CMC, parse the data, get the USD price entry.
    return (await request({
        uri: "https://api.coinmarketcap.com/v2/ticker/1464/",
        json: true
    })).data.quotes.USD.price;
}

//Helper functions that convert between USD and IOP.
async function iopToUSD(amount) {
    return (amount * (await getIOPPrice()));
}
async function usdToIOP(amount) {
    return (amount / (await getIOPPrice()));
}

module.exports = {
    getIOPPrice: getIOPPrice,
    iopToUSD: iopToUSD,
    usdToIOP: usdToIOP
};
