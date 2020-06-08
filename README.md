# deutsche-bank-tools
Greasemonkey Tools to automate access to the **Deutsche Bank OnlineBanking**

## Auto-Login.user.js
Tool that saves and loads your account credentials using your browser's password manager.

If you have exactly one account, it will login. *You can cancel it by repeatedly pressing the `Escape` key.*

With more accounts, your browser will let you choose one, or press `Cancel`.

Then you will be presented with two additional buttons right below `Login ausführen`:

`Konto auswählen` to repeat account selection and `Konto hinzufügen` to add another account.

Use the browser's password manager to delete credentials that are no longer needed.

Note: If your browser doesn't support the Credentials API, your details are instead stored in LocalStorage.
In this case, a light-red notification will appear in the login screen.

## Collect historical Vermoegensuebersicht data.user.js
Tool that saves the table displayed when clicking on `Vermögensübersicht`. It then moves to the previous day until existing data is found, or the website reports an error (i.e. the age of your account is reached).

When finished, a button is displayed to navigate to the Display script.

## Display Vermoegensentwicklung table.user.js
Tool that logs its saved table into the console and also appends it on the website.

If you want to import the data on a Google Sheet, please set the Sheet's language settings to `Deutsch (Deutschland)`, as the dates, numbers and percentages are exported in a human-readable format.

## Display Vermoegensentwicklung charts.user.js
Tool that draws charts for its saved table and allows the user to select different graphs to plot.
