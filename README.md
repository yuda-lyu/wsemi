# wsemi
A support package for web developer.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/wsemi.svg?style=flat)](https://npmjs.org/package/wsemi) 
[![Build Status](https://travis-ci.org/yuda-lyu/wsemi.svg?branch=master)](https://travis-ci.org/yuda-lyu/wsemi) 
[![license](https://img.shields.io/npm/l/wsemi.svg?style=flat)](https://npmjs.org/package/wsemi) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/wsemi/master/dist/wsemi.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/wsemi)
[![npm download](https://img.shields.io/npm/dt/wsemi.svg)](https://npmjs.org/package/wsemi) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/wsemi.svg)](https://www.jsdelivr.com/package/npm/wsemi)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/wsemi/wsemi.html).

## Example
To view some examples for more understanding, visit examples:
> **lodash:** [ex-lodash.html](https://yuda-lyu.github.io/wsemi/examples/ex-lodash.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-lodash.html)]

> **dayjs:** [ex-dayjs.html](https://yuda-lyu.github.io/wsemi/examples/ex-dayjs.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-dayjs.html)]

> **dayjs:** [ex-time2expire-time2past.html](https://yuda-lyu.github.io/wsemi/examples/ex-time2expire-time2past.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-time2expire-time2past.html)]

> **cryptojs:** [ex-cryptojs.html](https://yuda-lyu.github.io/wsemi/examples/ex-cryptojs.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-cryptojs.html)]

> **fuzzball:** [ex-fuzzball.html](https://yuda-lyu.github.io/wsemi/examples/ex-fuzzball.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-fuzzball.html)]

> **tinycolor:** [ex-tinycolor.html](https://yuda-lyu.github.io/wsemi/examples/ex-tinycolor.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-tinycolor.html)]

> **uaparser:** [ex-uaparser.html](https://yuda-lyu.github.io/wsemi/examples/ex-uaparser.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-uaparser.html)]

> **xss:** [ex-xss.html](https://yuda-lyu.github.io/wsemi/examples/ex-xss.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-xss.html)]

> **openlink:** [ex-openlink.html](https://yuda-lyu.github.io/wsemi/examples/ex-openlink.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-openlink.html)]

> **tippyjs[with popper.js]:** [ex-tippyjs.html](https://yuda-lyu.github.io/wsemi/examples/ex-tippyjs.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-tippyjs.html)]

> **xlsx:** [ex-xlsx.html](https://yuda-lyu.github.io/wsemi/examples/ex-xlsx.html) [[source code](https://github.com/yuda-lyu/wsemi/blob/master/docs/examples/ex-xlsx.html)]

## Installation
### Using npm(ES6 module):
> **Note:** wsemi depends on `lodash`, `crypto-js`, `dayjs`, `fuzzball`, `ua-parser-js`, `xss`, `xlsx`
```alias
npm i wsemi
```

### In a browser(UMD module):
> **Note:** umd file includes with `lodash` and `crypto-js`, by using tree-shaking for dead-code elimination

[Optional] Add script with nomodule for IE11.
```alias
<script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>
```
[Optional] Add script for dayjs(or moment).
> **Note:** Include script when use some function of time. If include `moment`, need set `moment` to `window.dayjs` (ex: `window.dayjs = moment`), and put it before include script for wsemi.umd.js.
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
[Optional] Add script for fuzzball.
> **Note:** include script when use `strFindFuzz` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/fuzzball/dist/fuzzball.umd.min.js"></script>
```
[Optional] Add script for ua-parser-js.
> **Note:** include script when use `getUserAgent` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js/dist/ua-parser.min.js"></script>
```
[Optional] Add script for xss.
> **Note:** include script when use `clearXSS` function.
```alias
<script src="https://rawgit.com/leizongmin/js-xss/master/dist/xss.js"></script>
```
[Optional] Add script for xlsx.
> **Note:** include script when use `downloadExcelFileFromData` or `getDataFromExcelFileU8Arr` function.
```alias
<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
<script>
    window.xlsx = window.XLSX //need rename to xlsx
</script>
```
[Necessary] Add script for wsemi.
```alias
<script src="https://cdn.jsdelivr.net/npm/wsemi@1.2.55/dist/wsemi.umd.js"></script>
```
