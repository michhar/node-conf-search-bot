var builder = require('botbuilder');

var lib = new builder.Library('help');
lib.dialog('/', builder.DialogAction.endDialog("I can:\
      \n* help you find talks by track and day\
      \n* help you find talks by speaker name\
      \n* answer general FAQ-type questions\
      \n* email the event coordinators\
      \n* become Eliza, your Rogerian psychotherapist\
    \nExit a conversation at any time by typing 'quit' or 'bye'"));

// Export createLibrary() function to be used in other dialogs
module.exports.createLibrary = function () {
    return lib.clone();
};

var random_greeting = [
    'Greetings new friend.',
    "Hello there!",
    "Having fun I hope?",
    "Glad we've met.",
    "Happy to help!"
]

