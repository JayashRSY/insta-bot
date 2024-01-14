const html2canvas = require('html2canvas');
const { getQuote } = require('./getQuote');
const { createCanvas } = require('canvas');
const puppeteer = require('puppeteer');
const fs = require('fs');
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

module.exports = { createPost };
