require('dotenv').config();
const prefix = process.env.PREFIX || "anm";

module.exports = {
    RegisterReminder: 'Please key in your 9 digit code to register!',
    NoGroupChats: "Please don't add me to groups! Byeeee 👋",
    BotWelcome: (name, chatTarget) => `Welcome${name}! This bot will act as a messaging platform between you and your ${chatTarget}. Simply send a message here and we will pass it to your ${chatTarget}`,
    ReferToBot: (chatAs) => `Please go to the ${chatAs}-bot at @${prefix}_${chatAs.toLowerCase()}_bot to start chatting with your ${chatAs} as well`,
    RegisterWelcome: "Paste the 9 digit code sent to you here to register",
    UnregisteredTarget: (chatTarget) => `It seems that your ${chatTarget} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they have registered!`,
    DeregisterSuccess: "Successfully deregistered",
    RegisterSuccess: (name, chatTarget) => `Yay! You have successfully registered as ${name}! Have fun chatting with your ${chatTarget}`,
    StatusHint: "Type /santee to see who your santee is!",
    StatusMessage: (name, mortalName) => `Hi ${name}! Your santee is ${mortalName}. Have fun chatting with them!`,
    AlreadyRegisteredError: (name) => `Already registered as ${name}`,
    RegisterFailedGeneralError: (code) => `Failed to register with code ${code}`,
    HelpMessage: "This bot allows you to communicate with your santa/santee anonymously.\nRegister with the code given to you by typing\n`/register <code>`\nOnce registered, you can send messages to your santa/santee just by sending them here just like any other Telegram chat. Currently supported message types are text, stickers, photos and videos.",
    RegisteredNotifier: (chatTarget) => `Your ${chatTarget} has registered with the bot on Telegram. Happy chatting!`,
    NotRegistered: "Not registered",
};
