# dialogflow-max-retries-example
Using webhook for slot filling to allow redirection/exiting after a given number of attempts.

# Basic Concept
Use Webhook for slot filling to set a context called `param_retries` with a paramter `retries_left` to keep track of remaining attempts for filling the parameter slot `param`.

When the webhook is called the first time and the parameter is missing, we set the context with value `MAX_RETRIES`. On every call to webhook and the parameter `param` is not filled, we decrement the value of `retries_left` in context `param_retries`. When this value reaches 0, we will exit/redirect the agent. To exist the intent, you simply clear all existing intents. To redirect to another intent which could be your custom fallback intent for the current intent, you can use `agent.followupEvent` and pass it name for event that will trigger the fallback intent.

# Steps to use this example
1. Clone this repo.
2. Create a new agent in dialogflow and import the `max-retries-example.zip` available in the root folder of this repo.
3. Deploy the `dialogflowFirebaseFulfillment` inside `functions/index.js` using firebase CLI or replace the contents of the inline editor files in fulfillment page of the agent with the corresponding files in `functions/` folder.

# Contributing
1. Fork it.
2. Clone it.
3. Work on the fulfillment code using your code editor and/or import the agent into your dialogflow, change it and export and save & replace the zip in root.
4. Submit a PR.

# Future Work
1. Redirection example and custom fallback intent for handling the redirected agent. (See [issues](https://github.com/shashaBot/dialogflow-max-retries-example/issues)).

_Please report bugs or request new features in the [issues](https://github.com/shashaBot/dialogflow-max-retries-example/issues)_
