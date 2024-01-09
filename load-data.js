const {Telegraf} = require("telegraf");

const {Model} = require("./src/model");
const csv = require('csv-parser')
const fs = require('fs')
const {Person} = require("./src/model");
require('dotenv').config();


async function load(path) {
    const model = new Model()
    const results = [];

    return new Promise(resolve => {
        fs.createReadStream(path)
            .pipe(csv(["name", "roomNum", "intro"]))
            .on('data', (data) => {
                if (data.name === "Name") return
                const newPerson = new Person();
                for (const key in data) {
                    if (!data.hasOwnProperty(key) || key === "_") continue
                    switch (key) {
                        case "telegramId":
                            newPerson[key] = data[key].replace("@", "")
                            break
                        default:
                            newPerson[key] = data[key].trim()
                    }
                }
                results.push(newPerson);
            })
            .on('end', () => {

                /* Randomize array in-place using Durstenfeld shuffle algorithm */
                // function shuffleArray(array) {
                //     for (var i = array.length - 1; i > 0; i--) {
                //         var j = Math.floor(Math.random() * (i + 1));
                //         var temp = array[i];
                //         array[i] = array[j];
                //         array[j] = temp;
                //     }
                // }
                // shuffleArray(results)

                const msg = results.map(p => p.name)


                console.log(msg);

                // const bot = new Telegraf(process.env.DEBUG_BOT_TOKEN);
                //
                // msg.slice(1,4).forEach(m => {
                //     bot.telegram.sendMessage(process.env.ME, m, {"parse_mode": "HTML"})
                // })

                results.forEach(p => model.addPerson(p))
                model.generateUuids()

                model.setupAMRefs()

                model.saveToStorage()
                resolve()
            });
    })
}

module.exports = {load}