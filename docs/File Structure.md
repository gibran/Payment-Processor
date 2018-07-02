# File Tree
This file details the file tree of the project. To see how these files connect, please see the `Backend.xml` file, which should be viewed via https://draw.io.

If any file has a folder names the same thing in the same directory, it's because the file got too big (200 lines). The file details the bones of the library/code, but the folder contains all the meat.

## /
The root folder of the project. It contains Git, NPM, ESLint, Docker, and Titania config files. It also contains the license, and main source file for the project, which boots everything up.

## /docs
This folder contains all the project's in repository documentation, including this.

## /src
The source folder for the backend. It contains the core three source files:
 - coin.js - Manages the IOP node, addresses, and balances.
 - orders.js - Manages the order book, checks for TX progression...
 - ui.js and ui/ - Provides an UI for the user.

## /lib
The folder for all the supporting libraries the core three files use.
 - fs.js and fs/ - Provides a filesystem wrapper for:
   - Loading, saving, and deleting users.
   - Creating and archiving orders.
   - Loading, creating, and deleting products, as well as tracking their purchases.
   - Editing the settings (to be added).
 - accounts.js and accounts/ - Manages the users, checks for logins, provides auth tokens...
 - cmc.js - Provides an interface to CMC to get the IOP price.
 - ssl.js - Generates and saves SSL certs to the disk for use by the Express web server.

## /tests
A wildly incomplete directory of tests, organized by their routes, to test the backend. Useful for generating accounts, changing passwords... from the terminal.

## /public
All the files statically served to users. It contains HTML and the following subfolders:
 - js - JS for all the HTML pages.
   - routes - JS for interfacing with the backend.
 - css - CSS files.
 - img - Contains all the images.
 - user - Contains overrides for what the user should see when they try to get to an admin-only page.

## /admin_public
All the files statically served to admins. It's layout is the same as /public, but it doesn't have routes or img, and has much fewer files.

## /example_data
A folder for a new user to rename to /data. It contains an example config (settings.json) and subfolders:
 - ssl - Holds the SSL certs for the UI.
 - users - Holds two folders for two types of users.
   - cashiers - For all cashiers/clerks... Contains an user named user with the password pass.
   - admins - For all admins. Contains an user named admin with the password pass.
 - products - Contains all the products.
 - orders - Contains two subfolders.
   - active - For all orders from the last 24 hours that have not been completed.
   - archived - For all orders that are paid, cancelled, or over 24 hours old.
