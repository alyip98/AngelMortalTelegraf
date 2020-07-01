const {UserIdMiddleware} = require("./middleware/user");
const { Telegraf } = require('telegraf');
require('dotenv').config();


function start() {
  const bot = new Telegraf(process.env.BOT_TOKEN);



  bot.use(UserIdMiddleware);
  bot.on('message', Telegraf.reply('hello'));

  bot.launch();
  bot.startPolling();
  console.log("Bot started")
}

module.exports = {start};
