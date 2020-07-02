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

RegisterSuccessHandler = async (ctx) => {
    const person = ctx.person
    const angel = ctx.model.getPersonByUuid(person.angel)
    const mortal = ctx.model.getPersonByUuid(person.mortal)
    console.log(angel, mortal)

    if (angel.isRegistered()) {
        await ctx.model.mortalBot.telegram.sendMessage(angel.telegramId, `[mortal-bot] Your mortal, ${person.name} just came online, say hi to them!`)
    }

    if (mortal.isRegistered()) {
        await ctx.model.angelBot.telegram.sendMessage(mortal.telegramId, `[angel-bot] Your angel just came online, say hi to them!`)
    }
}

TryRegister = async (ctx, uuid) => {
    console.log(`registering with code ${uuid}`)
    const model = ctx.model;
    const person = model.getPersonByUuid(uuid)

    // Failed registration if person with given uuid doesn't exist, or if already registered
    if (!person || person.isRegistered()) {
        return false
    }

    person.register(ctx.from.id)
    ctx.person = person
    model.saveToStorage()
    ctx.reply(`successfully registered as ${person.name}`)
    ctx.reply(`type /status to see who your mortal is!`)
    await RegisterSuccessHandler(ctx)
    return true
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

StickerHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        await ctx.otherBot.telegram.sendSticker(target.telegramId, ctx.message.sticker.file_id)
    } else {
        await ctx.reply(`It seems that your ${ctx._name.toLowerCase()} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they are registered!`)
    }
}

PhotoHandler = async (ctx) => {
    const photos = ctx.message.photo
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        const fileLink = await ctx.telegram.getFileLink(photos[0].file_id)
        await ctx.otherBot.telegram.sendPhoto(target.telegramId, {url: fileLink})
    } else {
        await ctx.reply(`It seems that your ${ctx._name.toLowerCase()} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they are registered!`)
    }
}

VideoHandler = async (ctx) => {
    console.log(ctx.video)
    const video = ctx.message.video
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (target.isRegistered()) {
        const fileLink = await ctx.telegram.getFileLink(video.file_id)
        await ctx.otherBot.telegram.sendVideo(target.telegramId, {url: fileLink})
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