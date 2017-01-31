var Botkit = require('botkit');
var Express = require('express');
var BotBuilder = require('botbuilder');
var luis = require('botkit-middleware-luis');

var luisOptions = {
    serviceUri: process.env.SERVICE_URI
};

var controller = Botkit.botframeworkbot({});
controller.middleware.receive.use(luis.middleware.receive(luisOptions));

var bot = controller.spawn({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

// if you are already using Express, you can use your own server instance...
// see "Use BotKit with an Express web server"
controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver, bot, function () {
        console.log('This bot is online!!!');
    });
});

controller.hears(['hi'], 'message_received', luis.middleware.hereIntent, function (bot, message) {

    bot.startConversation(message, function (err, convo) {
        if (message.intent == 'PolicyIssuance_PayPremium') {
            convo.say('Pay Premium');
            convo.next();
        } else if (message.intent == 'PolicyIssuance_TrackPolicy') {
            convo.say('Track policy');
            convo.next();
        } else {
            convo.say('Did someone say cookies!?!!');
            convo.ask('What is your favorite type of cookie?', function (response, convo) {
                convo.say('Golly, I love ' + response.text + ' too!!!');
                convo.next();
            });
        }
    });
});
