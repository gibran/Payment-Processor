module.exports = (success) => {
    if (!(success)) {
        console.log("ERROR! TEST FAILED!");
        
        process.exit(-1);
    }
}
