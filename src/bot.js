const {UserIdMiddleware} = require("./middleware/user");
const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);



bot.use(UserIdMiddleware);
bot.on('message', Telegraf.reply('hello'));

