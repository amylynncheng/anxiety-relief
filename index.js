'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const admin = require("firebase-admin");
//const serviceAccount = require("./anxiety-relief-firebase-adminsdk-u7ycg-1920d03b6a.json");
const serviceAccount = require("./anxiety-relief-176617-firebase-adminsdk-9eu0f-979f9d0d38.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://anxiety-relief-176617.firebaseio.com/"
});

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());



//SOUNDTRACKS FOR UNGUIDED MEDITATION
var rainstorm = ' <audio src="https://firebasestorage.googleapis.com/v0/b/anxiety-relief-176617.appspot.com/o/rainstorm.mp3?alt=media&amp;token=1d368457-3cba-4cfe-a280-b8737fda1913"></audio> ';
var oceanWaves = ' <audio src="https://firebasestorage.googleapis.com/v0/b/anxiety-relief-176617.appspot.com/o/ocean-waves.mp3?alt=media&amp;token=bce2f9b6-24b3-4bda-a119-1620a83a63af"></audio> ';
var jungle = ' <audio src="https://firebasestorage.googleapis.com/v0/b/anxiety-relief-176617.appspot.com/o/jungle-rain.mp3?alt=media&amp;token=de1c8d30-a66a-4259-aa00-ce872bacc9cf"></audio> ';
var ambience = ' <audio src="https://firebasestorage.googleapis.com/v0/b/anxiety-relief-176617.appspot.com/o/angelic-ambience.mp3?alt=media&amp;token=eb1ced2c-86b3-4512-9350-5f07956ffb7a"></audio> ';
var river = ' <audio src="https://firebasestorage.googleapis.com/v0/b/anxiety-relief-176617.appspot.com/o/stream.mp3?alt=media&amp;token=df929522-023c-44b1-babc-49aa57c728a9"></audio> ';

var customCount = 0;
var inhaleSeconds = 4;
var holdingSeconds = 7;
var exhaleSeconds = 8;
var customizing = false;
var canBegin = false;
var repeating = false;

var affirmations = ["Okay", "Sure", "No problem", "You got it", "I can do that", "Absolutely", "Sure thing", "All right", "Sounds good"];

var previousAction = "none";


restService.post('/reply', function(req, res) {
  var action = req.body.result.action;
  //var soundtrack = req.body.result.parameters.soundtracks;
  var number = req.body.result.parameters["number-integer"]; 

  var text = "Relax.";
  var shortText = "Relax.";
  var textNeedsChange = false;
  var endConversation = false;

      if (req.body.result.parameters.repeat == "repeat") {
        if (previousAction == "begin.default" || previousAction == "custom.breathing") {
          action = "breathing.repeat";
        } 
      }

      console.log(action);  
      switch (action) {

        case "begin.default":
          customizing = false;
          inhaleSeconds = 4;
          holdingSeconds = 7;
          exhaleSeconds = 8;
          text = "Okay, let's begin. To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
            + customizedBreathingExercise();
          shortText = "Okay, let's begin. To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
             + customizedShortText();
          textNeedsChange = true;
          break;

        case "custom.breathing":
          if (req.body.result.parameters.customize == "customize") {
            customizing = true;
          }

          if (customizing) {
            if (customCount == 0) {
              text = "Okay, how many seconds do you want to inhale your breaths for? ";
              customCount++;
              break;
            } else if (customCount == 1 && number > 0 && number <= 10) {
              inhaleSeconds = number;
              var i = Math.floor(Math.random() * affirmations.length);
              var affirm1 = affirmations[i];
              
              text = affirm1 + ". How many seconds do you want to hold your breaths for?";
              customCount++;
              break;
            } else if (customCount == 2 && number > 0 && number <= 10) {
              holdingSeconds = number;
              var j = Math.floor(Math.random() * affirmations.length);
              var affirm2 = affirmations[j];
              
              text = affirm2 + ". Lastly, how many seconds do you want to exhale your breaths for?";
              customCount++;
            } else if (customCount == 3 && number > 0 && number <= 10) {
              exhaleSeconds = number;
              canBegin = true;          
            } else if (customCount >= 0 && number == 69) {
              //text = "Please tell me a number between 1 and 10. ";
              text = "Haha, very funny. But you should pick another number, perhaps between 1 and 10. ";
              break;
            } else if (customCount >= 0 && number > 10) {
              //text = "Please tell me a number between 1 and 10. ";
              text = "I recommend a lower number for better relaxation... Maybe try a number between 1 and 10. ";
              break;
            } else if (customCount >= 0 && number < 0) {
              //text = "Please tell me a number between 1 and 10. ";
              text = "Although negative seconds would be cool, I can't do that... Maybe try a positive number. ";
              break;
            } else if (customCount >= 0 && number == 0) {
              //text = "Please tell me a number between 1 and 10. ";
              text = "Zero seconds would not be very helpful... Maybe try another number, perhaps between 1 and 10. ";
              break;
            } 
          }

          if (canBegin) {
            text = "Okay, let's begin. To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
              + customizedBreathingExercise();
            
             shortText = "Okay, let's begin. To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
               + customizedShortText();
            textNeedsChange = true;
            customCount = 0;
            canBegin = false;
            customizing = false;
            break;
          }

          break;

        case "breathing.repeat": 
          text = customizedBreathingRepeat();
          shortText = customizedShortTextRepeat();
          textNeedsChange = true;
          break;
                
        default: 
          text = "Error.";
      } 

    previousAction = action;

    console.log(text);

    if (endConversation) {
      return res.json({
        speech: '<speak> ' + text + ' </speak>',
        displayText: shortText,
        source: "natlangtst2",
        data: {
          google: {
            expect_user_response: false,
          }
        }
      }); 
    }

    if (textNeedsChange) {
    return res.json({
      speech: '<speak> ' + text + ' </speak>',
      displayText: shortText,
      source: "anxiety"
    }); 
    } else {
    return res.json({
      speech: '<speak> ' + text + ' </speak>',
      displayText: text,
      source: "anxiety"
    }); 
    }
});

function replaceBreaks(text) {
  var display = text;
  if (text.includes("<break")) {
    console.log("replacing");
    var start = text.indexOf("<");
    var end = text.indexOf(">") + 1;
    var breakString = text.substring(start, end);
    console.log(breakString);
    display = text.replace(breakString, "...");
  }
  return display; 
}

function customizedBreathingExercise() {
  var audio = "";
  for (var i = 0; i < 3; i++) {
    audio += "Inhale through your nose. <break time=\"" + inhaleSeconds + "s\"/> "
    + "Hold your breath. <break time=\"" + holdingSeconds + "s\"/> "
    + "Exhale through your mouth. <break time=\"" + exhaleSeconds + "s\"/> "
  }
  audio += "To keep going, just say 'continue'.";
  return audio;
}

function customizedBreathingRepeat() {
  var audio = "";
  for (var i = 0; i < 3; i++) {
    audio += "Inhale. <break time=\"" + inhaleSeconds + "s\"/> "
    + "Hold. <break time=\"" + holdingSeconds + "s\"/> "
    + "Exhale. <break time=\"" + exhaleSeconds + "s\"/> "
  }
  audio += "To keep going, just say 'continue'.";
  return audio;
}

function customizedShortText() {
  var audio = "";
  for (var i = 0; i < 3; i++) {
    audio += "Inhale through your nose. " // for "+ inhaleSeconds + " seconds. "
    + "Hold your breath. " // for " + holdingSeconds + " seconds. "
    + "Exhale through your mouth. " // for " + exhaleSeconds + " seconds. "
    + "\n\n"
  }
  audio += "To keep going, just say 'continue'.";
  return audio;
}

function customizedShortTextRepeat() {
  var audio = "";
  for (var i = 0; i < 3; i++) {
    audio += "Inhale. " // for "+ inhaleSeconds + " seconds. "
    + "Hold. " // for " + holdingSeconds + " seconds. "
    + "Exhale. " // for " + exhaleSeconds + " seconds. "
    + "\n\n"
  }
  audio += "To keep going, just say 'continue'.";
  return audio;
}


restService.listen((process.env.PORT || 8080), function() {
    console.log("Server up and running");
});
