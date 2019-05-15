# wsemi
A support package for web developer.

[![Build Status](https://travis-ci.org/yuda-lyu/wsemi.svg?branch=master)](https://travis-ci.org/yuda-lyu/wsemi)

## Documentation
To view documentation or get support , visit [docs](https://yuda-lyu.github.io/wsemi/wsemi.html).

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
> **Note:** include script when use some function of time
```alias
<script src="https://cdn.jsdelivr.net/npm/dayjs/dayjs.min.js"></script>
<script>
    window.ot = dayjs //dayjs(or moment) need to save as window.ot
</script>
```
[Optional] Add script for fuzzball
> **Note:** include script when use `fuzzfind` function
```alias
<script src="https://cdn.jsdelivr.net/npm/fuzzball/dist/fuzzball.umd.min.js"></script>
```
[Optional] Add script for tinycolor2, it's almost same as @ctrl/tinycolor
> **Note:** include script when use `hsl` or `genGradientColor` function
```alias
<script src="https://cdn.jsdelivr.net/npm/tinycolor2/dist/tinycolor-min.js"></script>
```
[Optional] Add script for ua-parser-js
> **Note:** include script when use `getUserAgent` function
```alias
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js/dist/ua-parser.min.js"></script>
```
[Optional] Add script for xss
> **Note:** include script when use `clearXSS` function
```alias
<script src="https://rawgit.com/leizongmin/js-xss/master/dist/xss.js"></script>
```
[Optional] Add script for popper.js and tippy.js
> **Note:** include script when use `onTooltip` function
```alias
<script src="https://cdn.jsdelivr.net/npm/popper.js/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tippy.js/umd/index.all.js"></script>
```
[Optional] Add script for xlsx
> **Note:** include script when use `downloadExcelFileFromData` or `getDataFromExcelFileU8Arr` function
```alias
<script src="https://cdn.jsdelivr.net/npm/js-xlsx/dist/xlsx.full.min.js"></script>
```
Add script for wsemi
```alias
<script src="/dist/wsemi.umd.js"></script>
```
