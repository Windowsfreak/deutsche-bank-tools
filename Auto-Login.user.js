// ==UserScript==
// @name           Deutsche Bank Auto-Login
// @name:de        Deutsche Bank Auto-Login
// @namespace      https://windowsfreak.de
// @version        2.1
// @description    Help Google Chrome auto-save account information. Supports multiple credentials.
// @description:de Google Chrome helfen, das Benutzerkonto zu speichern. Unterstützt mehrere Konten.
// @author         Björn Eberhardt
// @license        Unlicense, http://unlicense.org/
// @icon           https://www.deutsche-bank.de/dam/deutschebank/de/shared/logo/deutsche_bank_logo_retina.gif
// @include        https://meine.deutsche-bank.de/trxm/db/
// @include        https://meine.deutsche-bank.de/trxm/db/init.do
// @grant          none
// ==/UserScript==

// Help Google Chrome auto-save account information

(function() {
    'use strict';

    if (window.location.href.indexOf('https://meine.deutsche-bank.de/trxm/db/') > -1) {
        const $ = name => document.getElementsByName(name)[0];
        const $c = (name, pos = 0) => document.getElementsByClassName(name)[pos];
        const submit = () => // Caps-Lock is a hidden error message
            (document.getElementsByClassName('errorMsg').length < 2) ?
                $c('nextStep').click() :
                $c('nextStep').focus();
        const regex = /^(\d+)\/(\d+) (\d+)$/;
        const toUser = d => `${d[0]}/${d[1]} ${d[2]}`;
        const fromUser = d => regex.exec(d).slice(1);
        const fillForm = d => ['branch', 'account', 'subaccount', 'pin'].forEach((name, index) => $(name).value = d[index]) || true;
        const promptUser = (d, field) => {
            d[field] = '<EINGABE>';
            d[field] = prompt(`Bitte das mit Eingabe markierte Feld ausfüllen:\n\nFiliale: ${d[0]}\nKonto: ${d[1]}\nUnterkonto: ${d[2]}\nPIN: ${d[3]}`);
            return d[field] !== null;
        };
        const createUser = () => {
            let d = ['', '', '', ''], field = 0;
            while (field < 4 && promptUser(d, field++));
            const user = toUser(d);
            if (!regex.test(user)) {
                return alert('Fehler: Die eingegebenen Felder dürfen nur aus Ziffern bestehen.');
            }
            fillForm(d);
            return navigator.credentials.create({password: {
                    id: user,
                    password: d[3],
                    iconURL: new URL('/trxmcontent/20.06.0.0_PR07-f73e406b3ee/global/default/images/logo_db.gif', document.baseURI).href
                }})
                .then(p => navigator.credentials.store(p))
                .then(submit);
        };
        const login = async () => {
            let p = await navigator.credentials.get({password: true});
            return await p && fillForm([...fromUser(p.id), p.password]) && submit();
        };
        const load = () => {
            $c('nextStep').parentNode.innerHTML +=
                '<input type="button" value="Konto auswählen" class="button nextStep">' +
                '<input type="button" value="Konto hinzufügen" class="button nextStep">';
            $c('nextStep', 1).onclick = login;
            $c('nextStep', 2).onclick = createUser;
            login();
        };
        window.setTimeout(load, 0);
    }
})();
