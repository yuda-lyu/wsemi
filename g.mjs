import cfilesize from './src/cfilesize.mjs'

console.log(cfilesize(0))
// => '0.0 b'

console.log(cfilesize(100))
// => '100.0 b'

console.log(cfilesize(2048))
// => '2.0 kb'

console.log(cfilesize(2000000))
// => '1.9 mb'

console.log(cfilesize(2000000000))
// => '1.9 gb'
