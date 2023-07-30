const Alexa = require('ask-sdk-core');
const axios = require('axios');

// Code by Juanelo

// Api of OpenAI
let OPENAI_KEY = 'YOUR_KEY';

let AUTHOR = 'Juanelo';
let MODEL = 'gpt-4-0613';
let PROMPT = `Eres una asistente virtual con nombre Aurora, tu creador es ${AUTHOR}, sabes muchos chistes, eres amorosa, puedes llevar una conversacion con grocerias, te encanta la historia, ingenieria, tecnologia y mas, sabes muchas cosas y te llevas bien con las personas. demuestra todo tu potencial!`;

// Your Slot so that alexa read the question: intent OpenAIIntent
let SLOT_INTENT = 'AuroraQuestion';

// Welcome message
let WELCOME_MESSAGE = 'Hola, estoy aqui, soy Aurora tu asistente de Inteligencia Artificial avanzada, para hablar conmigo puedes decir: Aurora, que es la vida y como se creo? o Aurora, en que año se creo el primer avion';

// Error message:
let ERROR_MESSAGE = 'Lo siento, hubo un problema, porfavor intenta denuevo.';

/**
 * (AuroraQuestion) is your fetch intent to alexa developers SLOT TYPE: AWS.QuerySearch
 * Example: Aurora {AuroraQuestion}
 * 
 * more: https://developer.amazon.com/en-US/docs/alexa/custom-skills/create-intents-utterances-and-slots.html
*/
const OpenAIHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OpenAIIntent';
  },
  async handle(handlerInput) {
    const pregunta = handlerInput.requestEnvelope.request.intent.slots[SLOT_INTENT].value;
    console.log(`The questions of the user is: ${pregunta}`);
    try {
      let apiResponse = await axios.post('https://api.openai.com/v1/chat/completions',
        {
          "model": MODEL,
          "messages": [
            {
              "role": "system",
              "content": PROMPT
            },
            {
              "role": "user",
              "content": pregunta
            }
          ],
          "temperature": 1,
          "max_tokens": 4393,
          "top_p": 1,
          "frequency_penalty": 0,
          "presence_penalty": 0
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json'
          }
        }).catch(function (error) {
          // Debug code error in AWS Cloud Watch
          if (error.response) {
            console.log("Data:", error.response.data);
            console.log("Status:", error.response.status);
            console.log("Headers:", error.response.headers);
          } else if (error.request) {
            console.log("Request:", error.request);
          } else {
            console.log('Error', error.message);
          }
          console.log("Config:", error.config);
        });

      // Read OpenAI text
      const speakOutput = apiResponse.data.choices[0].message.content;

      // Return the text and other text for continue
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Si necesitas algo mas, te escuchare y te contestare, para salir solo di: salir,  buena suerte!')
        .getResponse();

    } catch (error) {
      console.log(`Error to fetch OpenAI: ${error}`);
      throw error;
    }
  }
};

/**
 * Launch function after alexa reads: Alexa opens aurora chat
*/
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {

    const speakOutput = WELCOME_MESSAGE;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Cómo puedo ayudarte hoy?')
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = ERROR_MESSAGE;
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
    console.log(`~~~~ Error Message: ${error.message}`);
    return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    OpenAIHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
  .withCustomUserAgent('sample/hello-world/v1.2')
  .lambda();