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
    angelBot.use(Middleware.WithModel(model), Middleware.ErrorHandler, Middleware.OnlyPrivate, Middleware.UserId);
    angelBot.help(Commands.HelpHandler)
    angelBot.command(['register', 'r'], Commands.RegisterHandler)
    angelBot.use(Middleware.RequireRegister)
    angelBot.command(['deregister', 'd'], Commands.DeregisterHandler)
    angelBot.command('status', Commands.StatusHandler)
    angelBot.on('sticker', async (ctx) => {
        console.log(ctx)
        console.log(ctx.message)
        let msg = await ctx.reply("sticker!")
        await ctx.replyWithSticker('CAACAgQAAxkBAAIEfV78mvoS4SvBDMxhdHom_Yggx-UJAAJLCQACS2nuEB2AzJJszEcJGgQ')
        setTimeout(() => {
            ctx.deleteMessage(msg.message_id)
        }, 3000)
    })
    angelBot.on('message', Commands.AngelMessageHandler);

    const mortalBot = new Telegraf(process.env.MORTAL_BOT_TOKEN);
    mortalBot.use(Middleware.WithModel(model), Middleware.ErrorHandler, Middleware.OnlyPrivate, Middleware.UserId);
    mortalBot.help(Commands.HelpHandler)
    mortalBot.command(['register', 'r'], Commands.RegisterHandler)
    mortalBot.use(Middleware.RequireRegister)
    mortalBot.command(['deregister', 'd'], Commands.DeregisterHandler)
    mortalBot.command('status', Commands.StatusHandler)
    mortalBot.on('sticker', async (ctx) => {
        console.log(ctx)
        console.log(ctx.message)
        let msg = await ctx.reply("sticker!")
        await ctx.replyWithSticker('CAACAgQAAxkBAAIEfV78mvoS4SvBDMxhdHom_Yggx-UJAAJLCQACS2nuEB2AzJJszEcJGgQ')
        setTimeout(() => {
            ctx.deleteMessage(msg.message_id)
        }, 3000)
    })
    mortalBot.on('message', Commands.MortalMessageHandler);

    model.angelBot = angelBot;
    model.mortalBot = mortalBot;

    console.log("Bots started")
    angelBot.launch();
    mortalBot.launch();
}

module.exports = {start};
