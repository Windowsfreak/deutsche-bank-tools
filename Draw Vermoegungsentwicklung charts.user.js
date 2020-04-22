// ==UserScript==
// @name           Deutsche Bank Vermögensentwicklung Charts
// @name:de        Deutsche Bank Vermögensentwicklung Diagramme
// @namespace      https://windowsfreak.de
// @version        2.0
// @description    Draw Vermögensentwicklung in charts. Requires the Vermögensübersicht script.
// @description:de Stellt die Vermögensentwicklung in Diagrammen dar. Benötigt das Vermögensübersicht-Skript.
// @author         Björn Eberhardt
// @license        MIT; https://opensource.org/licenses/MIT
// @icon           https://www.deutsche-bank.de/dam/deutschebank/de/shared/logo/deutsche_bank_logo_retina.gif
// @match          https://meine.deutsche-bank.de/trxm/db/invoke/*show.assets.overview.do?showChart=1
// @match          https://meine.deutsche-bank.de/trxm/db/invoke/*show.assets.overview.do?tab=purchase&showChart=1
// @grant          none
// @require        https://code.highcharts.com/stock/highstock.js
// @require        https://code.highcharts.com/modules/boost.js
// @require        https://code.highcharts.com/modules/exporting.js
// @require        https://code.highcharts.com/modules/export-data.js
// @require        https://code.highcharts.com/modules/offline-exporting.js
// ==/UserScript==
// MIT license used to import to OpenUserJS

(function() {
    'use strict';

    // Navigated to Vermögensaufstellung?
    if (document.getElementsByTagName('h1')[0].innerText === 'Vermögensaufstellung' && window.location.href.indexOf('showChart=1') > -1) {
        let chart, series;
        const user = document.getElementById('customerNumber').childNodes[1].data.trim().replace(/\s/, '_');
        const users = () => {
            const accts = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                let match;
                if (!!(match = key.match(/wf_(.*)_cat/))) {
                    accts.push(match[1]);
                }
            }
            return accts;
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
        const defaultSettings = {
            marker: {
                radius: 3
            },
            tooltip: {
                valueSuffix: '€'
            }
        };
        const getNum = (bal, chg, dep = bal - chg, per = 100 * chg / dep) => ({
            bal: +bal.toFixed(2),
            chg: +chg.toFixed(2),
            dep: +dep.toFixed(2),
            per: +per.toFixed(2)});
        const ds = (name, overwrite, data = []) => ({ ...defaultSettings, name, data, ...overwrite });
        const prefixed_ds = name => {
            return {
                dep: ds(name + ' Eingezahlt'),
                bal: ds(name + ' Kontostand'),
                chg: ds(name + ' Gewinn'),
                per: ds(name + ' Rentabilität', {tooltip: {valueSuffix: '%'}})
            }
        };
        const addUp = (data, date, num) => data.reduce((acc, val) => val[0] === date && ((val[1] += num) || true) || acc, 0) || data.push([date, num]);
        const push = (obj, date, num) => ['dep', 'bal', 'chg', 'per'].forEach(key => addUp(obj[key].data, date, num[key]));

        const load = (accts) => {
            let wknref = {};
            let cats = [];
            const days = {};

            for (const acct of accts) {
                // Collect all data from memory, collect it in the series and also initialize the HighChart and buttons
                wknref = {...wknref, ...JSON.parse(localStorage.getItem(`wf_${acct}_wkn`) || '{}')};
                cats = [...cats, ...JSON.parse(localStorage.getItem(`wf_${acct}_cat`) || '[]')];

                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(`wf_${acct}_stats`)) {
                        days[key] = JSON.parse(localStorage.getItem(key));
                    }
                }
            }
            const rows = [];
            Object.keys(days).sort().forEach(key => rows.push(days[key]));

            series = {
                t: prefixed_ds('Gesamt'),
                b: prefixed_ds('Liquidität'),
                a: prefixed_ds('Depot'),
                cat: {},
                wkn: {}
            };

            for (const k in cats) {
                if (k != 'Liquidität') {
                    series.cat[cats[k]] = prefixed_ds(cats[k]);
                }
            }
            for (const k in wknref) {
                const v = wknref[k];
                series.wkn[k] = prefixed_ds(k + ' - ' + v);
            }

            rows.forEach(row => {
                const segments = /(\d{4})(\d{2})(\d{2})/.exec(row.d_str);
                const date = Date.parse(segments[1] + '-' + segments[2] + '-' + segments[3]);
                const t = getNum(row.tbal, row.tchg);
                const b = getNum(row.bbal, row.bchg);
                const a = getNum(row.tbal - row.bbal, row.tchg - row.bchg);
                push(series.t, date, t);
                push(series.b, date, b);
                push(series.a, date, a);
                for (let key in row.wkns) {
                    push(series.wkn[key], date, getNum(row.wkns[key].bal, row.wkns[key].chg));
                }
                for (let key in row.cats) {
                    if (key != 'Liquidität') {
                        push(series.cat[key], date, getNum(row.cats[key].bal, row.cats[key].chg));
                    }
                }
            });
        };

        const init = () => {
            Highcharts.setOptions({
                lang: {
                    decimalPoint: ',',
                    thousandsSep: '.',
                    loading: 'Daten werden geladen...',
                    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
                    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                    exportButtonTitle: "Exportieren",
                    printButtonTitle: "Drucken",
                    rangeSelectorFrom: "Von",
                    rangeSelectorTo: "Bis",
                    rangeSelectorZoom: "Zeitraum",
                    downloadPNG: 'Download als PNG-Bild',
                    downloadJPEG: 'Download als JPEG-Bild',
                    downloadPDF: 'Download als PDF-Dokument',
                    downloadSVG: 'Download als SVG-Bild',
                    resetZoom: "Zoom zurücksetzen",
                    resetZoomTitle: "Zoom zurücksetzen"
                }
            });

            const div = document.createElement('div');
            div.innerHTML = `
                Der Abruf der Daten wurde erfolgreich beendet.<br />
                <input type="button" value="Tabelle zeigen" class="button nextStep">
                <input type="button" value="Diagramm zeigen" class="button nextStep">
                <input type="button" value="Konten wählen" class="button nextStep"><br /><br />
                Zeige
                <input type="button" value="Einzahlung">
                <input type="button" value="Kontostand">
                <input type="button" value="Beides">
                <input type="button" value="Gewinn">
                <input type="button" value="Rentabilität">
                von
                <input type="button" value="Gesamt">
                <input type="button" value="Liquidität">
                <input type="button" value="Depot">
                <input type="button" value="Beides">
                <input type="button" value="Kategorien">
                <input type="button" value="Fonds">
                <div id="container" style="height: 800px"></div>`;
            [
                () => attrs(['dep']),
                () => attrs(['bal']),
                () => attrs(['dep', 'bal']),
                () => attrs(['chg']),
                () => attrs(['per']),
                () => types(['t']),
                () => types(['b']),
                () => types(['a']),
                () => types(['t', 'b', 'a']),
                () => types(['cat']),
                () => types(['wkn'])
            ].forEach((v, k) => div.getElementsByTagName('input')[k + 3].onclick = v);
            div.getElementsByTagName('input')[0].onclick = () => navigateTo('showTable');
            div.getElementsByTagName('input')[1].onclick = () => navigateTo('showChart');
            div.getElementsByTagName('input')[2].onclick = () => load(prompt('Konten mit Komma getrennt angeben, zur Auswahl stehen: ' + users().join(','), user).split(','));
            document.getElementById('assetsOverviewForm').prepend(div);
            chart = Highcharts.stockChart('container', {
                boost: {
                    useGPUTranslations: true
                },
                exporting: {
                    fallbackToExportServer: false
                },
                plotOptions: {
                    series: {
                        animation: false
                    }
                },
                title: {
                    text: 'Vermögensübersicht'
                },
                series: [],
                legend: {
                    enabled: true
                }
            });
            redraw();
        };

        let chosen_attributes = ['dep', 'bal'];
        let chosen_types = ['a'];
        const redraw = _ => {
            while (chart.series.length > 0) {
                chart.series[0].remove(false);
            }
            const chosen = [];
            chosen.push(...['t', 'b', 'a'].filter(e => chosen_types.includes(e)).map(e => series[e])
                .flatMap(
                    x => chosen_attributes.map(e => x[e])));
            chosen.push(...['cat', 'wkn'].filter(e => chosen_types.includes(e)).map(e => series[e])
                .flatMap(y => Object.values(y).flatMap(
                    x => chosen_attributes.map(e => x[e]))));
            chosen.forEach(
                x => chart.addSeries(x, false)
            );
            if (chosen.length > 0) {
                if (chosen_attributes.includes('per')) {
                    chart.yAxis[0].update({
                        labels: {
                            format: '{value}%'
                        }
                    }, false);
                } else {
                    chart.yAxis[0].update({
                        labels: {
                            format: null
                        }
                    }, false);
                }
                chart.redraw();
            }
        };
        const attrs = choice => redraw(chosen_attributes = choice) && false;
        const types = choice => redraw(chosen_types = choice) && false;

        load([user]);
        init();
    }
})();
