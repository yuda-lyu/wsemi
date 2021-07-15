import strFindFuzz from './src/strFindFuzz.mjs'


console.log(strFindFuzz('Wodooman(樵夫)', 'The Woodman(樵夫) set to work at once, and so...', true))
// => 41.333333333333336, 第2參數會被空白切分成多關鍵字

console.log(strFindFuzz('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)', true))
// => 82

console.log(strFindFuzz(['abc', 'def123', '中文測試'], 'ef', true))
// => 100

console.log(strFindFuzz(['abc', 'def123', '中文測試'], 'efgg', true))
// => 50

console.log(strFindFuzz(['abc', 'def123', '中文測試'], 'ef'))
// => true
