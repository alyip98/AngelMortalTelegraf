const {Telegraf} = require("telegraf");

const {Model} = require("./src/model");
const csv = require('csv-parser')
const fs = require('fs')
const {Person} = require("./src/model");
require('dotenv').config();


async function main() {
    const model = new Model()
    const results = [];

    await fs.createReadStream('data.csv')
        .pipe(csv(["_", "name", "_", "roomNum", "pranked", "twoTruths", "diet"]))
        .on('data', (data) => {
            if (data.name === "Name") return
            const newPerson = new Person();
            for (const key in data) {
                if (!data.hasOwnProperty(key) || key === "_") continue
                switch (key) {
                    case "telegramId":
                        newPerson[key] = data[key].replace("@", "")
                        break
                    case "pranked":
                        newPerson[key] = data[key] === "Yes"
                        break
                    default:
                        newPerson[key] = data[key]
                }

            }
            results.push(newPerson);
        })
        .on('end', () => {
            const msg = results.map(p => p.getIntroForMortal())
            console.log(msg);

            const bot = new Telegraf(process.env.DEBUG_BOT_TOKEN);

            msg.slice(1,4).forEach(m => {
                bot.telegram.sendMessage(process.env.ME, m, {"parse_mode": "HTML"})
            })

            results.forEach(p => model.addPerson(p))
            model.generateUuids()

            model.setupAMRefs(5)

            model.saveToStorage()

        });
}

main()