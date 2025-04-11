/*!
 * wpf_pmSeries v1.7.81
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).wpf_pmSeries=e()}(this,(function(){"use strict";var t=/\s/;var e=/^\s+/;function r(r){return r?r.slice(0,function(e){for(var r=e.length;r--&&t.test(e.charAt(r)););return r}(r)+1).replace(e,""):r}function n(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var o="object"==typeof global&&global&&global.Object===Object&&global,c="object"==typeof self&&self&&self.Object===Object&&self,u=o||c||Function("return this")(),i=u.Symbol,f=Object.prototype,a=f.hasOwnProperty,l=f.toString,b=i?i.toStringTag:void 0;var p=Object.prototype.toString;var y="[object Null]",j="[object Undefined]",s=i?i.toStringTag:void 0;function v(t){return null==t?void 0===t?j:y:s&&s in Object(t)?function(t){var e=a.call(t,b),r=t[b];try{t[b]=void 0;var n=!0}catch(t){}var o=l.call(t);return n&&(e?t[b]=r:delete t[b]),o}(t):function(t){return p.call(t)}(t)}function d(t){return null!=t&&"object"==typeof t}var g="[object Symbol]";var h=NaN,O=/^[-+]0x[0-9a-f]+$/i,m=/^0b[01]+$/i,A=/^0o[0-7]+$/i,x=parseInt;function S(t){if("number"==typeof t)return t;if(function(t){return"symbol"==typeof t||d(t)&&v(t)==g}(t))return h;if(n(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=n(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=r(t);var o=m.test(t);return o||A.test(t)?x(t.slice(2),o?2:8):O.test(t)?h:+t}var F=1/0,T=17976931348623157e292;function w(t){var e=function(t){return t?(t=S(t))===F||t===-F?(t<0?-1:1)*T:t==t?t:0:0===t?t:0}(t),r=e%1;return e==e?r?e-r:e:0}function P(t,e,r){var n=null==t?0:t.length;return n?function(t,e,r){var n=-1,o=t.length;e<0&&(e=-e>o?0:o+e),(r=r>o?o:r)<0&&(r+=o),o=e>r?0:r-e>>>0,e>>>=0;for(var c=Array(o);++n<o;)c[n]=t[n+e];return c}(t,(e=r||void 0===e?1:w(e))<0?0:e,n):[]}function k(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t}var I,U=function(t,e,r){for(var n=-1,o=Object(t),c=r(t),u=c.length;u--;){var i=c[I?u:++n];if(!1===e(o[i],i,o))break}return t};function B(t){return d(t)&&"[object Arguments]"==v(t)}var N=Object.prototype,$=N.hasOwnProperty,E=N.propertyIsEnumerable,q=B(function(){return arguments}())?B:function(t){return d(t)&&$.call(t,"callee")&&!E.call(t,"callee")},D=q,M=Array.isArray;var C="object"==typeof exports&&exports&&!exports.nodeType&&exports,G=C&&"object"==typeof module&&module&&!module.nodeType&&module,L=G&&G.exports===C?u.Buffer:void 0,R=(L?L.isBuffer:void 0)||function(){return!1},V=9007199254740991,W=/^(?:0|[1-9]\d*)$/;function _(t,e){var r=typeof t;return!!(e=null==e?V:e)&&("number"==r||"symbol"!=r&&W.test(t))&&t>-1&&t%1==0&&t<e}var z=9007199254740991;function H(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=z}var J={};J["[object Float32Array]"]=J["[object Float64Array]"]=J["[object Int8Array]"]=J["[object Int16Array]"]=J["[object Int32Array]"]=J["[object Uint8Array]"]=J["[object Uint8ClampedArray]"]=J["[object Uint16Array]"]=J["[object Uint32Array]"]=!0,J["[object Arguments]"]=J["[object Array]"]=J["[object ArrayBuffer]"]=J["[object Boolean]"]=J["[object DataView]"]=J["[object Date]"]=J["[object Error]"]=J["[object Function]"]=J["[object Map]"]=J["[object Number]"]=J["[object Object]"]=J["[object RegExp]"]=J["[object Set]"]=J["[object String]"]=J["[object WeakMap]"]=!1;var K,Q="object"==typeof exports&&exports&&!exports.nodeType&&exports,X=Q&&"object"==typeof module&&module&&!module.nodeType&&module,Y=X&&X.exports===Q&&o.process,Z=function(){try{var t=X&&X.require&&X.require("util").types;return t||Y&&Y.binding&&Y.binding("util")}catch(t){}}(),tt=Z&&Z.isTypedArray,et=tt?(K=tt,function(t){return K(t)}):function(t){return d(t)&&H(t.length)&&!!J[v(t)]},rt=Object.prototype.hasOwnProperty;function nt(t,e){var r=M(t),n=!r&&D(t),o=!r&&!n&&R(t),c=!r&&!n&&!o&&et(t),u=r||n||o||c,i=u?function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n}(t.length,String):[],f=i.length;for(var a in t)!e&&!rt.call(t,a)||u&&("length"==a||o&&("offset"==a||"parent"==a)||c&&("buffer"==a||"byteLength"==a||"byteOffset"==a)||_(a,f))||i.push(a);return i}var ot=Object.prototype;var ct=function(t,e){return function(r){return t(e(r))}}(Object.keys,Object),ut=ct,it=Object.prototype.hasOwnProperty;function ft(t){if(r=(e=t)&&e.constructor,e!==("function"==typeof r&&r.prototype||ot))return ut(t);var e,r,n=[];for(var o in Object(t))it.call(t,o)&&"constructor"!=o&&n.push(o);return n}var at="[object AsyncFunction]",lt="[object Function]",bt="[object GeneratorFunction]",pt="[object Proxy]";function yt(t){return null!=t&&H(t.length)&&!function(t){if(!n(t))return!1;var e=v(t);return e==lt||e==bt||e==at||e==pt}(t)}function jt(t){return yt(t)?nt(t):ft(t)}var st=function(t,e){return function(r,n){if(null==r)return r;if(!yt(r))return t(r,n);for(var o=r.length,c=e?o:-1,u=Object(r);(e?c--:++c<o)&&!1!==n(u[c],c,u););return r}}((function(t,e){return t&&U(t,e,jt)})),vt=st;function dt(t){return t}function gt(t,e){var r;return(M(t)?k:vt)(t,"function"==typeof(r=e)?r:dt)}function ht(t){return"[object Object]"===Object.prototype.toString.call(t)}function Ot(t){let e=Object.prototype.toString.call(t);return"[object Function]"===e||"[object AsyncFunction]"===e}return function(t,e){let r=function(){let t,e,r=new Promise((function(){t=arguments[0],e=arguments[1]}));return r.resolve=t,r.reject=e,r}();if(n=t,"[object Array]"!==Object.prototype.toString.call(n)&&!ht(t))return r.reject("rs is not an array or object"),r;var n;let o=!1;if(ht(t)){o=!0;let e=[];gt(t,((t,r)=>{e.push({k:r,v:t})})),t=e}Ot(e)||(e=function(t){return t});let c=-1,u=[];return t.reduce((function(t,r){return t.then((function(t){u.push(t),c+=1;let n=c,i=r;return o&&(n=r.k,i=r.v),Ot(e)?e(i,n):i}))}),Promise.resolve()).then((function(t){u.push(t),u=P(u),r.resolve(u)})).catch((function(t){r.reject(t)})),r}}));
