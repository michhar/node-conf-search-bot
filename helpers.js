module.exports = function () {

    // a function to generate messages with button
    // facebook quick reply and standard buttons are supported
    global.generateButtonMessage = function (session, title, buttons) {
        if (useQuickReply) {
            return new builder.Message(session).text(title).sourceEvent(generateSourceEvent(buttons));
        } else {
            return new builder.Message(session).attachments([
                new builder.HeroCard(session).title(title).buttons(buttons)
            ]);
        }
    }

    // generate a quick reply button or a standard button
    global.generateButton = function (session, title, payload) {
        if (useQuickReply) {
            return generateQuickReply(truncate(title).capitalize(), payload);
        } else {
            return builder.CardAction.imBack(session, payload, truncate(title).capitalize());
        }
    }

    global.truncate = function (s) {
        return s.length > 20 ? s.slice(0, 20) : s;
    }

    // // generate channel data for facebook
    // // especially for generating the quick reply buttons
    // global.generateSourceEvent = function (buttonActions) {
    //     return { facebook: { "quick_replies": buttonActions } };
    // }

    // generate a facebook quick reply item
    global.generateQuickReply = function (title, payload) {
        return { "content_type": "text", "title": title, "payload": payload };
    };

    // restart the whole session
    // clean the user data, clean the callstack
    // then route back to the root dialog
    global.restart = function (session) {
        resetQuery(session);
        session.reset('/');
    }

    global.resetQuery = function (session) {
        if (session.privateConversationData) {
            session.privateConversationData.clickingButtons = false;
            session.privateConversationData.queryResults = null;
            session.privateConversationData.searchType = null;
            session.privateConversationData.Track = null;
            session.privateConversationData.lastelizauserresponse = null;
            session.privateConversationData.eliza = null;
        }
    }

    global.restartDialog = function (session, target) {
        if (session.sessionState.callstack.length > 0) {
            session.cancelDialog(0, target);
        } else {
            session.replaceDialog(target);
        }
    }

    global.messageIsTrack = function (session, msg) {
        if (session.privateConversationData.facets && session.privateConversationData.facets.length > 1) {
            for (var i = 0; i < session.privateConversationData.facets.length; i++) {
                if (msg === session.privateConversationData.facets[i]) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    }

    global.sortEvents = function (session) {
        if (session.privateConversationData.queryResults && session.privateConversationData.queryResults[0]) {
            session.privateConversationData.queryResults.sort(function (a, b) {
                a.eventID = parseInt(a.eventID);
                b.eventID = parseInt(b.eventID);
                if (a.eventID > b.eventID) {
                    return 1;
                } if (a.eventID < b.eventID) {
                    return -1;
                }
                return 0;
            })
        }
    }

    // global.trackHasChildren = function (session, track) {
    //     if (session.privateConversationData.tracksWithChildren) {
    //         for (var i = 0; i < session.privateConversationData.tracksWithChildren.length; i++) {
    //             if (session.privateConversationData.tracksWithChildren[i] === track) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    // global.performQuery = function (queryString, callback) {
    //     var querySpec = {
    //         query: queryString
    //     };
    //     // query documentDB for speaker's events
    //     client.queryDocuments(collLink, querySpec).toArray(function (err, results) {
    //         if (err) {
    //             callback(err);
    //         } else if (results) {
    //             var s = "";
    //             callback(null, results);
    //         } else {
    //             callback(null, null);
    //         }
    //     });
    // }

    // send a message with a delay
    global.sendTip = function (session, tip) {
        if (session.userData.usedPrompts) {
            setTimeout(function () {
                session.send(tip);
            }, 5000);
        }
    }

    global.generateMessageTitle = function (session) {
        if (session.privateConversationData.searchType && session.privateConversationData.queryResults) {
            var result = session.privateConversationData.queryResults;
            var name = session.privateConversationData.name;
            var msgTitle = '';
            switch (session.privateConversationData.searchType) {
                case "person":
                    var results = session.privateConversationData.queryResults;
                    if (result && result.length > 1) {
                        msgTitle = "Here are the " + result.length + " results that match speaker name " + name + ":";
                    } else if (result && result.length === 1) {
                        msgTitle = "Here are results matching speaker name " + name + ":";
                    }
                    break;
                case "event":
                    if (result) {
                        msgTitle = "Here are the " + result.length + " events in the " + session.privateConversationData.Track + " track" + " on " + global.month + " " + session.privateConversationData.Day + ":";
                    }
                    break;
            }
            return msgTitle;
        }
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    global.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    global.random_greeting = [
        'Greetings new friend.',
        "Hello there!",
        "Having fun I hope?",
        "Glad we've met.",
        "Happy to help!"
    ]

    global.random_salutation = [
        'Thanks for being my new friend.',
        "Ok, see you later!",
        "Glad we've met.",
        "Best wishes.",
        "Talk to you later I hope.",
        "Nice to have met you.",
        "Enjoy the conference!",
        "Thanks for stopping by."
    ]
}