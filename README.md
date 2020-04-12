# deutsche-bank-tools
Greasemonkey Tools to automate access to the **Deutsche Bank OnlineBanking**

## Auto-Login.user.js
Tool that saves and loads your account credentials using your browser's password manager.

If you have exactly one account, it will login. *You can cancel it by repeatedly pressing the `Escape` key.*

With more accounts, your browser will let you choose one, or press `Cancel`.

Then you will be presented with two additional buttons right below `Login ausführen`:

`Konto auswählen` to repeat account selection and `Konto hinzufügen` to add another account.

Credentials are no longer stored in LocalStorage. Use your browser's password manager to delete outdated credentials.

## Collect historical Vermögensübersicht data.user.js
Tool that saves the table displayed when clicking on `Vermögensübersicht`. It then moves to the previous day until existing data is found or the website reports an error (i.e. the age of your account is reached). Then it logs its table into the console and also appends it below the website.

If you want to import the data on a Google Sheet, please set the Sheet's language settings to `Deutsch (Deutschland)`, as the dates, numbers and percentages are exported in a human-readable format.
