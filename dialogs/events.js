module.exports = function () {
    bot.dialog('/sessions', [
        function (session) {
                builder.Prompts.choice(session, "What day are you interested in?", 
                    ['Thursday June 08', 'Friday June 09'], { listStyle: builder.ListStyle.button });
        },
        function (session, results) {
            if (results.response) {
                var selection = results.response.entity.split(" ");
                var Day = selection[2];

                getTrackFacets(Day, function (err, results) {
                    console.log(results);
                    if (err) {
                        console.log(err);

                    } else if (results && results[0] && results[0]['value']) {
                        var choices = [];
                        for (var i = 0; i < results.length; i++) {
                            var track = results[i]['value'];
                            if (track !== "" && track.toLowerCase() !== "lunch") {
                                choices.push(track);
                            }
                        }
                        session.privateConversationData.clickingButtons = false;

                        session.privateConversationData.Day = Day;
                        session.privateConversationData.facets = choices;

                        if (session.message.source === "skype" || session.message.source == "emulator"){
                            builder.Prompts.choice(session, "Which track are you interested in on " + 
                                global.month + " " + Day + "?", choices, 
                                { listStyle: builder.ListStyle.button });
                        } else {
                            builder.Prompts.choice(session, "Which track are you interested in on " + 
                                global.month + " " + Day + "?", choices);
                        }

                    } else {
                        session.send("I wasn't able to find any events on that day :0");
                        session.replaceDialog('/');
                    }
                })
            } else {
                session.send("I didn't get that day choice.  Returning to main menu.");
                session.replaceDialog('/');
            }
        },
        function (session, results) {
            session.privateConversationData.clickingButtons = true;

            if (results.response) {
                var choice = results.response.entity;
                // if (session.message.source.toLowerCase() === "slack") {
                //     choice = shortTrackName(choice);
                // }
                getEventsByTrack(choice, session.privateConversationData.Day, function (err, results) {
                    session.privateConversationData.Track = choice;
                    if (err) {
                        // pass
                    } else if (results.length > 0) {
                        session.privateConversationData.queryResults = results;
                        session.privateConversationData.searchType = "event";
                        session.replaceDialog('/ShowResults')
                    } else {
                        session.send("I couldn't find any talks for that choice.  Returning to main menu.");
                        session.replaceDialog('/');
                    }

                })

            }
        },
    ]);
}