// ==UserScript==
// @name         Deutsche Bank Vermögensentwicklung
// @namespace    https://windowsfreak.de
// @version      1.0
// @description  Collect historical Vermögensübersicht data
// @author       Björn Eberhardt
// @match        https://meine.deutsche-bank.de/trxm/db/invoke/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Navigated to Vermögensaufstellung?
    if (document.getElementsByTagName('h1')[0].innerText != 'Vermögensaufstellung') {
        // Highlight menu item to find it faster
        var link = [...document.getElementsByTagName('a')].filter(item => item.text == 'Vermögensaufstellung')[0];
        link.style.fontWeight = 'bold';
        link.style.textDecoration = 'underline';
        // [...document.getElementsByTagName('a')].filter(item => item.text == 'Vermögensaufstellung')[0].click();
    } else {
        function done() {
            // Collect all data from memory, print it in the console and also append it on the page below the table
            console.log('done');
            var data = {};
            for (var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                if (key.startsWith('wf_stats')) {
                    data[key] = localStorage.getItem(key);
                }
            }
            var strings = [];
            Object.keys(data).sort().forEach(key => strings.push(key + '\t' + data[key]));
            console.log(strings.join('\n'));
            var p = document.createElement('pre');
            var text = strings.join('\n').replace(/\t/g, ';');
            p.textContent = text;
            document.getElementsByClassName('option')[0].prepend(p);
        }
        function get_yyyy(date) {
            return date.toISOString().substring(0, 4)
        }
        function get_mm(date) {
            return date.toISOString().substring(5, 7)
        }
        function get_dd(date) {
            return date.toISOString().substring(8, 10)
        }
        function parseLocaleNumber(stringNumber) {
            var thousandSeparator = (1111).toLocaleString().replace(/1/g, '');
            var decimalSeparator = (1.1).toLocaleString().replace(/1/g, '');

            return parseFloat(
                stringNumber
                .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
                .replace(new RegExp('\\' + decimalSeparator), '.')
            );
        }

        // Do we see data?
        if (document.getElementsByClassName('errorMsg').length < 1) {
            // Gather it.
            var dd = document.getElementById('reportDateDay').value
            var mm = document.getElementById('reportDateMonth').value
            var yyyy = document.getElementById('reportDateYear').value
            var d = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0));
            var d_str = yyyy + mm + dd;

            // See if our desired categories are present and get their totals.
            var subsequents = document.getElementsByClassName('subsequent');
            var savings = [...document.getElementsByClassName('subsequent')].filter(item => item.getElementsByTagName('a')[0].textContent == 'Liquidität')[0];
            var stakes = [...document.getElementsByClassName('subsequent')].filter(item => item.getElementsByTagName('a')[0].textContent == 'Multi Asset')[0];
            var totalBalances = document.getElementsByClassName('total')[0].getElementsByClassName('balance');
            var savingsDelta = savings == null ? 0 : parseLocaleNumber(savings.getElementsByClassName('balance')[0].textContent);
            var savingsTotal = savings == null ? 0 : parseLocaleNumber(savings.getElementsByClassName('balance')[1].textContent);
            var stakeDelta = stakes == null ? 0 : parseLocaleNumber(stakes.getElementsByClassName('balance')[0].textContent);
            var stakeTotal = stakes == null ? 0 : parseLocaleNumber(stakes.getElementsByClassName('balance')[1].textContent);
            var totalDelta = parseLocaleNumber(totalBalances[0].textContent);
            var totalTotal = parseLocaleNumber(totalBalances[1].textContent);
            localStorage.setItem('wf_stats_' + d_str, dd + '.' + mm + '.' + yyyy + '\t' + savingsDelta + '\t' + savingsTotal + '\t' + stakeDelta + '\t' + stakeTotal + '\t' + totalDelta + '\t' + totalTotal);

            // Do we have data from yesterday?
            var yesterday = new Date(d);
            yesterday.setDate(yesterday.getDate() - 1);
            var yesterday_str = get_yyyy(yesterday) + get_mm(yesterday) + get_dd(yesterday);

            // If not, request it.
            if (!localStorage.getItem('wf_stats_' + yesterday_str)) {
                document.getElementById('reportDateDay').value = get_dd(yesterday);
                document.getElementById('reportDateMonth').value = get_mm(yesterday);
                document.getElementById('reportDateYear').value = get_yyyy(yesterday);

                document.getElementsByClassName('button refresh')[0].click();
            } else {
                done();
            }
        } else {
            done();
        }
    }
})();