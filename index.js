require("dotenv").config();
const express = require('express')
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const CronJob = require("cron").CronJob;
const axios = require('axios');

const html2canvas = require('html2canvas');
const { createCanvas } = require('canvas');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

const app = express()
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/create', (req, res) => {
    postToInsta();
    res.send(`Image posted! 🚀`);
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

const postToInsta = async () => {
    try {
        const ig = new IgApiClient();
        ig.state.generateDevice(process.env.IG_USERNAME);
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

        const { photo, caption } = await createPost();
        let imageBuffer;
        if (photo.startsWith('data:image/')) {
            // Convert data URL to buffer
            const base64Data = photo.split(',')[1];
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
            // Convert Image URL to buffer
            imageBuffer = await get({
                url: photo,
                encoding: null,
            });
        }
        await ig.publish.photo({
            file: imageBuffer,
            caption: caption,
        });
        console.log("Image with caption posted!");
    } catch (err) {
        console.log("🚀 ~ postToInsta ~ err:", err);
    }
}
const getQuote = async () => {
    try {
        let quote = '';
        await axios
            .get("https://stoic.tekloon.net/stoic-quote")
            .then(res => {
                quote = res.data.quote;
            })
            .catch(err => console.error(err));
        return quote;
    } catch (err) {
        console.log("🚀 ~ getQuote ~ err:", err);
    }
}
const createPost = async () => {
    try {
        const quote = await getQuote();

        // Load HTML content from a file
        let htmlContent = fs.readFileSync('./post.html', 'utf-8');

        // Create a browser instance
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Set the HTML content of the page
        await page.setContent(htmlContent);

        // Add html2canvas script tag to the page
        await page.addScriptTag({ path: require.resolve('html2canvas') });

        // Modify the innerHTML of the div with id 'post-text'
        await page.evaluate((quote) => {
            const postTextElement = document.getElementById('post-text');
            if (postTextElement) {
                postTextElement.innerHTML = quote;
            }
        }, quote);

        // Wait for images to load
        await page.waitForSelector('img', { visible: true });

        // Create a canvas
        const canvas = createCanvas(1080, 1080); // Set the canvas size to a square (adjust as needed)
        const ctx = canvas.getContext('2d');

        // Use html2canvas in the browser context to capture the modified content
        const base64Image = await page.evaluate(() => {
            return new Promise((resolve) => {
                html2canvas(document.body, { useCORS: true }).then((canvas) => {
                    resolve(canvas.toDataURL('image/jpeg'));
                });
            });
        });

        // Close the browser
        await browser.close();

        let caption = `${quote} ✨

#ThoughtOfTheDay #Inspiration #DailyReflection`;

        return { photo: base64Image, caption };

    } catch (err) {
        console.log("🚀 ~ createPost ~ err:", err);
    }
};


const cronInsta = new CronJob("0 10 * * *", async () => {
    postToInsta();
});

cronInsta.start();