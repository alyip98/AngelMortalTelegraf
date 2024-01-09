const server = require("./src/bots");
const cli = require("./src/cli");
const {Model} = require("./src/model");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const express = require("express");
const admin = require("./src/admin");

const port = 8080

async function main() {
    const model = await Model.loadFromStorage()
    model.saveToStorage()
    await admin.start(model);
    await server.start(model);
    readline.on('line', cli.InputHandler(model));

    console.log(model.dumpUuids())
}

main()