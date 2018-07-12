# Payment Processor

### A Payment Processor/Point of Sale Terminal for IOP.

##### Setting up your IOP Wallet:
- Download and install the IOP Wallet.
- Click "Settings" -> "Options" -> "Open Configuration File".
- Paste in:
    ```
    server=1
    rpcuser=username
    rpcpassword=password
    rpcport=8337
    ````
- Save the file and close it.
- Reboot your IOP Wallet.

This will enable the RPC server but only for your computer.

##### Installation from Source:
Requirements:
- Node v8+
- NPM
- Git

On Powershell/Linux/Mac OS:
```
git clone https://github.com/kayabaNerve/Payment-Processor.git
cd Payment-Processor
mv example_data data
npm i
node main.js
```

##### Installation from Binaries:
- Download the binary for your system.
- Extract it.
- Run it.

The program will print out the local IP it is running out. You must include the https:// before it and the :8443 after. It uses a self signed SSL cert, which your device will likely not trust, so click "Advanced", "More Info", "Details", "I'm Sure", "Allow", "Trust", or whatever button you do have on the warning page that appears. You can access this page from any device connected to the same network.


##### First Boot
You can login with the default admin login. The username is "admin" and the password is "pass". Please immediately click the "Users" tab on the top and change your password.

From there, you can click the "Products" tab and add your products. Remember to remove the default ones.

Finally, go back to the "Users" tab, and create non-admin users for every clerk/attendant/employee who will use the system.

##### Advanced
There is a settings file under `/data/settings.json` with multiple advanced options. You can change:
- The IOP RPC port, username, and password.
- The amount of confirms required for IOP payments to be trusted. The default is one.
- The amount of USD trusted with zero confirms (instant, yet theoretically possible to manipulate), The default is $50.
- If SSL is used or not. If not, the web server will only be accessible from the computer it's running on.
