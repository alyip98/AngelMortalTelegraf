const fs = require('fs')
const {Person, Model} = require("./model");

InputHandler = (model) => async (input) => {
    const tokens = input.trim().split(" ")
    if (tokens.length === 0)
        return;
    const command = tokens[0].toLowerCase()
    const args = tokens.slice(1)
    switch (command) {
        case "load":
            model.copy(await LoadCommand(args[0]))
            console.log(model.dumpUuids())
            model.saveToStorage()
            break
        case "list":
        case "ls":
        case "show":
            ListAll(model)
            break
        case 'dump':
            Dump(model)
            break
        case "announce":
            Announce(model)
            break
    }
}

async function Announce(model) {
    console.log('wip command')
}

async function LoadCommand(path) {
    console.log(`Loading data from ${path}`)
    const content = fs.readFileSync(path, {encoding: "utf8"});

    const model = new Model();
    content.split("\n").forEach(line => {
        const name = line.trim()
        if (name!=="") {
            const person = new Person().withName(line.trim())
            model.addPerson(person)
        }
    })
    model.generateUuids()
    model.setupAMRefs()
    return model
}

async function ListAll(model) {
    // console.log(model.dumpUuids())
    console.log('userid | name | mortal\'s name | registered?')
    console.log(model.getPeople().map(person => {
        const mortal = model.getPersonByUuid(person.mortal)
        return `${person.uuid} | ${person.name} | ${mortal.name} | ${person.isRegistered()}`
    }).join("\n"))
}

async function Dump(model) {
    console.log(model.dumpUuids())
}

module.exports = {InputHandler, LoadCommand}