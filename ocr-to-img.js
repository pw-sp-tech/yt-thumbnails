const puppeteer = require('puppeteer')
const mjAPI = require('./node_modules/mathjax-node-page/lib/main.js').mjpage;
module.exports = async function fetchSVG(ocr) {
    return await getSVGFromOCR(ocr)
}
var browser;
puppeteer.launch({
    headless: true,
    'args': [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
    ]
}).then(browser2 => {
    browser = browser2
});
async function getSVGFromOCR(ocr) {
    return new Promise((resolve, reject) => {
        mjAPI(cut(String.raw `${ocr}`, 0), {
            format: ['TeX'],
            MathJax: {
                SVG: {
                    font: "STIX-Web"
                },
                tex2jax: {
                    inlineMath: [
                        ['\\(', '\\)']
                    ]
                }
            }
        }, {
            html: true,
            svg: true
        }, async function(output) {
            // console.log(output);
            let html = output.replace("<body>", `<body style="overflow-wrap: anywhere;font-size:10vh;color:white;">`)
            const page = await browser.newPage();
            const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
                'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
            await page.setUserAgent(userAgent);
            await page.evaluate(() => document.body.style.background = 'transparent');
            await page.setViewport({
                width: 800,
                height: 300,
                deviceScaleFactor: 1,
            });
            await page.setContent(html);
            let imageBuffer = await page.screenshot({
                omitBackground: true
            });
            resolve(imageBuffer);
            await page.close();
        });
    })
}



function cut(str) {
    if (str.length < 260 && str.split("\n").length < 7) {
        return String.raw `${str}`.split("\n").join(" <br> ");
    }
    let cutLength = 260;
    str = str.slice(0, cutLength);
    while ((str.match(/\\\(/g) && (str.match(/\\\)/g).length != str.match(/\\\(/g).length)) || str.match(/\\$/g, "")) {
        str = str.slice(0, cutLength);
        cutLength--;
    }
    str = str.split("\n").slice(0, 7).join(" <br> ")
    console.log(String.raw `${str}...`)
    return String.raw `${str}...`;
}