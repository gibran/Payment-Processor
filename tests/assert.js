module.exports = (success) => {
    if (!(success)) {
        /*eslint-disable-next-line no-console*/
        console.log("ERROR! TEST FAILED!");

        process.exit(-1);
    }
};
