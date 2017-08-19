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

var unguidedCount = 1;
var customCount = 1;
var inhaleSeconds = 4;
var holdingSeconds = 7;
var exhaleSeconds = 8;
var customizing = false;
var canBegin = false;
var repeating = false;

var previousAction = "none";


restService.post('/reply', function(req, res) {
  var action = req.body.result.action;
  var soundtrack = req.body.result.parameters.soundtracks;
  var number = req.body.result.parameters["number-integer"]; 

  var text = "Relax.";
  var shortText = "Relax.";
  var textNeedsChange = false;
  var endConversation = false;

  console.log("customizing:" + customizing);
  console.log("customCount:" + customCount);
  console.log("canBegin:" + canBegin);

      if (req.body.result.parameters.repeat == "repeat") {
        if (previousAction == "custom.breathing") {
          action = "custom.breathing.repeat";
        } else if (previousAction == "unguided.meditation") {
          action = "unguided.meditation.repeat";
        }
      }

      console.log(action);  
      switch (action) {

      case "custom.breathing":
        if (customCount == 1) {
          text = "Sure thing. We are going to do the 4 7 8 breathing exercise for relaxation and stress relief. "
            + "Before we begin, do you want to customize the number of seconds between breaths? "
            + "Say 'yes' to begin customizing, 'no' to continue with default values, or 'info' for a more detailed explanation. ";
          customCount++;
          break;
        } 

        if (customCount == 2 && req.body.result.parameters.yesno == "no") {
          inhaleSeconds = 4;
          holdingSeconds = 7;
          exhaleSeconds = 8;
          customizing = false;
          customCount++;
        } else if (customCount == 2 && req.body.result.parameters.yesno == "yes") {
          customizing = true;
          customCount++;
        }

        if (!customizing && customCount > 2) {
          //don't need to customize the seconds; begin breathing exercise.
          canBegin = true;
        } else if (customizing && customCount > 2) {
          //needs to customize; begin asking questions.
          if (customCount == 3) {
            text = "Okay, how many seconds do you want to inhale your breaths for? ";
            customCount++;
            break;
          } else if (customCount == 4 && number > 0 && number <= 15) {
            inhaleSeconds = number;
            text = "Sounds good. How many seconds do you want to hold your breaths for?";
            customCount++;
            break;
          } else if (customCount == 5 && number > 0 && number <= 15) {
            holdingSeconds = number;
            text = "I can do that. Lastly, how many seconds do you want to exhale your breaths for?";
            customCount++;
          } else if (customCount == 6 && number > 0 && number <= 15) {
            exhaleSeconds = number;
            canBegin = true;          
          } else if (customCount >= 4) {
            text = "Please tell me a number between 1 and 15";
            break;
          }
        }

        if (canBegin) {
          text = "Okay, let's begin. To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
            + customizedBreathingExercise();
          
           shortText = "Okay, let's begin. To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
             + customizedShortText();
          textNeedsChange = true;
          customCount = 1;
          canBegin = false;
          customizing = false;
          break;
        }

        break;

      case "custom.breathing.repeat": 
        text = customizedBreathingRepeat();
        shortText = customizedShortTextRepeat();
        textNeedsChange = true;
        break;

      ////////////////////////
      case "unguided.meditation":
      //introductory statement
      if (unguidedCount == 1) {
        text = "I can play a variety of soundtracks for your own meditation, including: "
          + "rainstorm, ocean waves, jungle rain, river, or musical ambiance. "
          //+ "What would you like to hear? ";
          + "You can tell me your choice or say 'options' to hear them again.";
        unguidedCount++;
        break;
      }
      //choosing a soundtrack
      if (unguidedCount > 1) {
          text = "Your 10 minute meditation session starts now. Enjoy. ";
          shortText = "Your 10 minute meditation session starts now. Enjoy. ";
        
        switch (soundtrack) {
            case "rainstorm":
              text += rainstorm;
              textNeedsChange = true;
              shortText += "shh, shh, rain falling, shhh, raindrops raindrops raindrops, shhh. ";
              endConversation = true;
              unguidedCount = 1;
              break;
            case "waves":
              text += oceanWaves;
              textNeedsChange = true;
              shortText += "wooshhh, wooosh, waves crashing, more waves, more waves, wooshhh, waves crashing again. ";
              endConversation = true;
              unguidedCount = 1;
              break;
            case "jungle":
              text += jungle;
              textNeedsChange = true;
              shortText += "shh, rain falling, shhh, bird chirping, raindrops, low thunder rolling, bird chirps again, more rain. ";
              endConversation = true;
              unguidedCount = 1;
              break;
            case "stream":
              text += river;
              textNeedsChange = true;
              shortText += "blub, blub, gurgle, water running, more water running down a stream, blub blub, water running. ";
              endConversation = true;
              unguidedCount = 1;
              break;
            case "ambiance":
              text += ambience;
              textNeedsChange = true;
              shortText += "mmmm, peaceful music playing, relaxing chords harmonizing, music crescendos... and diminuendos, crescendos... and diminuendos. ";
              endConversation = true;
              unguidedCount = 1;
              break;
            default: 
              text = "Please choose one of the following options: rainstorm, ocean waves, jungle rain, river, or musical ambiance.";
              break;
        }
      }
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
  for (var i = 0; i < 4; i++) {
    audio += "Inhale through your nose. <break time=\"" + inhaleSeconds + "s\"/> "
    + "Hold your breath. <break time=\"" + holdingSeconds + "s\"/> "
    + "Exhale through your mouth. <break time=\"" + exhaleSeconds + "s\"/> "
  }
  audio += "To keep going, just say 'continue'.";
  return audio;
}

function customizedBreathingRepeat() {
  var audio = "";
  for (var i = 0; i < 4; i++) {
    audio += "Inhale. <break time=\"" + inhaleSeconds + "s\"/> "
    + "Hold. <break time=\"" + holdingSeconds + "s\"/> "
    + "Exhale. <break time=\"" + exhaleSeconds + "s\"/> "
  }
  audio += "To keep going, just say 'continue'.";
  return audio;
}

// function customizedBreathingExercise2() {
//   var audio = "lose your mouth and inhale through your nose for "+ inhaleSeconds + " seconds. <break time=\"" + inhaleSeconds + "s\"/> "
//     + "Hold your breath" + ". <break time=\"" + holdingSeconds + "s\"/> "
//     + "And make a woosh sound as you exhale through your mouth. " + ". <break time=\"" + inhaleSeconds + "s\"/> "
//     + "To keep going, just say 'continue'.";
//   return audio;
// }

function customizedShortText() {
  var audio = "";
  for (var i = 0; i < 4; i++) {
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
  for (var i = 0; i < 4; i++) {
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
