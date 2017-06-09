# MLADS Spring 2017 Bot
-----------

A conference bot for faqs and schedule info

### Getting started

#### What you'll need 

* [Node.js](https://nodejs.org/en/download/) with npm (it is bundled now) and the 
* [Bot Framework Emulator](https://github.com/microsoft/botframework-emulator/wiki/Getting-Started).
* [VSCode](https://code.visualstudio.com/) or simlilar editor (we'll refer to functionality in VSCode however)

#### Setup

Open the project folder in VSCode.

Go to the Integrated terminal in VSCode (under View in the navi) and in the console (or do this in terminal) type the following command to install the necessary packages (specified in the `package.json` file).

    npm install


#### How to run

Go to the Integrated terminal in VSCode (under View in the navi) and in the console (or do this in terminal) type:

    node app.js

Open up the emulator and type "hello".

#### Features

For the FAQ, the bot code combines active learning and custom reponses.  See, [this](https://github.com/Microsoft/BotBuilder-CognitiveServices/tree/master/Node/samples#qna-bot-with-active-learning) Microsoft sample for more on active learning with the botbuilder-cognitiveservices package and mainly from what the `CustomQnAMakerTools.js` originates.  For a sample of the custom response code also see the link.


Snippet of the active learning code:
```node
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
        var filteredResult = qnaMakerResult.answers.filter(function (qna) { return qna.questions[0] === results.response.entity; });
        var selectedQnA = filteredResult[0];

        // Send the response or handle the 'None' selection case
        if (selectedQnA != null) {
            session.send(selectedQnA.answer);
        } else {
            session.send("I don't have an answer right now.  Perhaps, try the DSMLEVNT alias.")
        }
        // The following ends the dialog and returns the selected response to the parent dialog, which logs the record in QnA Maker service
        // You can simply end the dialog, in case you don't want to learn from these selections using session.endDialog()
        session.endDialogWithResult(selectedQnA);
        // session.endDialog();
    },
]);
```

Example of the custom response methods (they override existing methods to interject custom responses):
```node
basicQnAMakerDialog.respondFromQnAMakerResult = function(session, results){
    if (results.answers[0] != null ) {
        session.sendTyping();

        // Custom logging response
        var response = 'Here is the match from FAQ:  \r\n  Q: ' + 
            results.answers[0].questions[0] + '  \r\n A: ' + 
            results.answers[0].answer;
        session.send(response);
    }
}


// Override to log user query and matched Q&A before ending the dialog
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
```

#### Creation of resources on Azure

* Make sure agenda is in xls format, not xlsx (see template under [data](data)).
* Create Azure Search service.
* Use `search_mgmt.py` script to upload the sessions as documents to the Azure Search index (index also created in script).

You'll need to set certain env variables.

Some of which are (on dev):
```
export SEARCH_URL_DEV=<https://servicename.search.windows.net>
export SEARCH_KEY_DEV=<search key>
```
