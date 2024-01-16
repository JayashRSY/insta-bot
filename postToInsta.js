const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const { createPost } = require('./createPost');

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
        console.error("🚀 ~ postToInsta ~ Error:", err);

        // Customize error response based on the type of error
        let errorMessage = 'An error occurred while posting to Instagram.';
        if (err.message && err.message.includes('login_required')) {
            errorMessage = 'Instagram login failed. Please check your credentials.';
        }

        return {
            success: false,
            message: errorMessage,
            error: err,
        };
    }
}

module.exports = { postToInsta };
