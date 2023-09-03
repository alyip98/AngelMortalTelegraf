const Commands = require("./commands");
const {Model} = require("./model");
const Middleware = require("./middleware");
const {Telegraf} = require('telegraf');
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const {load} = require("../load-data");
const cli = require("./cli");


require('dotenv').config();

async function start(model) {
    if (model === null)
        throw new Error('no model provided')
    // model = new Model();

    const adminBot = new Telegraf(process.env.ADMIN_BOT_TOKEN);
    adminBot.use(Middleware.ErrorHandler,
        Middleware.WithModel(model),
        Middleware.OnlyPrivate,
        Middleware.UsernameWhitelist,
    )


    adminBot.command("test", async ctx => {
        return ctx.reply(`hello ${ctx.message.text}`)
    })

    adminBot.command("list", async ctx => {
        const out = await cli.ListAll(model)
        return ctx.reply(out)
    })

    adminBot.command("dump", async ctx => {
        const out = await cli.Dump(model)
        return ctx.reply(out)
    })

    adminBot.on("document", async ctx => {
        const f = await ctx.telegram.getFile(ctx.message.document.file_id)
        // console.log(f)

        const url = `https://api.telegram.org/file/bot${adminBot.token}/${f.file_path}`
        const file = fs.createWriteStream("tmp.csv");
        const path = await new Promise((resolve, reject) => {
            https.get(url, function(response) {
                response.pipe(file);

                // after download completed close filestream
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed");
                    resolve(file.path)
                });

                file.on("error", reject)
            });
        });
        await load(path)
        await model.reloadFromStorage()
        return ctx.reply("data loaded")
    })

    adminBot.catch(console.error)
    adminBot.launch().then(() => console.log("Admin started")).catch(console.error)
}

module.exports = {start};
