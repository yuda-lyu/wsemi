# wsemi
A support package for web developer.

[![Build Status](https://travis-ci.org/yuda-lyu/wsemi.svg?branch=master)](https://travis-ci.org/yuda-lyu/wsemi)

## Documentation
To view documentation or get support , visit [docs](https://yuda-lyu.github.io/wsemi/wsemi.html).

## Installation
### Using npm(ES6 module):
> **Note:** wsemi depends on lodash, dayjs, crypto-js, fuzzball, @ctrl/tinycolor, ua-parser-js, xss, tippy.js, xlsx
```alias
npm i wsemi
```

### In a browser(UMD module):
> **Note:** umd file is included with lodash(part, tree-shaking), dayjs, crypto-js(part, tree-shaking)

[Optional] Add script with nomodule for IE11
```alias
<script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>
```
[Optional] Add script for dayjs(or moment)
> **Note:** It is necessary to include when use some function of time
```alias
<script src="https://cdn.jsdelivr.net/npm/dayjs/dayjs.min.js"></script>
//dayjs(or moment) need to save in window.ot
window.ot = dayjs
```
[Optional] Add script for fuzzball
> **Note:** It is necessary to include when use `fuzzfind` function
```alias
<script src="https://cdn.jsdelivr.net/npm/fuzzball/dist/fuzzball.umd.min.js"></script>
```
[Optional] Add script for tinycolor2
> **Note:** It is necessary to include when use `hsl` or `genGradientColor` function
```alias
<script src="https://cdn.jsdelivr.net/npm/tinycolor2/dist/tinycolor-min.js"></script>
```
[Optional] Add script for ua-parser-js
> **Note:** It is necessary to include when use `getUserAgent` function
```alias
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js/dist/ua-parser.min.js"></script>
```
[Optional] Add script for xss
> **Note:** It is necessary to include when use `clearXSS` function
```alias
<script src="https://gitcdn.xyz/repo/leizongmin/js-xss/master/dist/xss.min.js"></script>
```
[Optional] Add script for popper.js and tippy.js
> **Note:** It is necessary to include when use `onTooltip` function
```alias
<script src="https://cdn.jsdelivr.net/npm/popper.js/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tippy.js/umd/index.all.js"></script>
```
[Optional] Add script for xlsx
> **Note:** It is necessary to include when use `downloadExcelFileFromData` or `getDataFromExcelFileU8Arr` function
```alias
<script src="https://cdn.jsdelivr.net/npm/js-xlsx/dist/xlsx.full.min.js"></script>
```
Add script for wsemi
```alias
<script src="/dist/wsemi.umd.js"></script>
```
