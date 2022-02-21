# Halfwit

Halfwit is an experimental golfing language that fits most commands in half a byte. It's stack-based.

## Usage

```sh
npm install halfwit
node main.js <filename> [single string of flags] [inputs]
```

Or clone this repo.

Or in node.js:

```js
const halfwit = require('halfwit')
```

Or in a website:

```html
<script src='/path/to/halfwit.js'></script>
```

Or, you can [try it online](https://dso.surge.sh/#halfwit) at [DSO](https://dso.surge.sh).

## Flags

Halfwit has several flags:

- `e` - execute the filename as code
- `A` - print as chars
- `c` - print compiled code
- `C` - count source length in Halfwit codepage
- `s` - compress list / int
- `t` - print tokens
- `p` - print parsed tokens
- `h` - print flag help menu

## Builtins

Some builtins take up .5 bytes, some 1, and some 1.5. 

## .5 bytes

- `[` - condition (`[...;`)
- `M` - map (`M...;`)
- `{` - while (condition) do stuff (`{...;...;`), condition = first part
- `;`; - terminate structure
- `+` - Addition, vectorising
- `*` - Multiplication, vectorising
- `J` - join - append / prepend / pair
- `>` - Starts a compressed int - `>...<` / adds to a compressed int list `>...>...<`
- `<` - end int / intlist (see above) / length / range 0...n-1
- `N` - negate / reverse
- `f`  - flatten / square
- `b` - base conversion:
  - Int, int -> to_base
  - Int, list  -> to-custom-base
  - List, int -> from-base
  - list, list -> from-custom-base
- `:` - Duplicate
- `$` - Swap
- `?` - Take input
- `k` - Digraph modifier

Note that all of these can be represented as a single character as well as the encoding.

## 1 byte

- `k*` / `e` - exponentiation, vectorising
- `k+` / `/` - floor division
- `k[` / `|` - `[...|...;` else in an if block, otherwise `|...;` -> if not
- `kM` / `(` -> for (same stack) - `(...;`
- `k;` / `%` - modulo (vectorising)
- `k{` / `E` - Eqiuvalent of `(n`
- `kN` / `n` -
  - in `(` / `M` / `F`: Push context (loop var)
  - in global scope: Push 1
- `kJ` / `S` - Sum / is prime
- `k?` / `i` - index value (s) into list / bitwise xor
- `k<` / `l` - Comparison (less than)
- `kf` / `F` - Filter - `F...;`
- `kb` / `R` - Reduce `R...;`
- `k:` / `_` - Pop stack
- `k>` / `}` - rotate stack right
- `k$` / `r` - range (inclusive)
- `kk` : useful constants

## 1.5 bytes

- `kk[` / `0` - 100
- `kkM` / `1` - 256
- `kk{` / `2` - 26
- `kk;` / `3` - 50
- `kk+` / `4` - [0, 1]
- `kk*` / `5` - 128
- `kkJ` / `6` - 64
- `kk>` / `7` - 32
- `kk<` / `8` - 16
- `kkN` / `9` - 1000


- `kkf` / `s` - sort / prime factors
- `kkb` / `Z`: 
  - list, list -> zip
  - int, list -> repeat (vectorised)
  - list, int -> repeat
  - int, int -> repeat
- `kk:` / `D` - is a divisible by B? (vectorising)
- `kk$` / `W` - stack = [stack]
- `kk?` / `,` - prettyprint with trailing newline
- `kkk` / `.` - Print as chars without trailing newline

## Not scored

These are debugging instructions that aren't included in the codepage.

- `x` - Print stack