// ==UserScript==
// @name           Deutsche Bank Vermögensübersicht
// @name:de        Deutsche Bank Vermögensübersicht
// @namespace      https://windowsfreak.de
// @version        3.1
// @description    Collects historical Vermögensübersicht data for Vermögensentwicklung.
// @description:de Sammelt historische Daten aus der Vermögensübersicht für die Vermögensentwicklung.
// @author         Björn Eberhardt
// @license        Unlicense, http://unlicense.org/
// @icon           https://www.deutsche-bank.de/dam/deutschebank/de/shared/logo/deutsche_bank_logo_retina.gif
// @match          https://meine.deutsche-bank.de/trxm/db/invoke/*show.assets.overview.do
// @match          https://meine.deutsche-bank.de/trxm/db/invoke/*show.assets.overview.do?tab=purchase
// @grant          none
// ==/UserScript==


(function() {
    'use strict';

    const $ = id => document.getElementById(id);
    const $tt = name => document.getElementsByTagName(name);
    const $cc = name => document.getElementsByClassName(name);
    const $qsa = name => document.querySelectorAll(name);

    // Navigated to Vermögensaufstellung?
    if ($tt('h1')[0].innerText !== 'Vermögensaufstellung') {
        // Highlight menu item to find it faster
        const link = [...$tt('a')].filter(item => item.text === 'Vermögensaufstellung')[0];
        link.style.fontWeight = 'bold';
        link.style.textDecoration = 'underline';
    } else {
        const navigate = true; // set to false to stop scraping through history
        const user = $('customerNumber').childNodes[1].data.trim().replace(/\s/, '_');
        const reportDateFields = ['reportDateYear', 'reportDateMonth', 'reportDateDay'];
        const parseLocaleNumber = stringNumber => {
            const thousandSeparator = (1111).toLocaleString().replace(/1/g, '');
            const decimalSeparator = (1.1).toLocaleString().replace(/1/g, '');

            return parseFloat(
                stringNumber
                    .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
                    .replace(new RegExp('\\' + decimalSeparator), '.')
            );
        };
        const navigateTo = target => {
            const url = new URL(window.location.href);
            for (let param of url.searchParams.keys()) {
                if (param.indexOf('show') >= 0) {
                    url.searchParams.delete(param);
                }
            }
            url.searchParams.append(target, '1');
            window.location.href = url.href;
        };
        const done = () => {
            console.log('done');
            const d = document.createElement('div');
            d.innerHTML = 'Der Abruf der Daten wurde erfolgreich beendet.<br /> <input type="button" value="Tabelle zeigen" class="button nextStep"> <input type="button" value="Diagramm zeigen" class="button nextStep">';
            d.getElementsByTagName('input')[0].onclick = () => navigateTo('showTable');
            d.getElementsByTagName('input')[1].onclick = () => navigateTo('showChart');
            $('assetsOverviewForm').prepend(d);
        };
        const to8Char = parts => `${parts[0]}${parts[1]}${parts[2]}`;
        const parseDate = (date, str = date.toISOString()) => [str.substring(0, 4), str.substring(5, 7), str.substring(8, 10)];
        const formatDate = d => d.toLocaleDateString('de-DE', {timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric'});
        const getDate = () => reportDateFields.map(key => $(key).value);
        const setDate = date => reportDateFields.forEach((key, index) => $(key).value = date[index]) || $cc('button refresh')[0].click();
        const getCat = elem => {
            while (elem) {
                const cat = elem.querySelector('#subTotal01');
                if (cat) {
                    return cat.innerText;
                }
                elem = elem.previousElementSibling;
            }
        };
        const parseNum = node => parseLocaleNumber(node.innerText);

        // Do we see data?
        if ($cc('errorMsg').length < 1) {
            // Gather it.
            const d = getDate();
            const today = new Date(Date.UTC(d[0], d[1] - 1, d[2], 0, 0, 0, 0));
            const todayStr = to8Char(d);

            const wknref = JSON.parse(localStorage.getItem(`wf_${user}_wkn`) || '{}');
            const catref = JSON.parse(localStorage.getItem(`wf_${user}_cat`) || '[]');
            const wkns = {};
            const cats = {};

            let bbal = 0, bchg = 0;
            $qsa('#lkn_detail').forEach(e => {
                const wkn = e.title.split(' ')[1];
                wknref[wkn] = e.innerText;
                const cat = getCat(e.closest('tr'));
                const bal = parseNum(e.closest('tr').querySelector('td[headers=\'col08a\']'));
                const chg = parseNum(e.closest('tr').querySelector('td[headers=\'col07a\']'));
                wkns[wkn] = {cat, wkn, bal, chg};
            });
            $qsa('#subTotal01').forEach(e => {
                const cat = e.innerText;
                catref.includes(cat) || catref.push(cat);
                const bal = parseNum(e.closest('tr').querySelector('th[headers=\'subTotal01 col08a\']'));
                const chg = parseNum(e.closest('tr').querySelector('th[headers=\'subTotal01 col07a\']'));
                if (cat === 'Liquidität') {
                    bbal = bal;
                    bchg = chg;
                }
                cats[cat] = {cat, bal, chg};
            });
            const tbal = parseNum(document.querySelector('td[headers=\'textTotal col08a\']'));
            const tchg = parseNum(document.querySelector('td[headers=\'textTotal col07a\']'));
            const day = {d_str: todayStr, d: formatDate(today), tbal, tchg, bbal, bchg, wkns, cats};

            localStorage.setItem(`wf_${user}_wkn`, JSON.stringify(wknref));
            localStorage.setItem(`wf_${user}_cat`, JSON.stringify(catref));
            localStorage.setItem(`wf_${user}_stats_${todayStr}`, JSON.stringify(day));

            // Do we have data from yesterday?
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = to8Char(parseDate(yesterday));

            // If not, request it.
            if (navigate && !localStorage.getItem(`wf_${user}_stats_${yesterdayStr}`)) {
                setDate(parseDate(yesterday));
            } else {
                done();
            }
        } else {
            done();
        }
    }
})();
