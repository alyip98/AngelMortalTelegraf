const storage = require('node-persist');
storage.init({
    'dir': 'data',
    stringify: s => Buffer.from(JSON.stringify(s)).toString('base64'),
    parse: s => JSON.parse(Buffer.from(s, 'base64').toString('utf8')),
    encoding: 'utf8',
    // logging: true,
    ttl: false,
});

class Model {
    constructor(store) {
        this.store = store || storage.defaultInstance
        this.people = [];
    }

    addPerson(person) {
        this.people.push(person)
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

    // TODO: ensure uniqueness
    // TODO: add option to not generate if already generated
    generateUuids() {
        function generateUuid() {
            return Math.floor(Math.random() * 900000000 + 100000000).toString()
        }
        this.people.forEach(person => {
            person.uuid = generateUuid()
        })
    }

    setupAMRefs() {
        for (let i = 0; i < this.people.length; i++) {
            const j = (i + 1)%this.people.length
            this.people[i].mortal = this.people[j].uuid
            this.people[j].angel = this.people[i].uuid
        }
    }

    dumpUuids() {
        return this.people.map(person => `${person.name},${person.uuid}`).join("\n")
    }

    copy(other) {
        this.people = other.people
        // this.store = other.store
    }
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

    register(telegramId) {
        this.telegramId = telegramId;
    }

    deregister() {
        this.telegramId = ""
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
        }
    }

    static fromJson(obj) {
        const person = new Person()
        person.uuid= obj.uuid
        person.name= obj.name
        person.username= obj.username
        person.og = obj.og
        person.telegramId= obj.telegramId
        person.angel = obj.angel
        person.mortal = obj.mortal

        return person
    }
}

module.exports = {Model, Person}
