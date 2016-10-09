# Recaptain
ReadyTalk Intern Project summer 2016

Recaptain is a bot build for Slack, a cloud-based team collaboration software tool. Recaptain is used to summarize the chat log in a public channel in the team. A user would install the Recaptain bot, then message Recaptain to request a summary of a desired chanel. Recaptain will respond with key messages from the conversation that are marked at a higher importance. A message becomes important from a message analyzer library called Watson. 

###############
## Installation

## Requirements:
node v6.2.2

Generate a unique token for the bot on slack:
	https://team_name.slack.com/apps/build/custom-integration
	Bots -> Bot Username -> Add Bot Integration
	Copy the API Token from the Integration settings 

## Running
from root dir, run:
'token=... node app.js'

`token=... npm start`

## Production Docker

```
docker build -f Dockerfile-prod -t "recapitan-prod" .
docker run recapitan-prod --env=TOKEN=....
```

## Usage
Once Recaptain is in the slack team, simple 'Direct Message' the bot.
The avaliable commands are:
	help
	recap
	recap #channel_name1 #channel_name2 ...
