const util = require("./util");
const messages = require("./messages");
const {TryRegister, RegisterSuccessHandler, RegisterFailedHandler} = require("./commands");
const {Person} = require('./model');
const {Telegraf} = require('telegraf');

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: process.env.LOGGING_SERVICE_NAME },
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
    ]
});


CodeFilter = Telegraf.hears(/^\d{9}$/m, async (ctx) => {
    if (ctx.isRegistered) {
        return await ctx.reply(messages.RegisterSuccess(ctx.person.name, ctx.chatTarget))
    }
    const success = await TryRegister(ctx, ctx.message.text)
    if (!success) {
        await RegisterFailedHandler(ctx, ctx.message.text);
    }
})

WithModel = (model) => async (ctx, next) => {
    ctx.model = model
    await next()
}

UserId = async (ctx, next) => {
    const telegramId = ctx.from.id;
    const model = ctx.model;
    const person = model.getPersonById(telegramId)
    if (person !== null) {
        ctx.person = person
        ctx.isRegistered = true
    }
    await next();
}

RequireRegister = async (ctx, next) => {
    const telegramId = ctx.from.id;
    const model = ctx.model;
    const person = model.getPersonById(telegramId)
    if (person !== null) {
        ctx.person = person
        ctx.angel = model.getPersonByUuid(person.angel)
        ctx.mortal = model.getPersonByUuid(person.mortal)
        await next();
    } else {
        let success = false;
        let isCommand = false;
        if (util.isText(ctx)) {
            success = await TryRegister(ctx, ctx.message.text)
            // isCommand = ctx.message.text.startsWith("/")
        }
        if (!success)
            return ctx.reply(messages.RegisterReminder);
        await next()
    }
}

OnlyPrivate = async (ctx, next) => {
    let chat = ctx.chat;
    if (chat !== undefined && chat.type !== 'private') {
        await ctx.reply(messages.NoGroupChats)
        await ctx.leaveChat(chat.id)
        return
    }
    await next()
}

ErrorHandler = async (ctx, next) => {
    try {
        await next()
    } catch (e) {
        logger.error({
            "error": e,
            "context": ctx.update
        })
    }
}

Settings = (isAngel=true, otherBot) => async(ctx, next) => {
    ctx.isAngel = isAngel
    ctx.isMortal = !isAngel
    ctx.otherBot = otherBot
    ctx.chatTarget = isAngel ? "Angel" : "Mortal"
    ctx.chatAs = isAngel ? "Mortal" : "Angel"

    await next()
}

UsernameWhitelist = async (ctx, next) => {
    const username = ctx.from.username;
    if (process.env.ADMIN_BOT_WHITELIST.indexOf(username) === -1) {
        console.log(`${username} not authorized`)
        return ctx.reply("not authorized!")
    }
    await next()
}

module.exports = {UserId, OnlyPrivate, ErrorHandler, RequireRegister, WithModel, Settings, CodeFilter, UsernameWhitelist}