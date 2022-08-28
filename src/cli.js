const fs = require('fs')
const storage = require("node-persist");
const {Person, Model} = require("./model");
const ExcelJS = require("exceljs");

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

// loadpaired data.txt FROM TXT
// function loadPaired(content, model) {
//     content.split("\n").forEach(line => {
//         const name = line.split(",")[0].trim()
//         if (model.getPersonByName(name)) {
//             console.error("Error: name " + name + " is already used!");
//             return;
//         }
//         if (name !== "") {
//             const newPerson = new Person().withName(name)
//             model.addPerson(newPerson)
//             console.log(newPerson.name + " - " + newPerson.uuid);
//         }
//     })
//     //TODO: print new uuids

//     content.split("\n").forEach(line => {
//         if (line.trim() === "") {
//             return;
//         }
//         const angelName = line.split(",")[0].trim()
//         const mortalName = line.split(",")[1].trim()
//         if (angelName === "" || mortalName === "") {
//             console.error("Invalid line: " + line)
//         } else {
//             console.log(`${angelName}-${mortalName}`)
//             const angel = model.getPersonByName(angelName)
//             const mortal = model.getPersonByName(mortalName)
//             // console.log(a, m)
//             angel.mortal = mortal.uuid
//             mortal.angel = angel.uuid
//         }
//     })
// }

// loadpaired data.txt FROM EXCEL
async function loadPaired(workbook, model) {
    worksheet = workbook.worksheets[0]
    worksheet.eachRow(function(row, rowNumber) {
        // Row 1 is the headers
        if (rowNumber == 1) {
            return
        }
        const angelName = row.getCell('A').value
        if (model.getPersonByName(angelName)) {
            console.error("Error: The angel's name " + angelName + " is already used!");
            return;
        }
        if (angelName == "") {
            console.error("Error: The name at rowNumber " + rowNumber + " is empty!");
            return;
        }
        const newPerson = new Person().withName(angelName)
        model.addPerson(newPerson)
        console.log(newPerson.name + " - " + newPerson.uuid);
    });

    worksheet.eachRow(function(row, rowNumber) {
        if (rowNumber == 1) {
            return
        }
        const angelName = row.getCell('A').value
        const angel = model.getPersonByName(angelName)
        row.eachCell(function(cell, colNumber) {
            // console.log('Cell ' + colNumber + ' = ' + cell.value)
            // First column contains angelName
            if (colNumber == 1) {
                return
            }
            // Cell contains mortal name
            if (colNumber == 2) {
                const mortalName = cell.value;
                if (mortalName === "") {
                    console.error(`Invalid mortal name at row ${rowNumber}, col ${colNumber}`);
                    return;
                }
                console.log(`${angelName}-${mortalName}`)
                const mortal = model.getPersonByName(mortalName)
                // console.log(a, m)
                angel.mortal = mortal.uuid
                mortal.angel = angel.uuid
                return;
            }
            // Cell contains fun fact about the person
            if (colNumber > 2 && colNumber < 8) {
                angel.facts.push(cell.value)
                return
            }
            console.error(`Error: Unexpected value at row: ${rowNumber}, col: ${colNumber}`);
        })
        // console.log(angel)
    });
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
    // const content = fs.readFileSync(path, {encoding: "utf8"});
    const content = new ExcelJS.Workbook();
    await content.xlsx.readFile(path)

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

