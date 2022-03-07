"use strict";
let halfwit = (code, inputs, flags = '') => {
    let string_so_far = '', in_int = false, tokens = [];

    if (flags.includes('h')) {
        return `- e - execute the filename as code
- A - print as chars
- c - print compiled code
- C - count source length in Halfwit codepage
- s - compress list / int
- t - print tokens
- p - print parsed tokens
- h - print flag help menu`
    }

    if (flags.includes('C')) {
        let count = 0;
        for(let byte of code) {
            if ('[M{;+*><JNfb:$?k'.includes(byte)) count += .5;
            else if ('e/|(%EnSilFR_}r'.includes(byte)) count += 1;
            else if ('0123456789sZDW,.'.includes(byte)) count += 1.5;
        }
        return `Code is ${count} byte${count == 1 ? '' : 's'} long.`
    }

    if (flags.includes('s')) {
        function int_compress(num) {
            num = BigInt(num);
            let str = '';
            while (num) {
                str = '[M{;+*JNfb:$?k'[num % 14n] + str;
                num /= 14n;
            }
            return str
        }
        let value = eval(code.replace(/(\d+)/g,'$1n')), result;
        if (Array.isArray(value)) {
            result = '>' + value.map(int_compress).join('>') + '<';
        } else result = '>' + int_compress(value) + '<'
        return result;
    }

    const aliases = {
        'k*': 'e', 'k+': '/', 'k[': '|', 'kM': '(',
        'k;': '%', 'k{': 'E', 'kN': 'n', 'kJ': 'S',
        'k?': 'i', 'k<': 'l', 'kf': 'F', 'kb': 'R',
        'k:': '_', 'k>': '}','k$': 'r' ,
        'kk[': '0', 'kkM': '1', 'kk{': '2', 'kk;': '3',
        'kk+': '4', 'kk*': '5', 'kkJ': '6', 'kk>': '7',
        'kk<': '8', 'kkN': '9', 'kkf': 's', 'kkb': 'Z',
        'kk:': 'D', 'kk$': 'W', 'kk?': ',', 'kk[': '.',
    }
    for (let char = 0; char < code.length; char++) {
        if (in_int) {
            if (code[char] == '<') {
                in_int = false;
                tokens.push(string_so_far + '<');
                string_so_far = '';
            } else {
                string_so_far += code[char];
            }
        } else {
            if (code[char] == '>') {
                in_int = true;
                string_so_far += '>';

                continue;
            } else if (code[char] == 'k') {
                string_so_far += 'k';
            } else if (string_so_far) {
                tokens.push(string_so_far + code[char])
                string_so_far = '';                
            } else {
                tokens.push(code[char])
            }
            if (string_so_far.length == 3) {
                tokens.push(string_so_far);
                string_so_far = '';
            }
        }
    }
    if (string_so_far) tokens.push(string_so_far);    
    tokens = tokens.map(value => (aliases[value] ?? value))
    .flatMap(value => value == 'E' ? ['(','n'] : value)

    let struct_stack = [], elems = [];

    for (let token of tokens) {
        if (token == '[') {
            struct_stack.push('if');
            elems.push(['if'])
        } else if (token == 'M') {
            struct_stack.push('map');
            elems.push(['map'])
        } else if (token == '{') {
            struct_stack.push('while','cond');
            elems.push(['while']);
        } else if (token == ';') {
            if (struct_stack.at(-1) == 'cond') {
                elems.push(['cond']);
                struct_stack.pop()
            } else {
                elems.push(['end_' + struct_stack.pop()])
            }
        } else if (token == '|') {
            if (struct_stack.at(-1) == 'if') {
                elems.push(['else']);
            } else {
                elems.push(['if_not'])
                struct_stack.push('if_not')
            }
        } else if (token == '(') {
            struct_stack.push('for');
            elems.push(['for'])
        } else if (token == 'n') {
            if (['for','map','filter'].some(value => struct_stack.includes(value))) {
                elems.push(['ctx'])
            } else {
                elems.push(['const', 1n]);
            }
        } else if (token == 'F') {
            struct_stack.push('filter');
            elems.push(['filter'])
        } else if (token == 'R') {
            struct_stack.push('reduce');
            elems.push(['reduce'])
        } else if (token[0] == '>') {
            let str = '', strs = [];
            for (let i = 1; i < token.length; i++) {
                if (token[i] == '>' || token[i] == '<') {
                    strs.push(str);
                    str = '';
                } else str += token[i];
            }
            if (str) strs.push(str)
            let nums = strs.map(val => {
                for (let key in aliases) {
                    val = val.replaceAll(aliases[key], key)
                }
                let int = 0n;
                for (let char of val) {
                    int = int * 14n + BigInt('[M{;+*JNfb:$?k'.indexOf(char));
                }
                return int
            })
            if (nums.length == 1) nums = nums[0]
            elems.push(['const', nums])
        } else {
            elems.push(['elem', token])
        }
    }

    for (let item of struct_stack.reverse()) {
        elems.push(['end_' + item])
    }

    let a = value => Array.isArray(value)
    let range = value => [...Array(Number(value)).keys()].map(BigInt)
    let tail = value => value[value.length - 1]

    let cycle_pop = value => {
        let head = value[0] ?? 0n;
        value.push(value.shift())
        return head;
    }

    let pop = (stack, amount = -1) => {
        if (amount == -1) return stack.pop() ?? cycle_pop(tail(input_stack) ?? 0n);
        if (!amount) return [];
        let res;
        if (stack.length) res = stack.pop();
        else res = cycle_pop(tail(input_stack)) ?? 0n;
        return [res, ...pop(stack, amount - 1)]
    }
    let vectorise = func => {
        let inner = 
            func.length == 1 ? 
                val => a(val) ? val.map(inner) : func(val)
            : (left, right) => {
                if (a(left) && a(right)) {
                    if (left.length > right.length) {
                        return left.map((val, i) => inner(val, right[i] ?? 0n))
                    } else {
                        return right.map((val, index) => inner(left[index] ?? 0n, val))
                    }
                } else if (a(left)) {
                    return left.map(val => inner(val, right))
                } else if (a(right)) {
                    return right.map(val => inner(left, val))
                } else {
                    return func(left, right)
                }
            }
        return inner 
    }
    let sqrt = (value) => {
        if (value < 0n) {
            throw 'square root of negative numbers is not supported'
        }
    
        if (value < 2n) {
            return value;
        }
    
        function newtonIteration(n, x0) {
            const x1 = ((n / x0) + x0) >> 1n;
            if (x0 === x1 || x0 === (x1 - 1n)) {
                return x0;
            }
            return newtonIteration(n, x1);
        }
    
        return newtonIteration(value, 1n);
    }
    let isPrime = (num) => {
        if (num % 2n == 0) return false;
        if (num < 2n) return false;
        for (let i = 3n; i < sqrt(n); i += 2n) {
            if (num % i == 0) return false;
        }
        return true;
    }
    let compare = (left, right) => {
        if (typeof left == 'undefined') return -1;
        if (typeof right == 'undefined') return 1;
        if (a(left) && a(right)) {
            for (let i = 0; i < Math.max(left.length, right.length); i++) {
                if (compare(left[i], right[i])) {
                    return compare(left[i], right[i])
                }
            }
            return 0;
        }
        if (a(left)) return 1;
        if (a(right)) retuurn -1
        return left == right ? 0 : left > right ? 1 : -1;
    } 
    let primeFactors = (num) => {
        let factors = [];
        for (let i = 2n; i <= num; i++) {
            while (num % i == 0n) {
                factors.push(i);
                num /= i;
            }
        }
        return factors;
    }
    let repr = (value) => JSON.stringify(value, 
        (_, v) => typeof v == 'bigint' ? 
            v.toString() + 'n': v
    )?.replace(/"(\d+n)"/g, '$1')
    let toStr = value => {
        if (!a(value)) {
            return String.fromCharCode(Number(value))
        } else if (value.every(a)){
            return value.map(val => String.fromCharCode(...val.map(Number))).join`\n`
        } else {
            return String.fromCharCode(...value.map(Number))
        }
    }
    let onerange = value => a(value) ? value : [...Array(Number(value))].map((_,x) => BigInt(x + 1))
    let bool = value => (a(value) ? value.length : value != 0n) ? 1n : 0n
    let elements = {
        '+': [ vectorise((a, b) => a + b), 2, 1],
        '*': [ vectorise((left, right) => left * right), 2, 1],
        'J': [ (left, right) => {
            if (a(left)) return left.concat(right);
            if (a(right)) return [left, ...right]
            return [left, right]
        }, 2, 1],
        'N': [ vectorise(val => -val), 1, 1],
        'f': [ val => a(val) ? val.flat() : val * val, 1, 1],
        'b': [ (left, right) => {
            if (a(left)) {
                if (!a(right)) right = range(right)
                let base = BigInt(right.length), res = 0n;
                for (let item of left){
                    res *= base;
                    res += BigInt(right.indexOf(item))
                }
                return res;
            } else {
                if (!a(right)) right = range(right);
                let res = [], base = BigInt(right.length);
                while (left) {
                    res.unshift(right[left % base])
                    left /= base
                }
                return res;
            }
        }, 2, 1],
        ':': [ val => [val, val], 1, 2],
        '$': [ (left, right) => [right, left], 2, 2],
        '?': [ () => cycle_pop(input_stack[0]), 0, 1],
        'e': [ vectorise((left, right) => left ** right), 2, 1],
        '/': [ vectorise((left, right) => left / right), 2, 1],
        '%': [ vectorise((left, right) => left % right), 2, 1],
        'S': [ value => a(value) ? value.reduce(elements['+'][0]) : BigInt(isPrime(value)), 1, 1],
        'i': [ (left, right) => {
            let index = (list, elem) => {
                length = BigInt(list.length)
                if (elem >= 0n){
                    return list[elem % length]
                } else {
                    return list[length + (elem + 1) % BigInt(length) - 1]
                }
            }
            if (a(left) && a(right)) {
                return right.map(val => index(left, val))
            } else if (a(left)){
                return index(left, right)
            } else if (a(right)){
                return index(right, left)
            } else {
                return left ^ right
            }
        }, 2, 1],
        'l': [ (left, right) => compare(left, right) == -1 ? 1n : 0n , 2, 1],
        '_': [ () => [], 1, 0],
        'r': [ vectorise(val => Array(Number(val)).map((_, i) => i + 1)), 1, 1],
        '0': [ () => 100n, 0, 1],
        '1': [ () => 256n, 0, 1],
        '2': [ () => 26n, 0, 1],
        '3': [ () => 50n, 0, 1],
        '4': [ () => [0n, 1n], 0, 1],
        '5': [ () => 128n, 0, 1],
        '6': [ () => 64n, 0, 1],
        '7': [ () => 32n, 0, 1],
        '8': [ () => 16n, 0, 1],
        '9': [ () => 1000n, 0, 1],
        's': [ val => a(val) ? val.sort(compare) : primeFactors(val), 1, 1],
        'Z': [ (left, right) => {
            let repeat = (val, int) => Array(Number(int)).fill(val);
            if (a(left) && a(right)) {
                if (left.length > right.length) [left, right] = [right, left];
                return right.map((val, i) => [val, left[i] ?? 0n])
            }
            if (a(right)){
                return right.map(val => repeat(val, left))
            }
            return repeat(left, right)
        }, 2, 1],
        'D': [ vectorise((left, right) => left % right === 0n) ],
        ',': [ value => (printed = true) && (output += repr(value) + '\n'), 1, 0],
        '.': [ value => { printed = true; output += toStr(value)}, 1, 0],
        'x': [ () => console.debug(repr(stack)), 1, 0],
        'p': [ () => console.debug(repr(pop(stack))), 1, 0],
    };
    let compiled = '';
    let hash = () => 'x' + Math.random().toString(16).slice(2);
    for (let token of elems) {
        if (token[0] == 'elem' ) {
            if (token[1] == '}') compiled += 'stack.unshift(stack.pop());'
            else if (token[1] == 'W') compiled += 'stack=[stack];'
            else {
                let elem = elements[token[1]]
                if (!elem) continue;
                compiled += [`(`,`stack.push(`,`stack.push(...`][elem[2]] + `elements['${token[1]}'][0](...pop(stack,${elem[1]}).reverse()));`
            }
        } else if (token[0] == 'const') {
            compiled += `stack.push(${repr(token[1])});`
        } else if (token[0] == 'if') {
            compiled += `if(bool(pop(stack))){`
        } else if (token[0] == 'else') {
            compiled += `}else{`
        } else if (token[0] == 'if_not') {
            compiled += `if(!bool(pop(stack))){`
        } else if (token[0] == 'for') {
            let variable = hash(), var2 = hash();
            compiled += `let ${variable}=pop(stack);if(!bool(a(${variable})))${variable}=range(${variable});for(let ${var2} of ${variable}){let ctx=${var2};`
        } else if (token[0] == 'ctx') {
            compiled += `stack.push(ctx??1n);`
        } else if (token[0] == 'map') {
            compiled += `;stack.push(onerange(pop(stack)).map(value=>{let ctx=value;input_stack.push([value]);let stack=[];`
        } else if (token[0] == 'end_map') {
            compiled += `var res=pop(stack);input_stack.pop();return res}));`
        } else if (token[0] == 'filter') {
            compiled += `;stack.push(onerange(pop(stack)).filter(value=>{let ctx=value;input_stack.push([value]);let stack=[];`
        } else if (token[0] == 'end_filter') {
            compiled += `var res=pop(stack);input_stack.pop();return bool(res)}));`
        } else if (token[0] == 'reduce') {
            compiled += `;stack.push(onerange(pop(stack)).reduce((current,next)=>{input_stack.push([next, current]);let stack=[];`
        } else if (token[0] == 'end_reduce') {
            compiled += `var res=pop(stack);input_stack.pop();return res}));`
        } else if (token[0] == 'end_for') {
            compiled += `}`
        } else if (token[0] == 'end_if') {
            compiled += `}`
        } else if (token[0] == 'end_if_not') {
            compiled += `}`
        } else if (token[0] == 'while') {
            compiled += 'while(1){'
        } else if (token[0] == 'cond') {
            compiled += `if(!bool(pop(stack)))break;`
        } else if (token[0] == 'end_while') {
            compiled += `}`
        }
    }
    if (flags.includes('p')) console.log(repr(elems))
    if (flags.includes('c')) console.log(compiled)
    if (flags.includes('t')) console.log(repr(tokens))

    let output = '', stack = [], printed = false, input_stack = [inputs];
    inputs = vectorise(value => 
        typeof value == 'number' ? 
            BigInt(value) 
        : typeof value == 'string' ? 
            [...value].map(char => BigInt(char.charCodeAt()))
        : value) (inputs)

    eval(compiled);
    if (!printed){
        if (flags.includes('A')) output += toStr(stack.pop())
        else output += repr(stack.pop() ?? 0n)
    }
    return output;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = halfwit;
} else {
    window.halfwit = halfwit
}