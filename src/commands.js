const messages = require("./messages");

RegisterFailedHandler = async (ctx, uuid) => {
    ctx.reply(messages.RegisterFailedGeneralError(uuid))
}

RegisterHandler = async (ctx) => {
    //If this telegram user has already registerd to a UUID
    if (ctx.person) {
        return ctx.reply(messages.AlreadyRegisteredError(ctx.person.name))
    }
    //TODO: add check for if UUID has been registered by another telegram user
    const re = /\/r(?:egister)? (\w+)/g
    const parsed = re.exec(ctx.message.text)
    if (!parsed) {
        return ctx.replyWithMarkdown(messages.RegisterReminder)
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

    await ctx.reply(messages.RegisterSuccess(person.name, ctx.chatTarget))

    await ctx.reply(messages.ReferToBot(ctx.chatAs))
    if (!ctx.isAngel) {
        await ctx.reply(messages.StatusHint)
    }

    if (angel.isRegistered()) {
        await ctx.model.mortalBot.telegram.sendMessage(angel.telegramId, messages.RegisteredNotifier('mortal'))
        await ctx.model.angelBot.telegram.sendMessage(person.telegramId, messages.RegisteredNotifier('angel'))
    } else {
        await ctx.model.angelBot.telegram.sendMessage(person.telegramId, messages.UnregisteredNotifier('angel'))
    }

    if (mortal.isRegistered()) {
        await ctx.model.angelBot.telegram.sendMessage(mortal.telegramId, messages.RegisteredNotifier('angel'))
        await ctx.model.mortalBot.telegram.sendMessage(person.telegramId, messages.RegisteredNotifier('mortal'))
    } else {
        await ctx.model.mortalBot.telegram.sendMessage(person.telegramId, messages.UnregisteredNotifier('mortal'))
    }
}

TryRegister = async (ctx, uuid) => {
    const model = ctx.model;
    const person = model.getPersonByUuid(uuid)

    // Failed registration if person with given uuid doesn't exist, or if already registered
    if (!person || person.isRegistered()) {
        return false
    }

    person.register(ctx.from)
    ctx.person = person
    model.saveToStorage()

    await RegisterSuccessHandler(ctx)
    return true
}

DeregisterHandler = async (ctx) => {
    if (!ctx.isRegistered) {
        return ctx.reply(messages.NotRegistered)
    }
    const model = ctx.model
    const telegramId = ctx.person.telegramId
    ctx.person.deregister()
    model.saveToStorage()
    await ctx.reply(messages.DeregisterSuccess)
    await ctx.otherBot.telegram.sendMessage(telegramId, messages.DeregisterSuccess)
}

ConfirmHandler = async (ctx) => {
    if (!ctx.isRegistered) {
        return ctx.reply(messages.NotRegistered)
    }
    var person = ctx.person
    if (person.confirm) {
        return ctx.reply(messages.AlreadyConfirmed)
    }
    await ctx.reply(messages.AskToDoubleConfirm(ctx.isAngel))
}

DoubleConfirmHandler = async (ctx) => {
    if (!ctx.isRegistered) {
        return ctx.reply(messages.NotRegistered)
    }
    const model = ctx.model
    var person = ctx.person
    if (person.confirm) {
        return ctx.reply(messages.AlreadyConfirmed)
    }
    //TODO: REMOVE THESE TWO LINES
    person.confirm = true
    model.saveToStorage()

    const other = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!other.isRegistered()) {
        return ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
    }

    // Check if both have confirmed
    if (!other.confirm) {
        await ctx.reply(messages.WillGetOtherToConfirm(ctx.isAngel))
        await ctx.otherBot.telegram.sendMessage(other.telegramId, messages.AskOtherToConfirm(!ctx.isAngel))
        return
    }
    // Both have confirmed, give out fact
    const angel = ctx.isAngel ? other : person
    const mortal = ctx.isAngel ? person : other
    const angelsAngel = ctx.model.getPersonByUuid(angel.angel)
    const date = new Date()
    // const dayMonthArr = [date.getDate(), (date.getMonth() + 1)]
    const checkDayMonth = (dayMonthArr) => date.getDate() == dayMonthArr[0] && (date.getMonth() + 1) == dayMonthArr[1]
    const factIndex = ctx.themeDays.findIndex(checkDayMonth)
    if (factIndex == -1) {
        return ctx.reply(messages.FactIndexError(factIndex))
    }
    const fact = angelsAngel.facts[factIndex]
    await ctx.model.mortalBot.telegram.sendMessage(angel.telegramId, messages.BothHaveConfirmed(false, fact))
    await ctx.model.angelBot.telegram.sendMessage(mortal.telegramId, messages.BothHaveConfirmed(true, null))

    person.confirm = true
    model.saveToStorage()
}

AnimationHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    const msg = ctx.update.message
    const fileLink = await ctx.telegram.getFileLink(msg.animation.file_id)
    return await ctx.otherBot.telegram.sendAnimation(target.telegramId, {url: fileLink})
}

DocumentHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    const msg = ctx.update.message
    const fileLink = await ctx.telegram.getFileLink(msg.document.file_id)
    return await ctx.otherBot.telegram.sendDocument(target.telegramId, {
        url: fileLink,
        filename: msg.document.file_name
    })
}

MessageHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target || !target.isRegistered()) {
        //Handle user possibly trying to register but in the wrong format
        if (ctx.message.text && ctx.message.text.startsWith("/r")) {
            await ctx.replyWithMarkdown(messages.RegisterReminder)
        } else {
            await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        }
        return
    }
    return await ctx.otherBot.telegram.sendMessage(target.telegramId, ctx.message.text)
}

StickerHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    await ctx.otherBot.telegram.sendSticker(target.telegramId, ctx.message.sticker.file_id)
}

PhotoHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    const photos = ctx.message.photo
    // photos array contains different file ids, with increasing image resolution
    const caption = ctx.message.caption || ""
    // access last file id for optimal quality
    const len = ctx.message.photo.length
    const fileLink = await ctx.telegram.getFileLink(photos[len - 1].file_id)
    await ctx.otherBot.telegram.sendPhoto(target.telegramId, {url: fileLink}, {caption})
}

VideoHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    const video = ctx.message.video
    const caption = ctx.message.caption || ""
    const fileLink = await ctx.telegram.getFileLink(video.file_id)
    await ctx.otherBot.telegram.sendVideo(target.telegramId, {url: fileLink}, {caption})
}

VoiceHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    const voice = ctx.message.voice
    const fileLink = await ctx.telegram.getFileLink(voice.file_id)
    await ctx.otherBot.telegram.sendVoice(target.telegramId, {url: fileLink})
}

VideoNoteHandler = async (ctx) => {
    const target = ctx.isAngel ? ctx.angel : ctx.mortal
    if (!target.isRegistered()) {
        await ctx.reply(messages.UnregisteredTarget(ctx.chatTarget))
        return
    }
    const video = ctx.message.video_note
    const fileLink = await ctx.telegram.getFileLink(video.file_id)
    await ctx.otherBot.telegram.sendVideoNote(target.telegramId, {url: fileLink})
}

StatusHandler = async (ctx) => {
    if (!ctx.isRegistered) {
        await ctx.replyWithMarkdown(messages.RegisterReminder)
        return
    }
    const person = ctx.person
    const model = ctx.model
    const mortal = model.getPersonByUuid(person.mortal)
    let mortalName = mortal.name
    ctx.reply(messages.StatusMessage(person.name, mortalName))
}

HelpHandler = async (ctx) => {
    await ctx.replyWithMarkdown(messages.HelpMessage)
}

StartHandler = async (ctx) => {
    const name = ctx.isRegistered ? " " + ctx.person.name : ""
    const message = messages.BotWelcome(name, ctx.chatTarget)
    await ctx.reply(message)
    if (!ctx.isRegistered) {
        await ctx.replyWithMarkdown(messages.RegisterReminder)
        return
    }
    if (ctx.isMortal) {
        await ctx.reply(messages.StatusHint)
    }
}

module.exports = {
    RegisterHandler,
    DeregisterHandler,
    TryRegister,
    RegisterSuccessHandler,
    RegisterFailedHandler,
    StatusHandler,
    MessageHandler,
    HelpHandler,
    StickerHandler,
    StartHandler,
    PhotoHandler,
    VideoHandler,
    VideoNoteHandler,
    VoiceHandler,
    AnimationHandler,
    DocumentHandler,
    ConfirmHandler,
    DoubleConfirmHandler
}