// ==UserScript==
// @name         Deutsche Bank Vermögensentwicklung
// @namespace    https://windowsfreak.de
// @version      2.0
// @description  Collect historical Vermoegensuebersicht data
// @author       Björn Eberhardt
// @match        https://meine.deutsche-bank.de/trxm/db/invoke/*
// @grant        none
// ==/UserScript==

const navigate = true; // set to false to stop scraping through history

(function() {
    'use strict';

    // Navigated to Vermögensaufstellung?
    if (document.getElementsByTagName('h1')[0].innerText !== 'Vermögensaufstellung') {
        // Highlight menu item to find it faster
        const link = [...document.getElementsByTagName('a')].filter(item => item.text === 'Vermögensaufstellung')[0];
        link.style.fontWeight = 'bold';
        link.style.textDecoration = 'underline';
    } else {
        const parseLocaleNumber = stringNumber => {
            const thousandSeparator = (1111).toLocaleString().replace(/1/g, '');
            const decimalSeparator = (1.1).toLocaleString().replace(/1/g, '');

            return parseFloat(
                stringNumber
                    .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
                    .replace(new RegExp('\\' + decimalSeparator), '.')
            );
        };
        const eur = str => parseFloat(str).toLocaleString([], {style: 'currency', currency: 'EUR'});
        const pct = str => parseFloat(str).toLocaleString([], {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).replace('\u00A0', '');
        const dat = d => d.toLocaleDateString('de-DE', {timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric'});
        const done = () => {
            // Collect all data from memory, print it in the console and also append it on the page below the table
            console.log('done');
            const wknref = JSON.parse(localStorage.getItem('wf_wkn') || '{}');
            const catref = JSON.parse(localStorage.getItem('wf_cat') || '{}');

            const days = {};
            for (let i = 0; i < localStorage.length; i++){
                const key = localStorage.key(i);
                if (key.startsWith('wf_stats')) {
                    days[key] = JSON.parse(localStorage.getItem(key));
                }
            }
            const rows = [];
            Object.keys(days).sort().forEach(key => rows.push(days[key]));

            // Gesamtstatistik
            const heads_gesamtstatistik = [
                'ISO-Datum',
                'Datum',
                'Eingezahlt',
                'Saldo',
                'Anlagekonto',
                'Investiert',
                'Bestand',
                'G/V',
                'G/V ohne 5%',
                'G/V%',
                'G/V% ohne 5%',
            ];
            const lines_gesamtstatistik = [];
            for (let i = 0; i < rows.length; i++){
                const r = rows[i];
                lines_gesamtstatistik.push([
                    r.d_str,
                    r.d,
                    eur(r.tdep),
                    eur(r.tbal),
                    eur(r.bbal),
                    eur(r.dep),
                    eur(r.bal),
                    eur(r.chg),
                    eur(r.rch),
                    pct(r.per),
                    pct(r.rpe)
                ].join(';'));
            }
            const str_gesamtstatistik = 'Gesamtstatistik\n\n' + [heads_gesamtstatistik.join(';'), ...lines_gesamtstatistik].join('\n');
            console.log(str_gesamtstatistik);

            // Fixate WKN order
            const wkns = [];
            const heads_wkn = [];
            for (const k in wknref) {
                const v = wknref[k];
                wkns.push([k, v]);
                heads_wkn.push(k + ' - ' + v);
            }

            // Gewinn und Verlust pro Aktie
            const lines_guv = [];
            for (let i = 0; i < rows.length; i++){
                const r = rows[i];
                const l = [
                    r.d_str, r.d
                ];
                wkns.forEach(v => {
                    const dat = r.wkns[v[0]];
                    l.push(dat && eur(dat.chg))
                });
                lines_guv.push(l.join(';'));
            }
            const str_guv = 'G/V je Aktie\n\n' + [[...heads_gesamtstatistik.slice(0, 2), ...heads_wkn].join(';'), ...lines_guv].join('\n');
            console.log(str_guv);

            // Bestand pro Aktie
            const lines_bal = [];
            for (let i = 0; i < rows.length; i++){
                const r = rows[i];
                const l = [
                    r.d_str, r.d
                ];
                wkns.forEach(v => {
                    const dat = r.wkns[v[0]];
                    l.push(dat && eur(dat.bal))
                });
                lines_bal.push(l.join(';'));
            }
            const str_bal = 'Bestand je Aktie\n\n' + [[...heads_gesamtstatistik.slice(0, 2), ...heads_wkn].join(';'), ...lines_bal].join('\n');
            console.log(str_bal);

            // Fixate WKN order
            const cats = [];
            const heads_cat = [];
            for (const k in catref) {
                cats.push(k);
            }

            // Gewinn und Verlust pro Kategorie
            const lines_cguv = [];
            for (let i = 0; i < rows.length; i++){
                const r = rows[i];
                const l = [
                    r.d_str, r.d
                ];
                cats.forEach(v => {
                    const dat = r.cats[v];
                    l.push(dat && eur(dat.chg))
                });
                lines_cguv.push(l.join(';'));
            }
            const str_cguv = 'G/V je Kategorie\n\n' + [[...heads_gesamtstatistik.slice(0, 2), ...cats].join(';'), ...lines_cguv].join('\n');
            console.log(str_cguv);

            // Bestand pro Kategorie
            const lines_cbal = [];
            for (let i = 0; i < rows.length; i++){
                const r = rows[i];
                const l = [
                    r.d_str, r.d
                ];
                cats.forEach(v => {
                    const dat = r.cats[v];
                    l.push(dat && eur(dat.bal))
                });
                lines_cbal.push(l.join(';'));
            }
            const str_cbal = 'Bestand je Kategorie\n\n' + [[...heads_gesamtstatistik.slice(0, 2), ...cats].join(';'), ...lines_cbal].join('\n');
            console.log(str_cbal);

            const p = document.createElement('pre');
            p.textContent = str_gesamtstatistik + '\n\n' + str_cguv + '\n\n' + str_cbal + '\n\n' + str_guv + '\n\n' + str_bal;
            document.getElementsByClassName('option')[0].prepend(p);
        };
        const get_yyyy = date => date.toISOString().substring(0, 4);
        const get_mm = date => date.toISOString().substring(5, 7);
        const get_dd = date => date.toISOString().substring(8, 10);
        const getcat = elem => {
            while (elem) {
                const cat = elem.querySelector('#subTotal01');
                if (cat) {
                    return cat.innerText;
                }
                elem = elem.previousElementSibling;
            }
        };
        const getnum = (bal, chg) => {
            bal = parseLocaleNumber(bal).toFixed(2);
            chg = parseLocaleNumber(chg).toFixed(2);
            const dep = (bal - chg).toFixed(2);
            const rch = (bal - dep * 0.95).toFixed(2);
            const per = (chg / dep).toFixed(4);
            const rpe = (rch / (dep * 0.95)).toFixed(4);
            return {
                bal, chg, dep, rch, per, rpe
            }
        };

        // Do we see data?
        if (document.getElementsByClassName('errorMsg').length < 1) {
            // Gather it.
            const dd = document.getElementById('reportDateDay').value;
            const mm = document.getElementById('reportDateMonth').value;
            const yyyy = document.getElementById('reportDateYear').value;
            const d = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0));
            const d_str = yyyy + mm + dd;

            const wknref = JSON.parse(localStorage.getItem('wf_wkn') || '{}');
            const catref = JSON.parse(localStorage.getItem('wf_cat') || '{}');
            const wkns = {};
            const cats = {};

            let bbal = '0', bchg = '0';
            document.querySelectorAll('#lkn_detail').forEach(function(e) {
                const wkn = e.title.split(' ')[1];
                wknref[wkn] = e.innerText;
                const cat = getcat(e.closest('tr'));
                const bal = e.closest('tr').querySelector('td[headers=\'col08a\']').innerText;
                const chg = e.closest('tr').querySelector('td[headers=\'col07a\']').innerText;
                const r = getnum(bal, chg);
                wkns[wkn] = {cat, wkn, dep: r.dep, bal: r.bal, chg: r.chg, rch: r.rch, per: r.per, rpe: r.rpe};
            });
            document.querySelectorAll('#subTotal01').forEach(function(e) {
                const cat = e.innerText;
                catref[cat] = cat;
                //const cat = e.closest();
                const bal = e.closest('tr').querySelector('th[headers=\'subTotal01 col08a\']').innerText;
                const chg = e.closest('tr').querySelector('th[headers=\'subTotal01 col07a\']').innerText;
                if (cat === 'Liquidität') {
                    bbal = bal;
                    bchg = chg;
                }
                const r = getnum(bal, chg);
                cats[cat] = {cat, dep: r.dep, bal: r.bal, chg: r.chg, rch: r.rch, per: r.per, rpe: r.rpe};
            });
            const tbal = document.querySelector('td[headers=\'textTotal col08a\']').innerText;
            const tchg = document.querySelector('td[headers=\'textTotal col07a\']').innerText;
            const t = getnum(tbal, tchg);
            const b = getnum(bbal, bchg);
            const a = getnum((t.bal - b.bal).toLocaleString(), (t.chg - b.chg).toLocaleString());
            const day = {d_str, dd, mm, yyyy, d: dat(d), tdep: t.dep, tbal: t.bal, bbal: b.bal, dep: a.dep, bal: a.bal, chg: a.chg, rch: a.rch, per: a.per, rpe: a.rpe, wkns, cats};

            localStorage.setItem('wf_wkn', JSON.stringify(wknref));
            localStorage.setItem('wf_cat', JSON.stringify(catref));
            localStorage.setItem('wf_stats_' + d_str, JSON.stringify(day));

            // Do we have data from yesterday?
            const yesterday = new Date(d);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterday_str = get_yyyy(yesterday) + get_mm(yesterday) + get_dd(yesterday);

            // If not, request it.
            if (navigate && !localStorage.getItem('wf_stats_' + yesterday_str)) {
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
