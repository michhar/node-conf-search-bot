module.exports = function () {

    bot.dialog('/ShowResults', [
        function (session, queryData) {
            var msg = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel);
            var msgTitle = global.generateMessageTitle(session);
            var results = session.privateConversationData.queryResults;

            switch (session.privateConversationData.searchType) {
                case "person":
                    sortEvents(session);
                        session.privateConversationData.fullDescription = [];
                        if (results.length > 0) {
                        results.forEach(function (result, i) {
                            var buttonAction = [];
                            if (results.length > 1) {
                                buttonAction = [builder.CardAction.imBack(session, result.title + 
                                    "\nSpeakers: " + result.speakers + "\n\n" + result.description, 
                                    "Full Description " + (i + 1))];
                                session.privateConversationData.fullDescription[i] = "Speakers: " + 
                                    result.speakers + "\n\n" + result.description;
                            } else {
                                buttonAction = [builder.CardAction.imBack(session, results[0].title + 
                                    "\nSpeakers: " + results[0].speakers + "\n\n" + results[0].description, 
                                    "Full Description")];
                                session.privateConversationData.fullDescription[0] = "Speakers: " + 
                                    results[0].speakers + "\n\n" + results[0].description; 
                            }
                            msg.addAttachment(
                                new builder.HeroCard(session)
                                    .title(result.title)
                                    .subtitle("In " + result.track + " track at " + result.startTime + 
                                        " to " + result.endTime + " on " + result.day + " in " + result.location + 
                                        " with speakers: " + 
                                        result.speakers + "\n")
                                    .text(result.description.split(' ').slice(0, 10).join(' ') + '...')
                                    .buttons(buttonAction)
                            );
                        })} else {
                            msg = "No results for that name.";
                        };
                    break;
                case "event":
                    sortEvents(session);
                        session.privateConversationData.fullDescription = [];
                        if (results && results.length > 0 && results.length < 10) {
                        results.forEach(function (result, i) {
                            var buttonAction = [];
                            if (results.length > 1) {
                                buttonAction = [builder.CardAction.imBack(session, result.title + "\nSpeakers: " +
                                    result.speakers + "\n\n" + result.description, "Full Description " + (i + 1))];
                                session.privateConversationData.fullDescription[i] = "Speakers: " + 
                                    result.speakers + "\n\n" + result.description;
                            } else {
                                buttonAction = [builder.CardAction.imBack(session, results[0].title + "\nSpeakers: " +
                                     results[0].speakers + "\n\n" + results[0].description, "Full Description")];
                                session.privateConversationData.fullDescription[0] = "Speakers: " + 
                                    results[0].speakers + "\n\n" + results[0].description; 
                            }
                            msg.addAttachment(
                                new builder.HeroCard(session)
                                    .title(result.title)
                                    .subtitle("In " + result.track + " track at " + result.startTime + " to " +
                                        result.endTime + " on June " + result.day + " in " + result.location + 
                                        " with speakers: " + result.speakers + "\n")
                                    .text(result.description.split(' ').slice(0, 15).join(' ') + '...')
                                    .buttons(buttonAction)
                            );
                        })}
                        // Results are too long for a carousel 
                        else if(results && results.length > 0 && results.length >= 10) {
                            results.forEach(function(result, i){
                                var short_description = result.description.split(' ').slice(0, 25).join(' ') + '...';
                                var text = "**"+ result.title.trim() + "** " + "In " + result.track +  " track, at " + 
                                    result.startTime + " to " + result.endTime + " on June " + result.day + " in " + 
                                    result.location + " with speakers: " + result.speakers + ".\n\n" + 
                                    "**Description snippet:** " + short_description;
                                var msg_content = '):\n\n' + text + '\n\n';
                                if (i == 1) {msg = i + msg_content; }
                                else { msg += i + msg_content; }

                            })
                        } 
                        else {
                            msg = "No results for that choice.";
                        };
                    break;
            }
            if (msgTitle) {
                session.send(msgTitle);
                msgTitle = '';
            }
            if (results.length > 0) {
                session.privateConversationData.queryResults = null;
                session.privateConversationData.searchType = null;
                // Here, endDialog so that we wait for the user if they want to click full description
                session.endDialog(msg);
            } else {
                // Return to main menu 
                session.privateConversationData.queryResults = null;
                session.privateConversationData.searchType = null;
                session.send("I don't have any results for that query.  Returning to the main menu.");
                restart(session);
            }
        }
    ]);
}