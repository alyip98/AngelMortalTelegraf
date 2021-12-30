const fs = require('fs')
const storage = require("node-persist");
const {Person, Model} = require("./model");

InputHandler = (model) => async (input) => {
    const tokens = input.trim().split(" ")
    if (tokens.length === 0)
        return;
    const command = tokens[0].toLowerCase()
    const args = tokens.slice(1)
    switch (command) {
        // TODO: add command to save ID pairings to file

        // case "load":
        //    TODO: fix load circular

        //     model.copyPeopleFrom(await LoadCommand(args[0], false, model));
        //     console.log(model.dumpUuids())
        //     model.saveToStorage()
        //     breduak;
        case "loadpaired":
            await LoadCommand(args[0], true, model);
            // console.log(model.dumpUuids())
            model.saveToStorage()
            break;
        // type validate <uuid> to validate relationships
        case "validate":
            ValidateRelationships(args[0], model)
            break
        case "list":
        case "ls":
        case "show":
            //TODO: show telegram ID
            ListAll(model, ...args)
            break
        case 'dump':
            Dump(model)
            break
        case "announce":
            Announce(model)
            break
        case "d":
        case "rm":
        case "delete":
        case "deregister":
            Deregister(model, args[0])
            break
        //TODO: add save to storage
        //TODO: add command to print registered participants and their ID
        case "nuke":
            // TODO: check for confirmation
            // delete all node persist data
            await storage.defaultInstance.clear();
            console.log("All data deleted. Restart the app to take effect.");
            break
        case "save":
            model.saveToStorage()
            break;
        default:
            console.log("Unknown command", command)
    }
}

async function Deregister(model, uuid) {
    const person = model.getPersonByUuid(uuid)
    if (person) { //ID exists
        //TODO: differentiate message based on whether person had registered
        console.log("Deregistered", person.name, uuid, person.telegramId)
        person.deregister()
        model.saveToStorage()
    } else {
        console.log("No one with that code found")
    }
}

async function Announce(model) {
    console.log('wip command')
}

// loadpaired data.txt
function loadPaired(content, model) {
    content.split("\n").forEach(line => {
        const name = line.split(",")[0].trim()
        if (model.getPersonByName(name)) {
            console.error("Error: name " + name + " is already used!");
            return;
        }
        if (name !== "") {
            const newPerson = new Person().withName(name)
            model.addPerson(newPerson)
            console.log(newPerson.name + " - " + newPerson.uuid);
        }
    })
    //TODO: print new uuids

    content.split("\n").forEach(line => {
        if (line.trim() === "") {
            return;
        }
        const angelName = line.split(",")[0].trim()
        const mortalName = line.split(",")[1].trim()
        if (angelName === "" || mortalName === "") {
            console.error("Invalid line: " + line)
        } else {
            console.log(`${angelName}-${mortalName}`)
            const angel = model.getPersonByName(angelName)
            const mortal = model.getPersonByName(mortalName)
            // console.log(a, m)
            angel.mortal = mortal.uuid
            mortal.angel = angel.uuid
        }
    })
}

function ValidateRelationships(uuid, model) {
    const person = model.getPersonByUuid(uuid);
    //console.log(person);

    const angelID = person.angel;
    const angelValid = validateAngel(uuid, angelID, model);

    const mortalID = person.mortal;
    const mortalValid = validateMortal(uuid, mortalID, model);

    if (angelValid && mortalValid) {
        console.log("relationships valid");
    } else {
        console.log("invalid relationship detected");
    }
}

// check if my angel's mortal is me
function validateAngel(myID, angelID, model) {
    const myAngel = model.getPersonByUuid(angelID);
    if (myAngel.mortal == myID) {
        //console.log("relationship valid");
        return true;
    } else {
        console.log("invalid relationship with angel");
        return false;
    }
}

// check if my mortal's angel is me
function validateMortal(myID, mortalID, model) {
    const myMortal = model.getPersonByUuid(mortalID);
    if (myMortal.angel == myID) {
        //console.log("relationship valid");
        return true;
    } else {
        console.log("invalid relationship with mortal");
        return false;
    }
}

function loadCircular(content) {
    const model = new Model();
    content.split("\n").forEach(line => {
        const name = line.trim()
        if (name !== "") {
            const person = new Person().withName(name)
            model.addPerson(person)
        }
    })
    // model.generateUuids()
    model.setupAMRefs()
    return model
}

async function LoadCommand(path, paired = false, model) {
    console.log(`Loading data from ${path}`)
    const content = fs.readFileSync(path, {encoding: "utf8"});

    paired ? loadPaired(content, model) : loadCircular(content)
}

async function ListAll(model, ...args) {
    let out = ""
    out += 'userid | name | mortal\'s name | registered?\n'
    out += (model.getPeople().map(person => {
        const mortal = model.getPersonByUuid(person.mortal)
        const mortalName = mortal === null ? "--" : mortal.name;
        return `${person.uuid} | ${person.name} | ${mortalName} | ${person.isRegistered()}`
    }).join("\n"))
    if (args[0]) {
        fs.writeFileSync(args[0], out)
    } else {
        console.log(out)
    }
}

async function Dump(model) {
    console.log(model.dumpUuids())
}

module.exports = {InputHandler, LoadCommand}

