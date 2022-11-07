const express = require('express');
const Jimp = require('jimp');
const bodyParser = require('body-parser');
const app = express();
const getImageFromOCR = require('./ocr-to-img');
app.use(bodyParser.json());

app.post('/create-thumbnail', async(req, res) => {
    const body = req.body;
    const ocr = body.ocr;
    const classNum = body.classNum;
    const chapter = body.chapter;
    const exam = body.exam;
    const subject = body.subject;
    let template = await Jimp.read('./template.png')
    let ocrPngPath = await getImageFromOCR(ocr);
    let ocrPNG = await Jimp.read(ocrPngPath);
    let font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    let image = template.composite(ocrPNG, 30, 290, {
        mode: Jimp.BLEND_ADD,
        opacitySource: 1,
        opacityDest: 1
    }).print(font, 70, 50, `Class ${classNum} - ${subject}`).print(font, 70, 200, exam).print(font, 100, 650, chapter);
    res.setHeader("content-type", 'image/png')
    image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        res.send(buffer);
    });
});
app.get('/', async (req, res) => {
    res.send({
        msg: "Working"
    })
})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('server started on ' + port)
})