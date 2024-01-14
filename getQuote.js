const axios = require('axios');
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
module.exports = { getQuote };
