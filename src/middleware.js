const util = require("./util");
const messages = require("./messages");
const {TryRegister} = require("./commands");
const {Person} = require('./model');

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
    }
    await next();
}

RequireRegister = async (ctx, next) => {
    const telegramId = ctx.from.id;
    const model = ctx.model;
    const person = model.getPersonById(telegramId)
    if (person !== null) {
        console.log(person.name)
        ctx.person = person
        ctx.angel = model.getPersonByUuid(person.angel)
        ctx.mortal = model.getPersonByUuid(person.mortal)
        await next();
    } else {
        // console.log(Object.values(ctx))
        let success = false;
        let isCommand = false;
        if (util.isText(ctx)) {
            success = await TryRegister(ctx, ctx.message.text)
            isCommand = ctx.message.text.startsWith("/")
        }
        if (!success && !isCommand)
            await ctx.reply(messages.RegisterReminder);
    }
}

OnlyPrivate = async (ctx, next) => {
    let chat = ctx.chat;
    if (chat.type !== 'private') {
        try {
            await ctx.reply(messages.NoGroupChats)
            await ctx.leaveChat(chat.id)
        } catch (e) {
        }
        return
    }
    await next()
}

ErrorHandler = async (ctx, next) => {
    try {
        await next()
    } catch (e) {
        console.error(e);
    }
}

Settings = (isAngel=true, otherBot) => async(ctx, next) => {
    ctx.isAngel = isAngel
    ctx.isMortal = !isAngel
    ctx.otherBot = otherBot
    ctx._name = isAngel ? "Angel" : "Mortal"
    ctx._otherName = isAngel ? "Mortal" : "Angel"

    await next()
}

module.exports = {UserId, OnlyPrivate, ErrorHandler, RequireRegister, WithModel, Settings}