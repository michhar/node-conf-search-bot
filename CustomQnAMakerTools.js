"use strict";

var builder = require("botbuilder");
var CustomQnAMakerTools = (function () {
    function CustomQnAMakerTools() {
        this.lib = new builder.Library('customQnAMakerTools');
        this.lib.dialog('answerSelection', [
            function (session, args) {
                var qnaMakerResult = args;
                session.dialogData.qnaMakerResult = qnaMakerResult;

                // Build up the prompt
                var questionOptions = [];
                qnaMakerResult.answers.forEach(function (qna) { questionOptions.push(qna.questions[0]); });
                questionOptions.push('None');
                var promptOptions = { listStyle: builder.ListStyle.button };
                builder.Prompts.choice(session, "There are multiple good matches. Please select from the following:", questionOptions, promptOptions);
            },
            function (session, results) {
                session.sendTyping();

                // Grab the answer to the selected question
                var qnaMakerResult = session.dialogData.qnaMakerResult;
                var filteredResult = qnaMakerResult.answers.filter(function (qna) {
                    return qna.questions[0] === results.response.entity;
                });
                var selectedQnA = filteredResult[0];

                // Send the response or handle the 'None' selection case
                if (selectedQnA != null) {
                    var response = "Here is the match from FAQ: \n" + 
                        selectedQnA.answer +
                        "\nReturning to main menu.";
                    session.send(response);

                    /* The following ends the dialog and returns the selected response to 
                       the parent dialog, which logs the record in QnA Maker service
                       You can simply end the dialog, in case you don't want to learn 
                       from these selections using */
                    session.endDialogWithResult(selectedQnA);
                    session.replaceDialog('/');
                    
                } else {
                    session.endDialog("I don't have an answer right now.  Returning you to the main menu.");
                    session.replaceDialog('/');
                }
            },
        ]);
    }
    CustomQnAMakerTools.prototype.createLibrary = function () {
        return this.lib;
    };
    CustomQnAMakerTools.prototype.answerSelector = function (session, options) {
        session.beginDialog('customQnAMakerTools:answerSelection', options || {});
    };
    return CustomQnAMakerTools;
}());
exports.CustomQnAMakerTools = CustomQnAMakerTools;