// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	const agent = new WebhookClient({ request, response });
	console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
	let MAX_RETRIES = 3
 
	function welcome(agent) {
		console.log('contexts', agent.contexts);
		console.log('parameters', agent.parameters);
		let {fulfillmentText} = request.body.queryResult;
		if(!agent.parameters){
			  agent.add(fulfillmentText);
			  return;
		}
		for(let param in agent.parameters) {
			if(!agent.parameters[param]) {
				if(!agent.getContext(param+'_retries')) {
					console.log('setting context: ', param+'_retries')
					agent.setContext({name: param+'_retries', lifespan: '5', parameters: {
							retries_left: MAX_RETRIES
						}
					})
					// Next time will be first try, so ask the question simply for slot filling.
					agent.add(fulfillmentText)
					return
				}
				else {
					let {retries_left} = agent.getContext(param+'_retries').parameters
					if(--retries_left === 0) {
						agent.add(`Uh oh! You failed to provide a valid value for ${param}`)
						// doesn't work
						// agent.clearOutgoingContexts()
						for(let context of agent.contexts) {
							agent.setContext({name: context.name, lifespan: '0'})
						}
						return
					}
					// tell the user that they failed to provide a valid value
					agent.add(`${request.body.queryResult.queryText} isn\'t a valid ${param}`)
					agent.setContext({name: param+'_retries', lifespan: '5', parameters: {
							retries_left: retries_left
						}
					})
					return
				}
			}

			else {
				// parameter fulfilled
				if(agent.getContext(param+'_retries')) {
					console.log('clearing context ', param+'_retries')
					// for some reason agent.clearContext doesn't work
					agent.setContext({name: param+'_retries', lifespan: '0'})
				}
			}
		}
		agent.add(fulfillmentText)
	}
 
	function fallback(agent) {
		agent.add(`I didn't understand`);
		agent.add(`I'm sorry, can you try again?`);
	}

	// // Uncomment and edit to make your own intent handler
	// // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
	// // below to get this function to be run when a Dialogflow intent is matched
	// function yourFunctionHandler(agent) {
	//   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
	//   agent.add(new Card({
	//       title: `Title: this is a card title`,
	//       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
	//       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
	//       buttonText: 'This is a button',
	//       buttonUrl: 'https://assistant.google.com/'
	//     })
	//   );
	//   agent.add(new Suggestion(`Quick Reply`));
	//   agent.add(new Suggestion(`Suggestion`));
	//   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
	// }

	// // Uncomment and edit to make your own Google Assistant intent handler
	// // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
	// // below to get this function to be run when a Dialogflow intent is matched
	// function googleAssistantHandler(agent) {
	//   let conv = agent.conv(); // Get Actions on Google library conv instance
	//   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
	//   agent.add(conv); // Add Actions on Google library responses to your agent's response
	// }
	// // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
	// // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

	// Run the proper function handler based on the matched Dialogflow intent name
	let intentMap = new Map();
	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);
	// intentMap.set('your intent name here', yourFunctionHandler);
	// intentMap.set('your intent name here', googleAssistantHandler);
	agent.handleRequest(intentMap);
});
