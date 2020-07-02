const Commands = require("./commands");
const {Model} = require("./model");
const Middleware = require("./middleware");
const {Telegraf} = require('telegraf');
require('dotenv').config();

async function start(model) {
    if (model === null)
        throw new Error('no model provided')
        // model = new Model();

    const angelBot = new Telegraf(process.env.ANGEL_BOT_TOKEN);
    const mortalBot = new Telegraf(process.env.MORTAL_BOT_TOKEN);

    model.angelBot = angelBot;
    model.mortalBot = mortalBot;

    angelBot.use(Middleware.Settings(true, mortalBot))
    mortalBot.use(Middleware.Settings(false, angelBot))
    
    const bots = [angelBot, mortalBot]

    bots.forEach(bot => {
        bot.use(Middleware.WithModel(model), Middleware.ErrorHandler, Middleware.OnlyPrivate, Middleware.UserId);
        bot.help(Commands.HelpHandler)
        bot.command(['register', 'r'], Commands.RegisterHandler)
        bot.use(Middleware.RequireRegister)
        bot.command(['deregister', 'd'], Commands.DeregisterHandler)
        bot.command('status', Commands.StatusHandler)
        bot.on('sticker', Commands.StickerHandler)
        bot.on('message', Commands.MessageHandler);
        bot.launch()
    })

    console.log("Bots started")
}

module.exports = {start};
