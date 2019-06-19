# deutsche-bank-tools
Greasemonkey Tools to automate access to the **Deutsche Bank OnlineBanking**

## Auto-Login.user.js
Tool that enters your `Filiale` and `Kontonummer` automatically when loading the banking website, because Google Chrome does not automatically store it in its password manager.

On first execution, you will be prompted for the `Filiale` and `Kontonummer` when going to the web page. It will then be stored. If you mistype, please delete it from the *LocalStorage*; go to Inspector, Application, Storage and delete the key `wf_login`.

Note that it automatically presses the log-in button once, and expects a pin to be provided by Google Chrome's password manager.

## Collect historical Vermögensübersicht data.user.js
Tool that saves the table displayed when clicking on `Vermögensübersicht`. It then moves to the previous day until existing data is found or the website reports an error (i.e. the age of your account is reached). Then it logs its table into the console and also appends it below the website.

If you want to import the data on a Google Sheet, please set the Sheet's language settings to `English (United States)`, as the numbers are converted in a format that JSON parsers would accept.

Suggested table header names are (Savings = Liquidität, Stake = Multi Asset): `Row;Date;Savings Delta;Savings Value;Stake Delta;Stake Value;Total Delta;Total Value`, and you can easily compute each **deposit** from their value minus delta.
