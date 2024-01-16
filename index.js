require("dotenv").config();
const express = require('express');
const { postToInsta } = require("./postToInsta");
const CronJob = require("cron").CronJob;

const app = express()
app.get('/', async (req, res) => {
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




// const cronInsta = new CronJob("0 */3 * * *", async () => {
//     postToInsta();
// });
// cronInsta.start();