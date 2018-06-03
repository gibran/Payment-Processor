# IOP Raffle

To setup:

1) Have your IOP node running with the RPC server enabled, and know the username/password/port.
2) Edit `data/settings.json`,
3) Make sure `data/addresses.json` is just `{}`.
4) Run `npm i`.

To run:

1) Run `node main.js`.

The site is now on port 8080. You should setup a nGinx proxy to provide SSL and map the port to 443.

To enter:

1) Go to the site.
2) Enter your name.
3) Send IOP to the newly displayed address.

To get a winner:

Run `node getWinner.js`.

To get multiple winners:

Run `node getWinner.js` multiple times.

You can definitely use a node that already has addresses/IOP on it. The raffle only checks addresses it generated.

Do not send the IOP out of the addresses until you get all of the winners.
