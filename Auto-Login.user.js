// ==UserScript==
// @name         Deutsche Bank Auto-Login
// @namespace    https://windowsfreak.de
// @version      1.0
// @description  Help Google Chrome auto-save account information
// @author       Björn Eberhardt
// @include      https://meine.deutsche-bank.de/trxm/db/
// @include      https://meine.deutsche-bank.de/trxm/db/init.do
// @grant        none
// ==/UserScript==

// Help Google Chrome auto-save account information

(function() {
    'use strict';

    if (window.location.href.indexOf('https://meine.deutsche-bank.de/trxm/db/') > -1) {
        function setValues() {
            var details = prompt("Filiale und Kontonummer, mit Schrägstrich getrennt, z.B. 600/1234567", "600/");
            if (details !== null) {
                localStorage.setItem('wf_login', details);
                return true;
            }
            return false;
        }

        function getValues() {
            var details = localStorage.getItem('wf_login');
            if (!details) {
                if (setValues()) {
                    return getValues();
                }
            }
            return details.split('/');
        }

        function submit() {
            // Caps-Lock is a hidden error message
            if (document.getElementsByClassName('errorMsg').length < 2) {
                document.getElementsByName("loginType")[0].click();
            } else {
                document.getElementsByName("loginType")[0].focus();
            }
        }

        var values = getValues();
        document.getElementsByName("branch")[0].value = values[0];
        document.getElementsByName("account")[0].value = values[1];

        window.setTimeout(submit, 0);
    }
})();