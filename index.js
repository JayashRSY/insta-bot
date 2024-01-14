require("dotenv").config();
const { createPost } = require('./createPost');
const express = require('express')
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const CronJob = require("cron").CronJob;

const app = express()
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/create', async (req, res) => {
    const result = await postToInsta();
    res.json({ result: result });
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
        console.log("🚀 ~ postToInsta ~ Post successful! ✅");
        return "Post successful! ✅";
    } catch (err) {
        console.log("🚀 ~ postToInsta ~ err:", err);
        return ("Post Failed! ❌", err);
    }
}


const cronInsta = new CronJob("0 */3 * * *", async () => {
    postToInsta();
});
cronInsta.start();