var request = require("request-promise");

//Formats IOP to have 4 decimal places.
async function iopFormat(iop) {
    iop = iop.toString();
    if (iop.indexOf(".") > -1) {
        iop = iop.split(".");
        iop[1] = iop[1].substr(0, 4);
        iop = iop.join(".");
    }
    return iop;
}

//Gets the price in IOP.
async function getIOPPrice() {
    //Connect to CMC, parse the data, get the USD price entry.
    try {
        return (await request({
            uri: "https://api.coinmarketcap.com/v2/ticker/1464/",
            json: true
        })).data.quotes.USD.price;
    } catch(e) {
        //If we couldn't connect to CMC, just use 2. 2 is simple.
        //This is for testing. This should crash the program in the future.
        return 2;
    }
}

//Helper functions that convert between USD and IOP.
async function iopToUSD(amount) {
    return (amount * (await getIOPPrice()));
}
async function usdToIOP(amount) {
    return (amount / (await getIOPPrice()));
}

module.exports = {
    iopFormat: iopFormat,
    getIOPPrice: getIOPPrice,
    iopToUSD: iopToUSD,
    usdToIOP: usdToIOP
};
