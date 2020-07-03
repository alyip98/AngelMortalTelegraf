const messages = require("./messages");

RegisterFailedHandler = async (ctx, uuid) => {
    ctx.reply(messages.RegisterFailedGeneralError(uuid))
}

RegisterHandler = async (ctx) => {
    if (ctx.person) {
        return ctx.reply(messages.AlreadyRegisteredError(ctx.person.name))
    }
    const re = /\/r(?:egister)? (\w+)/g
    const parsed = re.exec(ctx.message.text)
    if (!parsed) {
        return ctx.reply('register usage: /register <code>')
    }
    const uuid = parsed[1]
    const success = await TryRegister(ctx, uuid)
    if (!success) {
        await RegisterFailedHandler(ctx, uuid);
    }
}

RegisterSuccessHandler = async (ctx) => {
    const person = ctx.person
    const angel = ctx.model.getPersonByUuid(person.angel)
    const mortal = ctx.model.getPersonByUuid(person.mortal)

    await ctx.reply(messages.RegisterSuccess(person.name))
    if (ctx.isAngel) {
        await ctx.reply(messages.ReferToMortalBot)
    } else {
        await ctx.reply(messages.StatusHint)
        await ctx.reply(messages.ReferToAngelBot)
    }

    if (angel.isRegistered()) {
        await ctx.model.mortalBot.telegram.sendMessage(angel.telegramId, messages.RegisteredNotifier('mortal'))
    }

    if (mortal.isRegistered()) {
        await ctx.model.angelBot.telegram.sendMessage(mortal.telegramId, messages.RegisteredNotifier('angel'))
    }
}

TryRegister = async (ctx, uuid) => {
    const model = ctx.model;
    const person = model.getPersonByUuid(uuid)

    // Failed registration if person with given uuid doesn't exist, or if already registered
    if (!person || person.isRegistered()) {
        return false
    }

    person.register(ctx.from.id)
    ctx.person = person
    model.saveToStorage()

    await RegisterSuccessHandler(ctx)
    return true
}

DeregisterHandler = async (ctx) => {
    const model = ctx.model
    ctx.person.deregister()
    model.saveToStorage()
    await ctx.reply(messages.DeregisterSuccess)
}

MessageHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        await ctx.otherBot.telegram.sendMessage(target.telegramId, ctx.message.text)
    } else {
        await ctx.reply(messages.UnregisteredTarget(ctx._name.toLowerCase()))
    }
}

StickerHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        await ctx.otherBot.telegram.sendSticker(target.telegramId, ctx.message.sticker.file_id)
    } else {
        await ctx.reply(messages.UnregisteredTarget(ctx._name.toLowerCase()))
    }
}

PhotoHandler = async (ctx) => {
    const photos = ctx.message.photo
    const caption = ctx.message.caption || ""
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        const fileLink = await ctx.telegram.getFileLink(photos[0].file_id)
        await ctx.otherBot.telegram.sendPhoto(target.telegramId, {url: fileLink}, {caption})
    } else {
        await ctx.reply(messages.UnregisteredTarget(ctx._name.toLowerCase()))
    }
}

VideoHandler = async (ctx) => {
    console.log(ctx.video)
    const video = ctx.message.video
    const caption = ctx.message.caption || ""
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        const fileLink = await ctx.telegram.getFileLink(video.file_id)
        await ctx.otherBot.telegram.sendVideo(target.telegramId, {url: fileLink}, {caption})
    } else {
        await ctx.reply(messages.UnregisteredTarget(ctx._name.toLowerCase()))
    }
}

StatusHandler = async (ctx) => {
    const person = ctx.person
    const model = ctx.model
    const mortal = model.getPersonByUuid(person.mortal)
    ctx.reply(messages.StatusMessage(person.name, mortal.name))
}

HelpHandler = async (ctx) => {
    ctx.reply(messages.HelpMessage)
}

StartHandler = async (ctx) => {
    const message = ctx.isAngel ? messages.AngelBotWelcome : messages.MortalBotWelcome
    const registerHint = ctx.isRegistered ? "" : "\n" + messages.RegisterReminder
    ctx.reply(message + registerHint)
}

module.exports = {
    RegisterHandler,
    DeregisterHandler,
    StatusHandler,
    TryRegister,
    MessageHandler,
    HelpHandler,
    StickerHandler,
    StartHandler,
    PhotoHandler,
    VideoHandler
}