const {load} = require('./src/load-data')

console.log(`loading data for ${process.argv[2]}`)
load(process.argv[2])