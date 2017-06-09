var elizaBot = require('./../elizabot/elizabot');

module.exports = function () {
    // Initialize a fresh eliza instance from the beginning
    var eliza = new elizaBot.ElizaBot();
    bot.dialog('/eliza', [
        function (session, args) {
            // If we are starting a fresh conversation
            if (!session.privateConversationData.eliza) {
                session.send("You can stop this conversation any time by typing 'done'.");
                var initial = eliza.getInitial();
                builder.Prompts.text(session, initial);
            } 
            // Otherwise we are picking up where we left off
            else {
                var reply = eliza.transform(session.privateConversationData.lastelizauserresponse);
                builder.Prompts.text(session, reply);
            }
        },
        function (session, results) {
            var reply = eliza.transform(results.response);
            // In case user says quit phrase
            if (eliza.quit) {
                var final = eliza.getFinal();
                session.send(final);
                restart(session);
            } else{
                builder.Prompts.text(session, reply);
            }
        },
        function (session, results) {
            if (eliza.quit) {
                var final = eliza.getFinal();
                session.send(final);
                restart(session);
            }
            else {
                session.privateConversationData.eliza = true;
                session.privateConversationData.lastelizauserresponse = results.response;
                restartDialog(session, '/eliza');
            }
        }
    ]
    )};