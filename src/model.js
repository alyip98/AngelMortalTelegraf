const storage = require('node-persist');
storage.init({
    'dir': 'data',
    stringify: s => JSON.stringify(s, null, 2),
    parse: s => JSON.parse(s),
    encoding: 'utf8',
    // logging: true,
    ttl: false,
});

class Model {
    constructor(store) {
        this.store = store || storage.defaultInstance
        this.people = [];
    }

    resetConfirm() {
        console.log("Resetting Confirm!")
        this.people.forEach((person) => {
            person.confirm = false;
        })
        this.saveToStorage()
    }

    resetConfirmAtMidnight() {
        // Reset every midnight
        var now = new Date()
        var night = new Date()
        night.setDate(new Date().getDate() + 1)
        night.setHours(0, 0, 0, 0)
        var msToMidnight = night.getTime() - now.getTime();

        setTimeout(() => {
            this.resetConfirm();
            this.resetConfirmAtMidnight();
        }, msToMidnight);
    }

    addPerson(person) {
        person.uuid = this.generateNewUuid();
        this.people.push(person);
    }

    getPersonByName(name) {
        const _name = name.toLowerCase()
        const filtered = this.people.filter(person => person.name.toLowerCase() === _name)
        return filtered.length > 0 ? filtered[0] : null
    }

    getPersonByUuid(uuid) {
        const filtered = this.people.filter(person => person.uuid === uuid)
        return filtered.length > 0 ? filtered[0] : null
    }

    getPersonById(telegramId) {
        const filtered = this.people.filter(person => person.telegramId === telegramId)
        return filtered.length > 0 ? filtered[0] : null
    }

    getPeople() {
        return this.people
    }

    static fromJson(obj) {

    }

    toJson() {
        return this.people.map(person => person.toJson())
    }

    static async loadFromStorage() {
        const data = await storage.defaultInstance.get('data')
        const model = new Model()
        try {
            model.people = data.map(item => Person.fromJson(item))
        } catch (e) {
            console.log(`couldn't load data from storage, creating fresh data`)
        }
        return model
    }

    saveToStorage() {
        this.store.setItem('data', this.toJson())
    }

    generateNewUuid() {
        const existingIDs = this.people.map(p => p.uuid);
        let newID;
        do {
            newID = Math.floor(Math.random() * 900000000 + 100000000).toString();
        } while (existingIDs.includes(newID))
        return newID;
    }

    setupAMRefs() {
        for (let i = 0; i < this.people.length; i++) {
            const j = (i + 1) % this.people.length
            this.people[i].mortal = this.people[j].uuid
            this.people[j].angel = this.people[i].uuid
        }
    }

    dumpUuids() {
        return this.people.map(person => `${person.name},${person.uuid}`).join("\n")
    }

    hasPersonWithName(name) {
        for (const person of this.people) {
            if (name === person.name) {
                return true;
            }
        }
        return false;
    }

    // copyPeopleFrom(other) {
    //     for (const newPerson of other.people) {
    //         if (this.hasPersonWithName(newPerson.name)) {
    //             console.warn("Error: there is already a person " + name + " in the database.");
    //             continue;
    //         }
    //         newPerson.uuid = this.generateNewUuid();
    //         this.addPerson(newPerson);
    //     }
    // }
}

class Person {
    constructor() {
        this.uuid = ""
        this.name = ""
        this.username = ""
        this.og = ""
        this.telegramId = ""
        this.angel = null;
        this.mortal = null;
        this.facts = [];
        this.confirm = false;
        return this;
    }

    withName(name) {
        this.name = name;
        return this;
    }

    withOg(og) {
        this.og = og;
        return this;
    }

    register(usr) {
        this.username = usr.username;
        this.telegramId = usr.id;
    }

    deregister() {
        this.telegramId = "";
        this.username = "";
        this.confirm = false;
    }

    isRegistered() {
        return this.telegramId !== ""
    }

    toJson() {
        return {
            uuid: this.uuid,
            name: this.name,
            username: this.username,
            og: this.og,
            telegramId: this.telegramId,
            angel: this.angel || null,
            mortal: this.mortal || null,
            facts: this.facts,
            confirm: this.confirm
        }
    }

    static fromJson(obj) {
        const person = new Person()
        person.uuid = obj.uuid
        person.name = obj.name
        person.username = obj.username
        person.og = obj.og
        person.telegramId = obj.telegramId
        person.angel = obj.angel
        person.mortal = obj.mortal
        person.facts = obj.facts
        person.confirm = obj.confirm
        return person
    }
}

module.exports = {Model, Person}
