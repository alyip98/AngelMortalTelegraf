This bot allows users to message the bot as if they were messaging the other person. The bot is able to forward stickers and media.

#for admins
Each participant is given a `name` (need not be related to real name nor telegram id), and automatically generated `uuid`. Details such as telegram ID will be automatically captured. angel/mortal pairings are captured when registering. Each person can have up to one angel and up to one mortal.
##Set up
Decide on a bot name prefix, for example `angel-mortals-2022`.  
Create two telegram bots (through botfather), namely <prefix>_mortal_bot and <prefix>_angel_bot.  
Put the prefix and bot tokens into a `.env` file in the root directory with the format
```
PREFIX=angel-mortals-2022
ANGEL_BOT_TOKEN=
MORTAL_BOT_TOKEN=
```

##To add participants
Use `loadpaired <filename>` to load pairs.  
File should be a text file, containing pairs in the format `<angel>, <mortal>`  
Names will automatically be captured. A unique ID will be generated for each name.  
For example, if the following file is loaded
```
a, b
b, c
c, a
```
Three new persons representing a/b/c will be created. IDs will be shown for each, for example
```
a - 123456789
b - 234678590
c - 098234752
```
You can view this again using `dump`  

Next, let participants know their unique IDs. It is fine to publicize all unique IDs. Participants will not need to know their `name`.  
For ease of use, it is recommended to release a randomized order list of `participant - ID` pairings, while keeping `name` secret. This ensures anonymity  

##Resetting data
`nuke` deletes ALL data (locally, it doesn't delete telegram messages lol). You will need to stop and restart the node instance after using nuke. This works by deleting the storage file.


#for users
##to start
Start both bots. Then, message either one bot (not both) with `/r <ID>` to register. You should now be able to message both your angel and mortal.

#Message you can use to introduce the bot
Hi participants,  
The angel and mortal bots are available for you to message your partners anonymously. You can message the bot as if you were messaging the other person directly. The bot is able to forward stickers and media.  

I hope that you will continue to deliver heartfelt handwritten notes while sharing photos of your gifts/pranks in this group, and at the same time enhance your experience by using the bot to message your partner as needed, whether it is to let them know to collect your response, or to have a back and forth conversation.