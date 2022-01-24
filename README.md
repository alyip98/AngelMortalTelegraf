# Angel Mortal Telegraf
Run Angel Mortal games using Telegram bots!

# Quick Start
#### Prerequisites
A list of names in one of the following format(s):

- List
    ```
    Alex
    Bob
    Calvin
    Donut
    ```
- Paired
    ```
    Alex, Calvin
    Bob, Donut
    Calvin, Bob
    Donut, Alex
    ```
  
---
#### Setup

1. Choose a prefix for your bots, e.g. `nhouse2022`
1. Register 2 bot accounts with [@botfather](https://t.me/botfather), with the names `{prefix}_angel_bot` and `{prefix}_mortal_bot` (this is important!)
1. Create a file named `.env`, and insert your prefix and bot tokens.
```
PREFIX=nhouse2022
ANGEL_BOT_TOKEN=123456789:AAFmAzl...
MORTAL_BOT_TOKEN=987654321:AAG379Q...
```

```
$ git clone https://github.com/alyip98/AngelMortalTelegraf.git
$ cd AngelMortalTelegraf

// Place the namelist.txt and .env files in this folder

$ npm install
$ node index
> couldn't load data from storage, creating fresh data
> 
> AngelBot started
> MortalBot started
$ load namelist.txt
> Loading data from namelist.txt
> Alex,291167381
> Bob,884067723
> Calvin,249331424
> Donut,657742557

``` 

Send the code to its corresponding participant so that they can register on the bot and start chatting!.
