async function TryRegister(ctx, uuid) {
    console.log(`registering with code ${uuid}`)
    const model = ctx.model;
    const person = model.getPersonByUuid(uuid)
    if (!person) {
        // await ctx.reply(`invalid code ${uuid}`)
        return false
    }
    if (person.isRegistered()) {
        // await ctx.reply('user already registered')
        return false
    }
    person.register(ctx.from.id)
    model.saveToStorage()
    await ctx.reply(`successfully registered as ${person.name}`)
    await ctx.reply(`type /status to see who your mortal is!`)
    return true
}

RegisterHandler = async (ctx) => {
    if (ctx.person) {
        return ctx.reply(`already registered as ${ctx.person.name}`)
    }
    const re = /\/r(?:egister)? (\w+)/g
    const parsed = re.exec(ctx.message.text)
    if (!parsed) {
        return ctx.reply('register usage: /register <code>')
    }
    const uuid = parsed[1]
    await TryRegister(ctx, uuid)
}

DeregisterHandler = async (ctx) => {
    const model = ctx.model
    const person = ctx.person

    console.log(`${person.name} deregistering`)
    ctx.person.deregister()
    model.saveToStorage()
    await ctx.reply(`successfully deregistered`)
}

MessageHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        await ctx.otherBot.telegram.sendMessage(target.telegramId, ctx.message.text)
    } else {
        await ctx.reply(`It seems that your ${ctx._name.toLowerCase()} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they are registered!`)
    }
}

StickerHandler = async(ctx) => {
    console.log(ctx)
    console.log(ctx.message)
    let msg = await ctx.reply("sticker!")
    await ctx.replyWithSticker('CAACAgQAAxkBAAIEfV78mvoS4SvBDMxhdHom_Yggx-UJAAJLCQACS2nuEB2AzJJszEcJGgQ')

    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        await ctx.otherBot.telegram.sendSticker(target.telegramId, ctx.message.text)
    } else {
        await ctx.reply(`It seems that your ${ctx._name.toLowerCase()} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they are registered!`)
    }
}

StatusHandler = async (ctx) => {
    const person = ctx.person
    const model = ctx.model
    ctx.reply(`Hi ${person.name}! Your mortal is ${model.getPersonByUuid(person.mortal).name}`)
}

HelpHandler = async (ctx) => {
    ctx.reply(`help stub`)
}

StartHandler = async (ctx) => {
    ctx.reply(`start stub`)
}

module.exports = {RegisterHandler, DeregisterHandler, StatusHandler, TryRegister, MessageHandler, HelpHandler, StickerHandler, StartHandler}