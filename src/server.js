const express = require("express");
const {Model} = require("./model");

function tmp() {
    let out = ""
    out += 'userid | name | mortal\'s name | registered?\n'
    out += (model.getPeople().map(person => {
        const mortal = model.getPersonByUuid(person.mortal)
        return `${person.uuid} | ${person.name} | ${mortal.name} | ${person.isRegistered()}`
    }).join("\n"))
}

function init(model) {
    const apiServer = express()

    apiServer.post('/deregister/:id', (req, res, next) => {
        const uuid = req.params["id"]
        const person = model.getPersonByUuid(uuid)
        console.log(`Deregistering ${person.name}`)
        try {
            if (person) {
                person.deregister()
                res.send("Deregistered ${person.uuid} (${person.name}) successfully")
            } else {
                res.send(`Person ${uuid} does not exist`)
            }
        } catch (e) {
            res.send(`Encountered error ${e} while deregistering ${person.uuid} (${person.name})`)
        }


    })

    apiServer.get('/', (req, res, next) => {
        res.send('Hello World!')
        model.getPeople().map(person => {
            return `<tr>
                        <td>${person.name}</td>
                    </tr>`
        })
        next()
    })



    apiServer.listen(port, () => {
        console.log(`API server listening at http://localhost:${port}`)
    })
}

module.exports = {init}