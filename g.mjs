import _ from 'lodash-es'
import htmlDecode from './src/htmlDecode.mjs'


console.log(htmlDecode('foo&#x26;bar'))
// => foo&bar

console.log(htmlDecode('foo &#xA9; bar &#x2260; baz &#x1D306; qux'))
// => foo © bar ≠ baz 𝌆 qux

console.log(htmlDecode('&#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;'))
// => <img src="x"" onerror="prompt(1)">

//node --experimental-modules g.mjs
