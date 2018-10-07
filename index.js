var { WebClient } = require('@slack/client');
console.log('Getting started with Slack Developer Kit for Node.js');
// Create a new instance of the WebClient class with the token stored in your environment variable
const { IncomingWebhook } = require('@slack/client');
const url = "https://hooks.slack.com/services/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";
const webhook = new IncomingWebhook(url);

// Send simple text to the webhook channel
webhook.send('Hey there people,how are you !!', function(err, res) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('Message sent: ', res);
    }
});