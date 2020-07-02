const {TryRegister} = require("./commands");
const {Person} = require('./model');

WithModel = (model) => async (ctx, next) => {
    ctx.model = model
    await next()
}

UserId = async (ctx, next) => {
    const telegramId = ctx.from.id;
    const model = ctx.model;
    console.log(`incoming message from ${telegramId}`)
    const person = model.getPersonById(telegramId)
    if (person !== null) {
        console.log(`teleid: ${telegramId}`)
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
        console.log('trying to register')
        const success = await TryRegister(ctx, ctx.message.text)
        if (!success)
            await ctx.reply('please register');
    }
}

OnlyPrivate = async (ctx, next) => {
    let chat = ctx.chat;
    if (chat.type !== 'private') {
        try {
            await ctx.reply("Please don't add me to groups! Byeeee 👋")
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