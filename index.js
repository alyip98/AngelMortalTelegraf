const server = require("./src/server");
const cli = require("./src/cli");
const {Model} = require("./src/model");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function setupCLI() {

}

async function main() {
    const model = await Model.loadFromStorage()
    model.saveToStorage()
    model.resetConfirmAtMidnight()
    server.start(model);
    readline.on('line', cli.InputHandler(model));

    console.log(model.dumpUuids())
}

main()