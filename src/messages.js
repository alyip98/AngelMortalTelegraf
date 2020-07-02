module.exports = {
    RegisterReminder: 'please register',
    NoGroupChats: "Please don't add me to groups! Byeeee 👋",
    AngelBotWelcome: "[bot] Welcome! This bot will act as a messenger between you and your angel. Also say hi to the mortal-bot over at @anm_mortal_bot if you haven't done so!",
    MortalBotWelcome: "[bot] Welcome! This bot will act as a messenger between you and your mortal. Also say hi to the angel-bot over at @anm_angel_bot if you haven't done so!",
    RegisterWelcome: "Paste the 9 digit code sent to you here to register",
    UnregisteredTarget: (name) => `It seems that your ${name} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they are registered!`,
    DeregisterSuccess: "Successfully deregistered",
    RegisterSuccess: (name) => `Successfully registered as ${name}`,
    StatusHint: "Type /status to see who your mortal is!",
    AlreadyRegisteredError: (name) => `already registered as ${name}`,
    RegisterFailedGeneralError: (code) => `Failed to register with code ${code}`,
    HelpMessage: "This bot allows you to communicate with your angel/mortal anonymously.\nRegister with the code given to you by typing `/register <code>`.\nOnce registered, you can send messages to your angel/mortal just by sending them here just like any other Telegram chat. Currently supported message types are text, stickers, photos and videos.",

}

