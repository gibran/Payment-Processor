//FS libs.
//We don't use the FS lib we built because it would mean making an extra file of ~10 lines.
var fs = require("fs");
var path = require("path");

async function generateSSLCert(ip) {
    //Lib used to generate the SSL certs.
    var pki = require("node-forge").pki;

    //Generate a key pair.
    var keys = pki.rsa.generateKeyPair(2048);

    //Set up the cert.
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    //Declare the attributes.
    var attributes = [
        {
            name: "commonName",
            value: ip
        }, {
            shortName: "OU",
            value: "IoP POS"
        }
    ];
    //Use the attributes.
    cert.setSubject(attributes);
    cert.setIssuer(attributes);

    //Declare and use the extensions.
    cert.setExtensions([
        {
            name: "subjectAltName",
            altNames: [
                {
                    type: 6,
                    value: ip
                }, {
                    type: 7,
                    ip: "127.0.0.1"
                }
            ]
        }
    ]);

    //Sign the cert.
    cert.sign(keys.privateKey);

    //Return the key and cert.
    return {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert)
    };
}

async function loadSSL(ip, sslPath) {
    try {
        if (fs.readFileSync(path.join(sslPath, "ip")).toString() !== ip) {
            throw "IP changed.";
        }
        return {
            key: fs.readFileSync(path.join(sslPath, "key.pem")),
            cert: fs.readFileSync(path.join(sslPath, "cert.pem"))
        };
    } catch(e) {
        fs.writeFileSync(path.join(sslPath, "ip"), ip);
        
        var pair = await generateSSLCert(ip);
        fs.writeFileSync(path.join(sslPath, "key.pem"), pair.key);
        fs.writeFileSync(path.join(sslPath, "cert.pem"), pair.cert);
        return pair;
    }
}

//What IPs are safe without SSL.
var safeIPs = [
    "localhost",
    "127.0.0.1"
];

//Export the generateSSLCert function and middleware for if there isn't any SSL.
module.exports = {
    loadSSL: loadSSL,
    noSSLMiddleware: async (req, res, next) => {
        if (safeIPs.indexOf(req.headers["x-forwarded-for"] || req.connection.remoteAddress) === -1) {
            return;
        }
        next();
    }
};
