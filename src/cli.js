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
    }
}

async function LoadCommand(path) {
    console.log(`Loading data from ${path}`)
    const content = fs.readFileSync(path, {encoding: "utf8"});

    const model = new Model();
    content.split("\n").forEach(line => {
        const person = new Person().withName(line.trim())
        model.addPerson(person)
    })
    model.generateUuids()
    model.setupAMRefs()
    return model
}

async function ListAll(model) {
    console.log(model.dumpUuids())
}

module.exports = {InputHandler, LoadCommand}