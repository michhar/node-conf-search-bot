require('./config.js')();
require('./connectorSetup.js')();
require('./helpers.js')();
require('./search.js')();
require('./dialogs/events.js')();
require('./dialogs/people.js')(); 
require('./dialogs/results.js')();
require('./dialogs/eliza.js')();
var emailSender = require('./dialogs/emailSender.js');
var customQnAMakerTools = require('./CustomQnAMakerTools');
var cognitiveservices = require("botbuilder-cognitiveservices");

/*
Set up QNA Maker logic
*/

var qnarecognizer = new cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: process.env.QNAMAKER_ID, 
	subscriptionKey: process.env.QNAMAKER_KEY,
    top: 3});

var customQnAMakerTools = new customQnAMakerTools.CustomQnAMakerTools();
bot.library(customQnAMakerTools.createLibrary());

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
	recognizers: [qnarecognizer],
	defaultMessage: "Ask a FAQ-type question or type 'quit' to exit.  \
        At this point I can't answer agenda-related queries.  Email \
        DSMLEVNT to reach a human.",
	qnaThreshold: 0.5,
	feedbackLib: customQnAMakerTools
});

// Overload the response method
basicQnAMakerDialog.respondFromQnAMakerResult = function(session, results){
    if (results.answers[0] != null ) {
        // Custom logging response
        var response = 'Here is the match from FAQ:  \r\n  Q: ' + 
            results.answers[0].questions[0] + '  \r\n A: ' + 
            results.answers[0].answer;
        session.send(response);
        session.replaceDialog('/');
    } else {
        session.send("I’m sorry, I don’t know the answer. " + 
            "Revise your question, or email DSMLEVNT to get in touch with a human.");
        session.replaceDialog('/');
    }
}

// Overload log user query and matched Q&A before ending the dialog
basicQnAMakerDialog.defaultWaitNextMessage = function(session, qnaMakerResult){
	if(session.privateConversationData.qnaFeedbackUserQuestion != null 
    && qnaMakerResult.answers != null 
    && qnaMakerResult.answers.length == 1 
	&& qnaMakerResult.answers[0].questions != null 
    && qnaMakerResult.answers[0].questions.length == 1 
    && qnaMakerResult.answers[0].answer != null){
        // Add custom logging to response
        console.log('User Query: ' + session.privateConversationData.qnaFeedbackUserQuestion);
        console.log('KB Question: ' + qnaMakerResult.answers[0].questions[0]);
        console.log('KB Answer: ' + qnaMakerResult.answers[0].answer);
        session.privateConversationData.qnaMakerResult = qnaMakerResult;

    }
}

// QnA Maker route
bot.dialog('/faqs', basicQnAMakerDialog);

bot.dialog('/welcome', [
    function (session) {
            session.userData.welcome = true;
            session.sendTyping();       
            var msg = "Hi there! I'm a helper bot for the MLADS Spring 2017 Conference. \
                I was built with a very specific task in mind - to help users \
                access FAQ information or recieve help quickly. I can answer some FAQ-style \
                questions (nothing related to the agenda, though) or email a human.";
            session.endDialog(msg);
    }
]);


/*
Root dialog - we will return here at the end of every child dialog with endDialogs
*/

bot.dialog('/', [
    function (session) {
        session.sendTyping();
        session.privateConversationData.clickingButtons = false;
        if (session.userData.welcome != true)
        {
             session.replaceDialog('/welcome');
        }

        var choices = [
            "Schedule Explorer",
            "Speaker Search",
            "General Information",
            "Email a Human",
            "Eliza"
            ]

        builder.Prompts.choice(session, "Please choose a menu button or type 'help' for guidance.  \
            How would you like to explore MLADS?", 
            choices, { listStyle: builder.ListStyle.button, 
            maxRetries: 0
        });
    },
    function (session, results, next) {
        // session.sendTyping();
        if (results.response) {
            session.privateConversationData.clickingButtons = true;
            var selection = results.response.entity;
            // route to corresponding dialogs
            switch (selection) {
                case "Schedule Explorer":
                    session.replaceDialog('/sessions');
                    break;
                case "Speaker Search":
                    session.replaceDialog('/people');
                    break;
                case "General Information":
                    session.replaceDialog('/faqs');
                    break;
                case "Email a Human":
                    session.replaceDialog('/sendEmail');
                    break;
                case "Eliza":
                    session.replaceDialog('/eliza');
                    break;
                default:
                    session.send("I didn't understand.  Please choose a menu item or type 'help' for guidance.");
                    session.replaceDialog('/');
                    break;
            }
        }
        else {
            var randint = getRandomInt(0, random_greeting.length-1);
            session.send(random_greeting[randint]);
            session.replaceDialog('/');
        }
    }
]);


/*============================================================
Exit dialog
// ============================================================*/

// Example of a triggered action - when user types something matched by
// the trigger, this dialog begins, clearing the stack and interrupting
// the current dialog (so be cognizant of this).
bot.dialog('/bye', function (session) {
    // end dialog with a cleared stack.  we may want to add an 'onInterrupted'
    // handler to this dialog to keep the state of the current
    // conversation by doing something with the dialog stack
    var randint = getRandomInt(0, random_salutation.length-1);
    session.send(random_salutation[randint]);
    restart(session);
}).triggerAction({matches: /^bye|^quit|^exit|^done/i});


/*
Help dialog
*/

bot.library(require('./dialogs/help').createLibrary());

// Trigger secondary dialogs when 'support' or 'help' is called
bot.use({
    botbuilder: function (session, next) {
        var text = session.message.text;
        var supportRegex = localizedRegex(session, ['^[Ss]upport', '^[Hh]elp', '[Hh]ello']);
        if (supportRegex.test(text)) {
            // Send a random greeting
            var randint = getRandomInt(0, random_greeting.length-1);
            session.send(random_greeting[randint]);
            // Interrupt and trigger 'help' dialog
            return session.beginDialog('help:/');
        }
        // continue normal flow
        next();
    }
});

// Cache of localized regex to match selection from main options
var LocalizedRegexCache = {};
function localizedRegex(session, localeKeys) {
    var locale = session.preferredLocale();
    var cacheKey = locale + ":" + localeKeys.join('|');
    if (LocalizedRegexCache.hasOwnProperty(cacheKey)) {
        return LocalizedRegexCache[cacheKey];
    }
    var localizedStrings = localeKeys.map(function (key) { return session.localizer.gettext(locale, key); });
    var regex = new RegExp('^(' + localizedStrings.join('|') + ')', 'i');
    LocalizedRegexCache[cacheKey] = regex;
    return regex;
}



