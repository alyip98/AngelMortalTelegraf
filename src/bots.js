const Commands = require("./commands");
const {Model} = require("./model");
const Middleware = require("./middleware");
const {Telegraf} = require('telegraf');
const {onModelReload} = require("./events");
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
    angelBot._name = "AngelBot"
    mortalBot.use(Middleware.Settings(false, angelBot))
    mortalBot._name = "MortalBot"

    const bots = [angelBot, mortalBot]

    bots.forEach(bot => {
        bot.use(Middleware.ErrorHandler, Middleware.WithModel(model), Middleware.OnlyPrivate, Middleware.UserId, Middleware.CodeFilter)
        bot.start(Commands.StartHandler)
        bot.help(Commands.HelpHandler)
        bot.command(['register', 'r'], Commands.RegisterHandler)
        bot.use(Middleware.RequireRegister)
        bot.command(['deregister', 'd'], Commands.DeregisterHandler)
        bot.command('mortal', Commands.StatusHandler)
        bot.command('angel', Commands.AngelHandler)
        bot.on('sticker', Commands.StickerHandler)
        bot.on('photo', Commands.PhotoHandler)
        bot.on('video', Commands.VideoHandler)
        bot.on('voice', Commands.VoiceHandler)
        bot.on('video_note', Commands.VideoNoteHandler)
        bot.on('message', Commands.MessageHandler)
        bot.catch(console.error)
        bot.launch().then(() => console.log(bot._name + " started")).catch(console.error)
    })
}

module.exports = {start};
