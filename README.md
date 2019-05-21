# wsemi
A support package for web developer.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) [![npm version](http://img.shields.io/npm/v/wsemi.svg?style=flat)](https://npmjs.org/package/wsemi) [![Build Status](https://travis-ci.org/yuda-lyu/wsemi.svg?branch=master)](https://travis-ci.org/yuda-lyu/wsemi) [![codecov](https://img.shields.io/codecov/c/github/codecov/wsemi.svg)](https://codecov.io/gh/yuda-lyu/wsemi) [![npm download](https://img.shields.io/npm/dt/wsemi.svg)](https://npmjs.org/package/wsemi) [![license](https://img.shields.io/npm/l/wsemi.svg?style=flat)](https://npmjs.org/package/wsemi)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/wsemi/wsemi.html).

## Example
To view some examples for more understanding, visit examples:
> **lodash:** [ex-lodash.html](https://yuda-lyu.github.io/wsemi/examples/ex-lodash.html)

> **dayjs:** [ex-dayjs.html](https://yuda-lyu.github.io/wsemi/examples/ex-dayjs.html)

> **time[time2expire, time2past]:** [ex-time2expire-time2past.html](https://yuda-lyu.github.io/wsemi/examples/ex-time2expire-time2past.html)

> **cryptojs:** [ex-cryptojs.html](https://yuda-lyu.github.io/wsemi/examples/ex-cryptojs.html)

> **fuzzball:** [ex-fuzzball.html](https://yuda-lyu.github.io/wsemi/examples/ex-fuzzball.html)

> **tinycolor:** [ex-tinycolor.html](https://yuda-lyu.github.io/wsemi/examples/ex-tinycolor.html)

> **uaparser:** [ex-uaparser.html](https://yuda-lyu.github.io/wsemi/examples/ex-uaparser.html)

> **xss:** [ex-xss.html](https://yuda-lyu.github.io/wsemi/examples/ex-xss.html)

> **openlink:** [ex-openlink.html](https://yuda-lyu.github.io/wsemi/examples/ex-openlink.html)

> **tippyjs[with popper.js]:** [ex-tippyjs.html](https://yuda-lyu.github.io/wsemi/examples/ex-tippyjs.html)

> **xlsx:** [ex-xlsx.html](https://yuda-lyu.github.io/wsemi/examples/ex-xlsx.html)

## Installation
### Using npm(ES6 module):
> **Note:** wsemi depends on lodash, crypto-js, dayjs, fuzzball, @ctrl/tinycolor, ua-parser-js, xss, tippy.js, xlsx
```alias
npm i wsemi
```

### In a browser(UMD module):
> **Note:** umd file includes with lodash and crypto-js, by using tree-shaking for dead-code elimination

[Optional] Add script with nomodule for IE11
```alias
<script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>
```
[Optional] Add script for dayjs(or moment)
> **Note:** Include script when use some function of time. If include moment, need set moment to window.dayjs (ex: window.dayjs = moment), and put it before include script for wsemi.umd.js.
```alias
<script src="https://cdn.jsdelivr.net/npm/dayjs/dayjs.min.js"></script>
```
or
```alias
<script src="https://cdn.jsdelivr.net/npm/moment/moment.min.js"></script>
<script>
  window.dayjs = moment
</script>
```
[Optional] Add script for fuzzball
> **Note:** include script when use `fuzzfind` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/fuzzball/dist/fuzzball.umd.min.js"></script>
```
[Optional] Add script for tinycolor2, it's almost same as @ctrl/tinycolor
> **Note:** include script when use `hsl` or `genGradientColor` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/tinycolor2/dist/tinycolor-min.js"></script>
```
[Optional] Add script for ua-parser-js
> **Note:** include script when use `getUserAgent` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js/dist/ua-parser.min.js"></script>
```
[Optional] Add script for xss
> **Note:** include script when use `clearXSS` function.
```alias
<script src="https://rawgit.com/leizongmin/js-xss/master/dist/xss.js"></script>
```
[Optional] Add script for popper.js and tippy.js
> **Note:** include script when use `onTooltip` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/popper.js/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tippy.js/umd/index.all.js"></script>
```
[Optional] Add script for xlsx
> **Note:** include script when use `downloadExcelFileFromData` or `getDataFromExcelFileU8Arr` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/js-xlsx/dist/xlsx.full.min.js"></script>
```
Add script for wsemi
```alias
<script src="https://cdn.jsdelivr.net/npm/wsemi@1.1.3/dist/wsemi.umd.js"></script>
```
