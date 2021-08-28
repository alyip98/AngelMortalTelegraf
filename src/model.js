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

    generateUuids() {
        function generateUuid() {
            return Math.floor(Math.random() * 900000000 + 100000000).toString()
        }
        this.people.forEach(person => {
            person.uuid = generateUuid()
        })
    }

    setupAMRefs(groupSize) {
        groupSize = groupSize || this.people.length
        const n = this.people.length
        const gs = groupSize
        for (let i = 0; i < this.people.length; i++) {
            let k = Math.floor(i/gs)
            let j = ((i + 1) % n) % gs + k * gs
            this.people[i].mortal = this.people[j].uuid
            this.people[j].angel = this.people[i].uuid
        }
    }

    dumpUuids() {
        return this.people.map(person => `${person.name},${person.uuid}`).join("\n")
    }

    copy(other) {
        this.people = other.people
    }
}

class Person {
    constructor() {
        this.uuid = ""
        this.name = ""
        this.roomNum = ""
        this.telegramId = ""
        this.pranked = false
        this.twoTruths = false
        this.diet = false
        this.angel = null;
        this.mortal = null;
        return this;
    }

    getIntro() {
        return `hey! your mortal is ${this.name.trim()}`
    }

    getIntroForMortal() {
        return ""
    }

    withName(name) {
        this.name = name;
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
        const data = {}
        const person = this
        Object.keys(person).forEach(function (key) {
            data[key] = person[key];
        });
        return data
    }

    static fromJson(obj) {
        const person = new Person()
        Object.keys(obj).forEach(function (key) {
            person[key] = obj[key];
        });
        return person
    }
}

module.exports = {Model, Person}
