# deutsche-bank-tools
Greasemonkey-Werkzeuge, um den Zugriff auf **Deutsche Bank OnlineBanking** zu automatisieren

## Auto-Login.user.js
Werkzeug, das Kontozugänge im Passwortmanager des Browsers sichert und lädt.

Bei genau einem Konto wird es sich automatisch einloggen. *Dies kann abgebrochen werden, indem mehrfach die `Escape`-Taste gedrückt wird.*

Mit mehreren Konten wird der Browser eine Auswahl anbieten, mit Möglichkeit zum `Abbrechen`.

Dann werden zwei weitere Schaltflächen direkt unter `Login ausführen` hinzugefügt:

`Konto auswählen`, um die Kontoauswahl zu wiederholen und `Konto hinzufügen`, um ein anderes Konto hinzuzufügen.

Mit dem browsereigenen Passwortmanager können nicht mehr benötigte Kontozugänge entfernt werden.

Hinweis: Wenn der Browser die Credentials API nicht unterstützt, werden die Zugänge stattdessen im LocalStorage gespeichert.
In diesem Fall wird ein hellroter Hinweis im Login-Bildschirm zu sehen sein.

Kontozugänge werden nicht mehr im LocalStorage gespeichert. 

## Collect historical Vermoegensuebersicht data.user.js
Werkzeug, das die Tabelle, die mit Klick auf `Vermögensübersicht` erscheint, abspeichert. Dann wird der vorige Tag aufgerufen, bis bereits Daten vorliegen, oder die Webseite Fehler meldet (i.e. das Alter des Kontos wurde erreicht).

Wenn fertig, wird eine Schaltfläche gezeigt, um zur Ausgabe zu gelangen.

## Display Vermoegensentwicklung table.user.js
Werkzeug, das die gespeicherte Tabelle in der Konsole ausgibt und auf der Webseite darstellt.

Wenn die Daten in eine Google-Tabelle importiert werden sollen, ist die Sprache auf `Deutsch (Deutschland)` umzustellen, da die Datumsangaben, Zahlen und Prozentangaben in einem menschenlesbaren Format geschrieben werden.

## Display Vermoegensentwicklung charts.user.js
Werkzeug, das die gespeicherte Tabelle als Diagramme zeichnet und dem Benutzer die Wahl zwischen verschiedenen Graphen bietet.
