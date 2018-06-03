var request = require("request-promise");

async function getIOPPrice() {
    return (await request({
        uri: "https://api.coinmarketcap.com/v2/ticker/1464/",
        json: true
    })).data.quotes.USD.price;
}

async function iopToUsd(amount) {
    return (amount * (await getIOPPrice()));
}

module.exports = {
    getIOPPrice: getIOPPrice,
    iopToUsd: iopToUsd
};
