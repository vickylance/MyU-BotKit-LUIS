/************* LUIS Bot - Start **************/
var Botkit = require('botkit');
var Express = require('express');
var BotBuilder = require('botbuilder');
var luis = require('botkit-middleware-luis');
var faqs = require('./faqs.js');

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
/************* LUIS Bot - End ****************/

/************* Console Bot - Start **************/
// var Botkit = require('botkit');
// var os = require('os');

// var controller = Botkit.consolebot({
//     debug: false,
// });

// var bot = controller.spawn();
/************* Console Bot - End ****************/

var Utterances = {
    yes: new RegExp(/^(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah|sounds good)/i),
    no: new RegExp(/^(no|nah|nope|n|never|not a chance)/i),
    quit: new RegExp(/^(quit|cancel|end|stop|nevermind|never mind)/i),
    greetings: new RegExp(/^(hi|hello|greetings|hi there|yo|was up|whats up)/),
    askQuestion: new RegExp(/^(a|1|i have a (question|query|doubt))/),
    buyInsurance: new RegExp(/^(b|2|i (want|like|would like) to buy (a|an) (insurance|policy|insurance policy))/),
    carRegNo: new RegExp(/(\b[a-z]{2}-\d{2}-[a-z]{2}-\d{4}\b)/)
};

var greetTheUser = function (response, convo) {
    convo.say('Hi there');
    convo.next();
};

var askHelpRequest = function (err, convo) { // Ask the User if he wants help with buying an insurance or any queries about insurance
    convo.say('Hi.. Welcome to Auto Insurance!');
    convo.say('Can you tell me what help do you need today?');
    convo.ask('\n\n[1] Do you have question?\n[2] Do you want to buy an insurance\n\n', [{
        pattern: Utterances.askQuestion,
        callback: function (response, convo) {
            askQueries(response, convo);
            convo.next();
        }
    }, {
        pattern: Utterances.buyInsurance,
        callback: function (response, convo) {
            convo.say('Awesome lets buy you an insurance.');
            convo.say('We are glad to help you get a Car Insurance. Please hold on while we connect you to our Insurance Expert. Please answer following few questions, so we can quickly get a quote that suits you!');
            buyInsurance(response, convo);
            convo.next();
        }
    }, {
        default: true,
        callback: function (response, convo) {
            convo.say('Please select correctly');
            convo.repeat();
            convo.next();
        }
    }]);
};

var buyInsurance = function (response, convo) {
    convo.ask('Do you remember your Car registration number?', [{
        pattern: Utterances.yes,
        callback: function (response, convo) {
            askCarRegNo(response, convo);
            convo.next();
        }
    }, {
        pattern: Utterances.no,
        callback: function (response, convo) {
            convo.say('Ok, no prob!');
            askCarMake(response, convo);
            convo.next();
        }
    }, {
        default: true,
        callback: function (response, convo) {
            convo.say('Please select correctly');
            convo.repeat();
            convo.next();
        }
    }]);
};

var askCarMake = function (response, convo) {
    response.text = response.text.toLowerCase();
    convo.ask('Which car do you drive?', [{
        pattern: Utterances.carRegNo,
        callback: function (response, convo) {
            convo.say('Great so you own a ' + response.text);
            convo.next();
        }
    }, {
        default: true,
        callback: function (response, convo) {
            convo.say('I couldn\'t get you');
            convo.repeat();
            convo.next();
        }
    }]);
};

var askCarRegNo = function (response, convo) {
    convo.ask('Please enter your vehicle registration number? (eg: TN-05-AB-1234)', [{
        pattern: Utterances.carRegNo,
        callback: function (response, convo) {
            askCarMake(response, convo);
            convo.next();
        }
    }, {
        default: true,
        callback: function (response, convo) {
            convo.say('Wrong Format');
            convo.repeat();
            convo.next();
        }
    }]);
};

var askQueries = function (response, convo) {
    convo.ask('Awesome ask any question.', function (response, convo) {
        convo.say('Ok! Good bye.');
        convo.stop();
    });
};

msg = "hi"; // Just an arbitary initial message
bot.startConversation(msg, greetTheUser); // Start the initial Conversation by greeting the User
controller.hears(['hi'], 'message_received', function (bot, message) { // When the user replies to the above greeting by greeting the bot, Start the conversational flow
    bot.startConversation(message, askHelpRequest);
});
