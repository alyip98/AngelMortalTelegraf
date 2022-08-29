require('dotenv').config();
const prefix = process.env.PREFIX || "anm";

module.exports = {
    RegisterReminder: "To register, please enter \'`/r code`\' where code is your 9 digit code. For example: \'`/r 694206969`\'. Don\'t miss the space in between!",
    NoGroupChats: "Please don't add me to groups! Byeeee 👋",
    BotWelcome: (name, chatTarget) => `Welcome${name}! This bot will act as a messaging platform between you and your ${chatTarget}. Simply send a message here and we will pass it to your ${chatTarget}`,
    ReferToBot: (chatAs) => `Please go to the ${chatAs}-bot at @${prefix}_${chatAs.toLowerCase()}_bot to start chatting with your ${chatAs} as well. You do not need to register again.`,
    // RegisterWelcome: "Paste the 9 digit code sent to you here to register",
    UnregisteredTarget: (chatTarget) => `It seems that your ${chatTarget} hasn't registered with the bot on Telegram, we can't deliver your message to them. Don't worry, we'll let you know as soon as they have registered!`,
    DeregisterSuccess: "Successfully deregistered",
    RegisterSuccess: (name, chatTarget) => `Yay! You have successfully registered as ${name}! Have fun chatting with your ${chatTarget}`,
    StatusHint: "Type /mortal to see who your mortal is!",
    StatusMessage: (name, mortalName) => `Hi ${name}! Your mortal is ${mortalName}. Have fun chatting with them!`,
    AlreadyRegisteredError: (name) => `Already registered as ${name}`,
    RegisterFailedGeneralError: (code) => `Failed to register with code ${code}`,
    HelpMessage: "This bot allows you to communicate with your angel/mortal anonymously.\nRegister with the code given to you by typing\n`/r <code>`\nOnce registered, you can send messages to your angel/mortal just by sending them here just like any other Telegram chat. Currently supported message types are text, stickers, photos and videos.",
    RegisteredNotifier: (chatTarget) => `Your ${chatTarget} has registered with the bot on Telegram. Happy chatting!`,
    UnregisteredNotifier: (chatTarget) => `Your ${chatTarget} has not registered with the bot on Telegram. We'll let you know once they've registered!`,
    NotRegistered: "Not registered",
    AskToDoubleConfirm: (isAngel) => `You are about to confirm that ${isAngel ? "your Angel has" : "you have"} done a prank/gift according to today's theme!\n\nIf this is the case, please type in /doubleconfirm to double confirm.`,
    WillGetOtherToConfirm: (isAngel) => `Thanks for confirming! Your ${isAngel ? "Angel" : "Mortal"} has not confirmed yet, we have messaged them to do so!`,
    AskOtherToConfirm: (isAngel) => `Your ${isAngel ? "Angel" : "Mortal"} has confirmed a themed prank/gift. Please /confirm on your end to validate this!`,
    BothHaveConfirmed: (isAngel, fact) => isAngel ? "Both you and your angel have confirmed the themed prank/gift! A fun fact about your angel's angel has been sent to them :)" : `Both you and your mortal have confirmed the themed prank/gift! Here is a fact about your angel:\n\n${fact}`,
    AlreadyConfirmed: "You have already confirmed for today!",
    // TODO: Change the Developer according to who is in charge now
    GeneralError: "Something went wrong :(. Please show this to the developer, Praveen (@praveeeenk)",
    FactIndexError: (factIndex) => `Something went wrong :(. Please show this to the developer, Praveen (@praveeeenk).\n\nFact Index: ${factIndex}`
};
