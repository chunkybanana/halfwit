#!usr/bin/env node
let halfwit = require('./halfwit.js')

let [filename, flags, ...input] = process.argv.slice(2)

if(!filename) console.log('Usage: node main.js <filename> [single string of flags] [inputs]'), process.exit()

let code;

if(flags && flags.includes('e')) {
    code = filename;
} else {
    code = require('fs').readFileSync(filename);
}

for(let i = 0; i < input.length; i++) {
    let result;
    try {
        result = eval(input[i])
    } catch(e) {
        result = input[i]
    }
    input[i] = result;
}

console.log(halfwit(code, input, flags))