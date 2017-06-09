module.exports = function () {
    bot.dialog('/people', [
        function (session) {
            session.sendTyping();
            builder.Prompts.text(session, "Type in the name of the person you are searching for:");
        },
        function (session, results) {
            var name = results.response;
            if (name != null) {
                //search for person
                performSearch(name, function (err, results) {
                    if (err) {
                    }
                    if (results) {
                        var resultslist = [];
                        results.forEach(function (result, i) {
                            if (result['@search.score'] && result['@search.score'] > 0.3) {
                            speakerlist = String(result.speakers).toLowerCase().split(/[, |; ]/);
                            if (speakerlist.indexOf(name.toLowerCase()) > -1) {
                                // Speaker in the results so add results to list
                                resultslist.push(result);
                            }
                        }
                        });
                        session.privateConversationData.queryResults = resultslist;
                        session.privateConversationData.name = name;
                        session.privateConversationData.searchType = "person";
                        session.replaceDialog('/ShowResults');

                    } else {
                        // No sufficiently good results to reset query and restart
                        session.send("I couldn't find a speaker by that name.  Returning to main menu.");
                        session.replaceDialog('/');
                    }
                });
            } else {
                session.send("Oops.  I slipped up finding a person by that name.  Returning to main menu.");
            }
        }
    ]);
}

