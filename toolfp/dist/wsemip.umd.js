/*!
 * wsemip v1.7.63
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("fs"),require("path")):"function"==typeof define&&define.amd?define(["exports","fs","path"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).wsemip={},t.fs,t.path)}(this,(function(t,e,n){"use strict";function r(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var o={exports:{}};!function(t){var e=Object.prototype.hasOwnProperty,n="~";function r(){}function o(t,e,n){this.fn=t,this.context=e,this.once=n||!1}function u(t,e,r,u,i){if("function"!=typeof r)throw new TypeError("The listener must be a function");var c=new o(r,u||t,i),f=n?n+e:e;return t._events[f]?t._events[f].fn?t._events[f]=[t._events[f],c]:t._events[f].push(c):(t._events[f]=c,t._eventsCount++),t}function i(t,e){0==--t._eventsCount?t._events=new r:delete t._events[e]}function c(){this._events=new r,this._eventsCount=0}Object.create&&(r.prototype=Object.create(null),(new r).__proto__||(n=!1)),c.prototype.eventNames=function(){var t,r,o=[];if(0===this._eventsCount)return o;for(r in t=this._events)e.call(t,r)&&o.push(n?r.slice(1):r);return Object.getOwnPropertySymbols?o.concat(Object.getOwnPropertySymbols(t)):o},c.prototype.listeners=function(t){var e=n?n+t:t,r=this._events[e];if(!r)return[];if(r.fn)return[r.fn];for(var o=0,u=r.length,i=new Array(u);o<u;o++)i[o]=r[o].fn;return i},c.prototype.listenerCount=function(t){var e=n?n+t:t,r=this._events[e];return r?r.fn?1:r.length:0},c.prototype.emit=function(t,e,r,o,u,i){var c=n?n+t:t;if(!this._events[c])return!1;var f,a,l=this._events[c],s=arguments.length;if(l.fn){switch(l.once&&this.removeListener(t,l.fn,void 0,!0),s){case 1:return l.fn.call(l.context),!0;case 2:return l.fn.call(l.context,e),!0;case 3:return l.fn.call(l.context,e,r),!0;case 4:return l.fn.call(l.context,e,r,o),!0;case 5:return l.fn.call(l.context,e,r,o,u),!0;case 6:return l.fn.call(l.context,e,r,o,u,i),!0}for(a=1,f=new Array(s-1);a<s;a++)f[a-1]=arguments[a];l.fn.apply(l.context,f)}else{var p,h=l.length;for(a=0;a<h;a++)switch(l[a].once&&this.removeListener(t,l[a].fn,void 0,!0),s){case 1:l[a].fn.call(l[a].context);break;case 2:l[a].fn.call(l[a].context,e);break;case 3:l[a].fn.call(l[a].context,e,r);break;case 4:l[a].fn.call(l[a].context,e,r,o);break;default:if(!f)for(p=1,f=new Array(s-1);p<s;p++)f[p-1]=arguments[p];l[a].fn.apply(l[a].context,f)}}return!0},c.prototype.on=function(t,e,n){return u(this,t,e,n,!1)},c.prototype.once=function(t,e,n){return u(this,t,e,n,!0)},c.prototype.removeListener=function(t,e,r,o){var u=n?n+t:t;if(!this._events[u])return this;if(!e)return i(this,u),this;var c=this._events[u];if(c.fn)c.fn!==e||o&&!c.once||r&&c.context!==r||i(this,u);else{for(var f=0,a=[],l=c.length;f<l;f++)(c[f].fn!==e||o&&!c[f].once||r&&c[f].context!==r)&&a.push(c[f]);a.length?this._events[u]=1===a.length?a[0]:a:i(this,u)}return this},c.prototype.removeAllListeners=function(t){var e;return t?(e=n?n+t:t,this._events[e]&&i(this,e)):(this._events=new r,this._eventsCount=0),this},c.prototype.off=c.prototype.removeListener,c.prototype.addListener=c.prototype.on,c.prefixed=n,c.EventEmitter=c,t.exports=c}(o);var u=r(o.exports);function i(){return new u}function c(t){return!!e.existsSync(t)&&(!e.lstatSync(t).isFile()&&!e.lstatSync(t).isSymbolicLink())}function f(t){if(!e.existsSync(t))return{success:"folder does not exist: "+t};if(!c(t))return{error:"input path is not a folder: "+t};try{e.readdirSync(t).forEach((function(n){let r=t+"/"+n;if(e.lstatSync(r).isDirectory())f(r);else try{e.unlinkSync(r)}catch(t){}}))}catch(t){return{error:t}}try{e.rmdirSync(t)}catch(t){return{error:t}}return{success:"done: "+t}}function a(t){if(c(t))return{success:"input folder is already exists: "+t};if(e.existsSync(t))return{error:"input path already exists: "+t};try{e.mkdirSync(t,{recursive:!0})}catch(t){return{error:t}}return{success:"done: "+t}}function l(t,e){for(var n=-1,r=null==t?0:t.length,o=0,u=[];++n<r;){var i=t[n];e(i,n,t)&&(u[o++]=i)}return u}var s,p=function(t,e,n){for(var r=-1,o=Object(t),u=n(t),i=u.length;i--;){var c=u[s?i:++r];if(!1===e(o[c],c,o))break}return t};var h="object"==typeof global&&global&&global.Object===Object&&global,v="object"==typeof self&&self&&self.Object===Object&&self,d=h||v||Function("return this")(),y=d.Symbol,b=Object.prototype,g=b.hasOwnProperty,j=b.toString,_=y?y.toStringTag:void 0;var m=Object.prototype.toString;var w="[object Null]",O="[object Undefined]",S=y?y.toStringTag:void 0;function x(t){return null==t?void 0===t?O:w:S&&S in Object(t)?function(t){var e=g.call(t,_),n=t[_];try{t[_]=void 0;var r=!0}catch(t){}var o=j.call(t);return r&&(e?t[_]=n:delete t[_]),o}(t):function(t){return m.call(t)}(t)}function A(t){return null!=t&&"object"==typeof t}function F(t){return A(t)&&"[object Arguments]"==x(t)}var k=Object.prototype,E=k.hasOwnProperty,P=k.propertyIsEnumerable,z=F(function(){return arguments}())?F:function(t){return A(t)&&E.call(t,"callee")&&!P.call(t,"callee")},I=z,R=Array.isArray;var T="object"==typeof t&&t&&!t.nodeType&&t,C=T&&"object"==typeof module&&module&&!module.nodeType&&module,N=C&&C.exports===T?d.Buffer:void 0,$=(N?N.isBuffer:void 0)||function(){return!1},L=9007199254740991,D=/^(?:0|[1-9]\d*)$/;function M(t,e){var n=typeof t;return!!(e=null==e?L:e)&&("number"==n||"symbol"!=n&&D.test(t))&&t>-1&&t%1==0&&t<e}var B=9007199254740991;function U(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=B}var q={};function G(t){return function(e){return t(e)}}q["[object Float32Array]"]=q["[object Float64Array]"]=q["[object Int8Array]"]=q["[object Int16Array]"]=q["[object Int32Array]"]=q["[object Uint8Array]"]=q["[object Uint8ClampedArray]"]=q["[object Uint16Array]"]=q["[object Uint32Array]"]=!0,q["[object Arguments]"]=q["[object Array]"]=q["[object ArrayBuffer]"]=q["[object Boolean]"]=q["[object DataView]"]=q["[object Date]"]=q["[object Error]"]=q["[object Function]"]=q["[object Map]"]=q["[object Number]"]=q["[object Object]"]=q["[object RegExp]"]=q["[object Set]"]=q["[object String]"]=q["[object WeakMap]"]=!1;var V="object"==typeof t&&t&&!t.nodeType&&t,W=V&&"object"==typeof module&&module&&!module.nodeType&&module,J=W&&W.exports===V&&h.process,H=function(){try{var t=W&&W.require&&W.require("util").types;return t||J&&J.binding&&J.binding("util")}catch(t){}}(),Q=H&&H.isTypedArray,K=Q?G(Q):function(t){return A(t)&&U(t.length)&&!!q[x(t)]},X=Object.prototype.hasOwnProperty;function Y(t,e){var n=R(t),r=!n&&I(t),o=!n&&!r&&$(t),u=!n&&!r&&!o&&K(t),i=n||r||o||u,c=i?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],f=c.length;for(var a in t)!e&&!X.call(t,a)||i&&("length"==a||o&&("offset"==a||"parent"==a)||u&&("buffer"==a||"byteLength"==a||"byteOffset"==a)||M(a,f))||c.push(a);return c}var Z=Object.prototype;var tt,et,nt=(tt=Object.keys,et=Object,function(t){return tt(et(t))}),rt=Object.prototype.hasOwnProperty;function ot(t){if(n=(e=t)&&e.constructor,e!==("function"==typeof n&&n.prototype||Z))return nt(t);var e,n,r=[];for(var o in Object(t))rt.call(t,o)&&"constructor"!=o&&r.push(o);return r}function ut(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var it="[object AsyncFunction]",ct="[object Function]",ft="[object GeneratorFunction]",at="[object Proxy]";function lt(t){if(!ut(t))return!1;var e=x(t);return e==ct||e==ft||e==it||e==at}function st(t){return null!=t&&U(t.length)&&!lt(t)}function pt(t){return st(t)?Y(t):ot(t)}var ht=function(t,e){return function(n,r){if(null==n)return n;if(!st(n))return t(n,r);for(var o=n.length,u=e?o:-1,i=Object(n);(e?u--:++u<o)&&!1!==r(i[u],u,i););return n}}((function(t,e){return t&&p(t,e,pt)})),vt=ht;function dt(t,e){var n=[];return vt(t,(function(t,r,o){e(t,r,o)&&n.push(t)})),n}function yt(t,e){return t===e||t!=t&&e!=e}function bt(t,e){for(var n=t.length;n--;)if(yt(t[n][0],e))return n;return-1}var gt=Array.prototype.splice;function jt(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}jt.prototype.clear=function(){this.__data__=[],this.size=0},jt.prototype.delete=function(t){var e=this.__data__,n=bt(e,t);return!(n<0)&&(n==e.length-1?e.pop():gt.call(e,n,1),--this.size,!0)},jt.prototype.get=function(t){var e=this.__data__,n=bt(e,t);return n<0?void 0:e[n][1]},jt.prototype.has=function(t){return bt(this.__data__,t)>-1},jt.prototype.set=function(t,e){var n=this.__data__,r=bt(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this};var _t,mt=d["__core-js_shared__"],wt=(_t=/[^.]+$/.exec(mt&&mt.keys&&mt.keys.IE_PROTO||""))?"Symbol(src)_1."+_t:"";var Ot=Function.prototype.toString;function St(t){if(null!=t){try{return Ot.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var xt=/^\[object .+?Constructor\]$/,At=Function.prototype,Ft=Object.prototype,kt=At.toString,Et=Ft.hasOwnProperty,Pt=RegExp("^"+kt.call(Et).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function zt(t){return!(!ut(t)||function(t){return!!wt&&wt in t}(t))&&(lt(t)?Pt:xt).test(St(t))}function It(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return zt(n)?n:void 0}var Rt=It(d,"Map"),Tt=It(Object,"create");var Ct=Object.prototype.hasOwnProperty;var Nt=Object.prototype.hasOwnProperty;function $t(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function Lt(t,e){var n,r,o=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?o["string"==typeof e?"string":"hash"]:o.map}function Dt(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}$t.prototype.clear=function(){this.__data__=Tt?Tt(null):{},this.size=0},$t.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},$t.prototype.get=function(t){var e=this.__data__;if(Tt){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return Ct.call(e,t)?e[t]:void 0},$t.prototype.has=function(t){var e=this.__data__;return Tt?void 0!==e[t]:Nt.call(e,t)},$t.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=Tt&&void 0===e?"__lodash_hash_undefined__":e,this},Dt.prototype.clear=function(){this.size=0,this.__data__={hash:new $t,map:new(Rt||jt),string:new $t}},Dt.prototype.delete=function(t){var e=Lt(this,t).delete(t);return this.size-=e?1:0,e},Dt.prototype.get=function(t){return Lt(this,t).get(t)},Dt.prototype.has=function(t){return Lt(this,t).has(t)},Dt.prototype.set=function(t,e){var n=Lt(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this};function Mt(t){var e=this.__data__=new jt(t);this.size=e.size}Mt.prototype.clear=function(){this.__data__=new jt,this.size=0},Mt.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},Mt.prototype.get=function(t){return this.__data__.get(t)},Mt.prototype.has=function(t){return this.__data__.has(t)},Mt.prototype.set=function(t,e){var n=this.__data__;if(n instanceof jt){var r=n.__data__;if(!Rt||r.length<199)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new Dt(r)}return n.set(t,e),this.size=n.size,this};function Bt(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new Dt;++e<n;)this.add(t[e])}function Ut(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}Bt.prototype.add=Bt.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},Bt.prototype.has=function(t){return this.__data__.has(t)};var qt=1,Gt=2;function Vt(t,e,n,r,o,u){var i=n&qt,c=t.length,f=e.length;if(c!=f&&!(i&&f>c))return!1;var a=u.get(t),l=u.get(e);if(a&&l)return a==e&&l==t;var s=-1,p=!0,h=n&Gt?new Bt:void 0;for(u.set(t,e),u.set(e,t);++s<c;){var v=t[s],d=e[s];if(r)var y=i?r(d,v,s,e,t,u):r(v,d,s,t,e,u);if(void 0!==y){if(y)continue;p=!1;break}if(h){if(!Ut(e,(function(t,e){if(i=e,!h.has(i)&&(v===t||o(v,t,n,r,u)))return h.push(e);var i}))){p=!1;break}}else if(v!==d&&!o(v,d,n,r,u)){p=!1;break}}return u.delete(t),u.delete(e),p}var Wt=d.Uint8Array;function Jt(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n}function Ht(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n}var Qt=1,Kt=2,Xt="[object Boolean]",Yt="[object Date]",Zt="[object Error]",te="[object Map]",ee="[object Number]",ne="[object RegExp]",re="[object Set]",oe="[object String]",ue="[object Symbol]",ie="[object ArrayBuffer]",ce="[object DataView]",fe=y?y.prototype:void 0,ae=fe?fe.valueOf:void 0;var le=Object.prototype.propertyIsEnumerable,se=Object.getOwnPropertySymbols,pe=se?function(t){return null==t?[]:(t=Object(t),l(se(t),(function(e){return le.call(t,e)})))}:function(){return[]};function he(t){return function(t,e,n){var r=e(t);return R(t)?r:function(t,e){for(var n=-1,r=e.length,o=t.length;++n<r;)t[o+n]=e[n];return t}(r,n(t))}(t,pt,pe)}var ve=1,de=Object.prototype.hasOwnProperty;var ye=It(d,"DataView"),be=It(d,"Promise"),ge=It(d,"Set"),je=It(d,"WeakMap"),_e="[object Map]",me="[object Promise]",we="[object Set]",Oe="[object WeakMap]",Se="[object DataView]",xe=St(ye),Ae=St(Rt),Fe=St(be),ke=St(ge),Ee=St(je),Pe=x;(ye&&Pe(new ye(new ArrayBuffer(1)))!=Se||Rt&&Pe(new Rt)!=_e||be&&Pe(be.resolve())!=me||ge&&Pe(new ge)!=we||je&&Pe(new je)!=Oe)&&(Pe=function(t){var e=x(t),n="[object Object]"==e?t.constructor:void 0,r=n?St(n):"";if(r)switch(r){case xe:return Se;case Ae:return _e;case Fe:return me;case ke:return we;case Ee:return Oe}return e});var ze=Pe,Ie=1,Re="[object Arguments]",Te="[object Array]",Ce="[object Object]",Ne=Object.prototype.hasOwnProperty;function $e(t,e,n,r,o,u){var i=R(t),c=R(e),f=i?Te:ze(t),a=c?Te:ze(e),l=(f=f==Re?Ce:f)==Ce,s=(a=a==Re?Ce:a)==Ce,p=f==a;if(p&&$(t)){if(!$(e))return!1;i=!0,l=!1}if(p&&!l)return u||(u=new Mt),i||K(t)?Vt(t,e,n,r,o,u):function(t,e,n,r,o,u,i){switch(n){case ce:if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case ie:return!(t.byteLength!=e.byteLength||!u(new Wt(t),new Wt(e)));case Xt:case Yt:case ee:return yt(+t,+e);case Zt:return t.name==e.name&&t.message==e.message;case ne:case oe:return t==e+"";case te:var c=Jt;case re:var f=r&Qt;if(c||(c=Ht),t.size!=e.size&&!f)return!1;var a=i.get(t);if(a)return a==e;r|=Kt,i.set(t,e);var l=Vt(c(t),c(e),r,o,u,i);return i.delete(t),l;case ue:if(ae)return ae.call(t)==ae.call(e)}return!1}(t,e,f,n,r,o,u);if(!(n&Ie)){var h=l&&Ne.call(t,"__wrapped__"),v=s&&Ne.call(e,"__wrapped__");if(h||v){var d=h?t.value():t,y=v?e.value():e;return u||(u=new Mt),o(d,y,n,r,u)}}return!!p&&(u||(u=new Mt),function(t,e,n,r,o,u){var i=n&ve,c=he(t),f=c.length;if(f!=he(e).length&&!i)return!1;for(var a=f;a--;){var l=c[a];if(!(i?l in e:de.call(e,l)))return!1}var s=u.get(t),p=u.get(e);if(s&&p)return s==e&&p==t;var h=!0;u.set(t,e),u.set(e,t);for(var v=i;++a<f;){var d=t[l=c[a]],y=e[l];if(r)var b=i?r(y,d,l,e,t,u):r(d,y,l,t,e,u);if(!(void 0===b?d===y||o(d,y,n,r,u):b)){h=!1;break}v||(v="constructor"==l)}if(h&&!v){var g=t.constructor,j=e.constructor;g==j||!("constructor"in t)||!("constructor"in e)||"function"==typeof g&&g instanceof g&&"function"==typeof j&&j instanceof j||(h=!1)}return u.delete(t),u.delete(e),h}(t,e,n,r,o,u))}function Le(t,e,n,r,o){return t===e||(null==t||null==e||!A(t)&&!A(e)?t!=t&&e!=e:$e(t,e,n,r,Le,o))}var De=1,Me=2;function Be(t){return t==t&&!ut(t)}function Ue(t,e){return function(n){return null!=n&&(n[t]===e&&(void 0!==e||t in Object(n)))}}function qe(t){var e=function(t){for(var e=pt(t),n=e.length;n--;){var r=e[n],o=t[r];e[n]=[r,o,Be(o)]}return e}(t);return 1==e.length&&e[0][2]?Ue(e[0][0],e[0][1]):function(n){return n===t||function(t,e,n,r){var o=n.length,u=o,i=!r;if(null==t)return!u;for(t=Object(t);o--;){var c=n[o];if(i&&c[2]?c[1]!==t[c[0]]:!(c[0]in t))return!1}for(;++o<u;){var f=(c=n[o])[0],a=t[f],l=c[1];if(i&&c[2]){if(void 0===a&&!(f in t))return!1}else{var s=new Mt;if(r)var p=r(a,l,f,t,e,s);if(!(void 0===p?Le(l,a,De|Me,r,s):p))return!1}}return!0}(n,t,e)}}var Ge="[object Symbol]";function Ve(t){return"symbol"==typeof t||A(t)&&x(t)==Ge}var We=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Je=/^\w*$/;function He(t,e){if(R(t))return!1;var n=typeof t;return!("number"!=n&&"symbol"!=n&&"boolean"!=n&&null!=t&&!Ve(t))||(Je.test(t)||!We.test(t)||null!=e&&t in Object(e))}var Qe="Expected a function";function Ke(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError(Qe);var n=function(){var r=arguments,o=e?e.apply(this,r):r[0],u=n.cache;if(u.has(o))return u.get(o);var i=t.apply(this,r);return n.cache=u.set(o,i)||u,i};return n.cache=new(Ke.Cache||Dt),n}Ke.Cache=Dt;var Xe=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Ye=/\\(\\)?/g,Ze=function(t){var e=Ke(t,(function(t){return 500===n.size&&n.clear(),t})),n=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Xe,(function(t,n,r,o){e.push(r?o.replace(Ye,"$1"):n||t)})),e})),tn=Ze;function en(t,e){for(var n=-1,r=null==t?0:t.length,o=Array(r);++n<r;)o[n]=e(t[n],n,t);return o}var nn=1/0,rn=y?y.prototype:void 0,on=rn?rn.toString:void 0;function un(t){if("string"==typeof t)return t;if(R(t))return en(t,un)+"";if(Ve(t))return on?on.call(t):"";var e=t+"";return"0"==e&&1/t==-nn?"-0":e}function cn(t){return null==t?"":un(t)}function fn(t,e){return R(t)?t:He(t,e)?[t]:tn(cn(t))}var an=1/0;function ln(t){if("string"==typeof t||Ve(t))return t;var e=t+"";return"0"==e&&1/t==-an?"-0":e}function sn(t,e){for(var n=0,r=(e=fn(e,t)).length;null!=t&&n<r;)t=t[ln(e[n++])];return n&&n==r?t:void 0}function pn(t,e,n){var r=null==t?void 0:sn(t,e);return void 0===r?n:r}function hn(t,e){return null!=t&&e in Object(t)}function vn(t,e){return null!=t&&function(t,e,n){for(var r=-1,o=(e=fn(e,t)).length,u=!1;++r<o;){var i=ln(e[r]);if(!(u=null!=t&&n(t,i)))break;t=t[i]}return u||++r!=o?u:!!(o=null==t?0:t.length)&&U(o)&&M(i,o)&&(R(t)||I(t))}(t,e,hn)}var dn=1,yn=2;function bn(t){return t}function gn(t){return function(e){return null==e?void 0:e[t]}}function jn(t){return He(t)?gn(ln(t)):function(t){return function(e){return sn(e,t)}}(t)}function _n(t){return"function"==typeof t?t:null==t?bn:"object"==typeof t?R(t)?function(t,e){return He(t)&&Be(e)?Ue(ln(t),e):function(n){var r=pn(n,t);return void 0===r&&r===e?vn(n,t):Le(e,r,dn|yn)}}(t[0],t[1]):qe(t):jn(t)}function mn(t,e){return(R(t)?l:dt)(t,_n(e))}function wn(t,e){var n=-1,r=st(t)?Array(t.length):[];return vt(t,(function(t,o,u){r[++n]=e(t,o,u)})),r}function On(t,e){return(R(t)?en:wn)(t,_n(e))}function Sn(t,e){for(var n=-1,r=null==t?0:t.length;++n<r&&!1!==e(t[n],n,t););return t}function xn(t,e){var n;return(R(t)?Sn:vt)(t,"function"==typeof(n=e)?n:bn)}function An(t){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,o=1;if(!c(t))throw new Error(`fd[${t}] is not a folder`);return function t(u){let i=[];return c(u)?(xn(e.readdirSync(u),(function(c){let f=n.resolve(u,c),a=null;try{a=e.statSync(f)}catch(t){}a&&a.isDirectory()?(i.push({isFolder:!0,level:o,path:f,name:n.basename(f)}),o+=1,(o<=r||null===r)&&(i=i.concat(t(f))),o-=1):i.push({isFolder:!1,level:o,path:f,name:n.basename(f)})})),i):i}(t)}var Fn=/\s/;var kn=/^\s+/;function En(t){return t?t.slice(0,function(t){for(var e=t.length;e--&&Fn.test(t.charAt(e)););return e}(t)+1).replace(kn,""):t}var Pn=NaN,zn=/^[-+]0x[0-9a-f]+$/i,In=/^0b[01]+$/i,Rn=/^0o[0-7]+$/i,Tn=parseInt;function Cn(t){if("number"==typeof t)return t;if(Ve(t))return Pn;if(ut(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=ut(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=En(t);var n=In.test(t);return n||Rn.test(t)?Tn(t.slice(2),n?2:8):zn.test(t)?Pn:+t}var Nn=1/0,$n=17976931348623157e292;function Ln(t){return t?(t=Cn(t))===Nn||t===-Nn?(t<0?-1:1)*$n:t==t?t:0:0===t?t:0}function Dn(t){var e=Ln(t),n=e%1;return e==e?n?e-n:e:0}function Mn(t){return"[object String]"===Object.prototype.toString.call(t)}function Bn(t){return!(!Mn(t)||""===t)}function Un(t){return"[object Number]"===Object.prototype.toString.call(t)}function qn(t){return t!=t}function Gn(t){let e=!1;if(Bn(t))e=!isNaN(Number(t));else if(Un(t)){if(qn(t))return!1;e=!0}return e}function Vn(t){if(!Gn(t))return 0;return Ln(t)}function Wn(t){return!!Gn(t)&&(t=Vn(t),"number"==typeof(e=t)&&e==Dn(e));var e}var Jn=d.isFinite,Hn=Math.min;var Qn=function(t){var e=Math[t];return function(t,n){if(t=Cn(t),(n=null==n?0:Hn(Dn(n),292))&&Jn(t)){var r=(cn(t)+"e").split("e");return+((r=(cn(e(r[0]+"e"+(+r[1]+n)))+"e").split("e"))[0]+"e"+(+r[1]-n))}return e(t)}}("round"),Kn=Qn;function Xn(t){if(!Gn(t))return 0;t=Vn(t);let e=Kn(t);return"0"===String(e)?0:e}function Yn(t){if(!Wn(t))return!1;return Xn(t)>0}let Zn="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),tr=Zn.length;function er(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,e=[];t=Yn(t)?Xn(t):32;for(let n=0;n<t;n++)e[n]=Zn[0|Math.random()*tr];return e.join("")}function nr(){let t,e,n=new Promise((function(){t=arguments[0],e=arguments[1]}));return n.resolve=t,n.reject=e,n}function rr(t){if(!Wn(t))return!1;return Xn(t)>=0}function or(t,e){if(!Bn(t))return"";if(!rr(e))return"";if(0===(e=Xn(e)))return"";let n=t.length-e;return n<0&&(n=0),t.substring(n,n+e)}function ur(t,e){return Bn(t)&&rr(e)?0===(e=Xn(e))?"":t.substring(0,e):""}function ir(t,e){return Bn(t)&&rr(e)?0===(e=Xn(e))?t:ur(t,t.length-e):""}function cr(t){if(!Bn(t))return{path:"",isRoot:!1};for(;t.indexOf("\\\\")>=0;)t=t.replace("\\\\","\\");for(;t.indexOf("//")>=0;)t=t.replace("//","/");if(":"===or(t,1))return{path:`${t}\\`,isRoot:!0};if("\\"===or(t,1)){let e=ir(t,1);return":"===or(e,1)?{path:t,isRoot:!0}:{path:e,isRoot:!1}}if("/"===or(t,1)){let e=ir(t,1);return 0===e.length?{path:t,isRoot:!0}:{path:e,isRoot:!1}}return{path:t,isRoot:!1}}function fr(t){if(!Bn(t))return"";let e=cr(t);if(e.isRoot)return e.path;let n=e.path;try{n=n.split("\\").pop().split("/").pop()}catch(t){}return n}var ar=Array.prototype.join;function lr(t,e,n){var r=-1,o=t.length;e<0&&(e=-e>o?0:o+e),(n=n>o?o:n)<0&&(n+=o),o=e>n?0:n-e>>>0,e>>>=0;for(var u=Array(o);++r<o;)u[r]=t[r+e];return u}function sr(t,e,n){var r=t.length;return n=void 0===n?r:n,!e&&n>=r?t:lr(t,e,n)}var pr=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");function hr(t){return pr.test(t)}var vr=H&&H.isRegExp,dr=vr?G(vr):function(t){return A(t)&&"[object RegExp]"==x(t)};var yr="\\ud800-\\udfff",br="["+yr+"]",gr="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",jr="\\ud83c[\\udffb-\\udfff]",_r="[^"+yr+"]",mr="(?:\\ud83c[\\udde6-\\uddff]){2}",wr="[\\ud800-\\udbff][\\udc00-\\udfff]",Or="(?:"+gr+"|"+jr+")"+"?",Sr="[\\ufe0e\\ufe0f]?",xr=Sr+Or+("(?:\\u200d(?:"+[_r,mr,wr].join("|")+")"+Sr+Or+")*"),Ar="(?:"+[_r+gr+"?",gr,mr,wr,br].join("|")+")",Fr=RegExp(jr+"(?="+jr+")|"+Ar+xr,"g");function kr(t){return hr(t)?function(t){return t.match(Fr)||[]}(t):function(t){return t.split("")}(t)}var Er=4294967295;function Pr(t,e,n){return n&&"number"!=typeof n&&function(t,e,n){if(!ut(n))return!1;var r=typeof e;return!!("number"==r?st(n)&&M(e,n.length):"string"==r&&e in n)&&yt(n[e],t)}(t,e,n)&&(e=n=void 0),(n=void 0===n?Er:n>>>0)?(t=cn(t))&&("string"==typeof e||null!=e&&!dr(e))&&!(e=un(e))&&hr(t)?sr(kr(t),0,n):t.split(e,n):[]}var zr="[object String]";var Ir=gn("length"),Rr="\\ud800-\\udfff",Tr="["+Rr+"]",Cr="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",Nr="\\ud83c[\\udffb-\\udfff]",$r="[^"+Rr+"]",Lr="(?:\\ud83c[\\udde6-\\uddff]){2}",Dr="[\\ud800-\\udbff][\\udc00-\\udfff]",Mr="(?:"+Cr+"|"+Nr+")"+"?",Br="[\\ufe0e\\ufe0f]?",Ur=Br+Mr+("(?:\\u200d(?:"+[$r,Lr,Dr].join("|")+")"+Br+Mr+")*"),qr="(?:"+[$r+Cr+"?",Cr,Lr,Dr,Tr].join("|")+")",Gr=RegExp(Nr+"(?="+Nr+")|"+qr+Ur,"g");function Vr(t){return hr(t)?function(t){for(var e=Gr.lastIndex=0;Gr.test(t);)++e;return e}(t):Ir(t)}var Wr="[object Map]",Jr="[object Set]";function Hr(t){if(null==t)return 0;if(st(t))return"string"==typeof(e=t)||!R(e)&&A(e)&&x(e)==zr?Vr(t):t.length;var e,n=ze(t);return n==Wr||n==Jr?t.size:ot(t).length}function Qr(t){return"[object Array]"===Object.prototype.toString.call(t)}function Kr(t){return!!Qr(t)&&0===t.length}var Xr="[object Boolean]";function Yr(t){return!0===t||!1===t||A(t)&&x(t)==Xr}function Zr(t){return"[object Undefined]"===Object.prototype.toString.call(t)}function to(t){return"[object Null]"===Object.prototype.toString.call(t)}function eo(t){return"[object Object]"===Object.prototype.toString.call(t)}function no(t){if(eo(t)){for(let e in t)return!1;return!0}return!1}function ro(t){return!(!Mn(t)||""!==t)}function oo(t){return!!Zr(t)||(!!to(t)||(!!no(t)||(!!ro(t)||(!!Kr(t)||!!qn(t)))))}function uo(t){let e=Object.prototype.toString.call(t);return"[object Function]"===e||"[object AsyncFunction]"===e}function io(t){if(!Wn(t))return!1;return Xn(t)<0}function co(t){let e,n=Object.prototype.toString.call(t);if(e="[object Promise]"===n,e)return!0;if("[object Function]"!==n)return!1;try{e="function"!=typeof t.subscribe&&"function"==typeof t.then}catch(t){}return e}let fo=function(t){if(!uo(t))throw new Error("fn is not a function");return function(){let e=nr(),n=null,r=null;try{n=t.apply(this,arguments)}catch(t){r=t}return null!==r?e.resolve({state:"error",msg:r}):co(n)?n.then((t=>{e.resolve({state:"success",msg:t})})).catch((t=>{"cancelled"===pn(t,"reason")?e.resolve({state:"cancelled",msg:""}):e.resolve({state:"error",msg:t})})):e.resolve({state:"success",msg:n}),e}};function ao(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:()=>{};if(!uo(t))return null;function n(t,e){let n;return to(t)||Zr(t)?e:(n=pn(t,"data",null),n||t)}return uo(e)||(e=()=>{}),function(){let r,o=nr(),u=e({mode:"before",data:arguments});return(to(u)||Zr(u))&&(u=arguments),t(...u).then((t=>{r=e({mode:"afterThen",data:t}),t=n(r,t),o.resolve(t)})).catch((t=>{r=e({mode:"afterCatch",data:t}),t=n(r,t),o.reject(t)})),o}}function lo(t){return null==t?[]:function(t,e){return en(e,(function(e){return t[e]}))}(t,pt(t))}function so(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=0,n=[];io(t)&&(t=0),t=Xn(t);let r=i();return r.get=function(){if(n.length>0){return e+=1,n.splice(0,1)[0]}return null},r.cb=function(){e-=1,e<0&&(e=0),n.length>0&&r.emit("message",n)},r.push=function(o){n.push(o),(t<=0||e<t)&&r.emit("message",n)},r.clear=function(){e=0,n=[]},r}function po(t){return t!=t}function ho(t,e,n){return e==e?function(t,e,n){for(var r=n-1,o=t.length;++r<o;)if(t[r]===e)return r;return-1}(t,e,n):function(t,e,n,r){for(var o=t.length,u=n+(r?1:-1);r?u--:++u<o;)if(e(t[u],u,t))return u;return-1}(t,po,n)}function vo(t,e,n){if((t=cn(t))&&(n||void 0===e))return En(t);if(!t||!(e=un(e)))return t;var r=kr(t),o=kr(e),u=function(t,e){for(var n=-1,r=t.length;++n<r&&ho(e,t[n],0)>-1;);return n}(r,o),i=function(t,e){for(var n=t.length;n--&&ho(e,t[n],0)>-1;);return n}(r,o)+1;return sr(r,u,i).join("")}t.evem=i,t.fsCleanFolder=function(t){if(!e.existsSync(t)){let e=a(t);return e.error?e.error:{success:"done: "+t}}if(!c(t))return{error:"input path is not a folder"};try{e.readdirSync(t).forEach((function(n){let r=t+"/"+n;if(e.lstatSync(r).isDirectory())f(r);else try{e.unlinkSync(r)}catch(t){}}))}catch(t){return{error:t}}return{success:"done: "+t}},t.fsCopyFolder=function t(r,o){try{e.readdirSync(r).forEach((function(u){let i=r+"/"+u,c=o+"/"+u,f=e.lstatSync(i);if(f.isDirectory())a(n.dirname(c)),t(i,c);else if(f.isSymbolicLink()){let t=e.readlinkSync(i);e.symlinkSync(t,c)}else a(n.dirname(c)),e.copyFileSync(i,c)}))}catch(t){return{error:t}}return{success:"done: "+o}},t.fsCreateFolder=a,t.fsDeleteFolder=f,t.fsGetFilesInFolder=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;if(!c(t))throw new Error(`fd[${t}] is not a folder`);let n=[];return n=An(t,e),n=mn(n,{isFolder:!1}),n=On(n,(t=>(delete t.isFolder,t))),n},t.fsGetFoldersInFolder=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;if(!c(t))throw new Error(`fd[${t}] is not a folder`);let n=[];return n=An(t,e),n=mn(n,{isFolder:!0}),n=On(n,(t=>(delete t.isFolder,t))),n},t.fsIsFile=function(t){return!!e.existsSync(t)&&(!e.lstatSync(t).isDirectory()&&!e.lstatSync(t).isSymbolicLink())},t.fsIsFolder=c,t.fsReadText=function(t){return e.readFileSync(t,"utf8")},t.fsTreeFolder=An,t.fsWriteText=function(t,n){e.writeFileSync(t,n,"utf8")},t.genID=er,t.genPm=nr,t.getClearPathName=cr,t.getFileName=fr,t.getFileTrueName=function(t){if(!Bn(t))return"";let e=fr(t),n=Pr(e,".");if(Hr(n)<=1)return e;let r="";try{n=(c=null==(o=n)?0:o.length)?lr(o,0,(u=c-(u=i||void 0===u?1:Dn(u)))<0?0:u):[],r=function(t,e){return null==t?"":ar.call(t,e)}(n,".")}catch(t){}var o,u,i,c;return r},t.getGlobal=function(){return"undefined"!=typeof self?self:"undefined"!=typeof window&&void 0!==window.document?window:"undefined"!=typeof global?global:null},t.getPathParent=function(t){if(!Bn(t))return"";let e=cr(t);if(e.isRoot)return e.path;let n=fr(t=e.path);if(!Bn(n))return t;let r=cr(t=ir(t,n.length));return r.isRoot,r.path},t.isEmail=function(t){return!!Bn(t)&&/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(t)},t.isIE=function(){return null!==navigator.userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)},t.isab=function(t){return"[object ArrayBuffer]"===Object.prototype.toString.call(t)},t.isarr=Qr,t.isarr0=Kr,t.isblob=function(t){return"[object Blob]"===Object.prototype.toString.call(t)},t.isbol=function(t){return Yr(t)},t.isearr=function(t){return!!Qr(t)&&(0!==t.length&&(1!==t.length||!oo(t[0])))},t.iseobj=function(t){if(eo(t)){for(let e in t)return!0;return!1}return!1},t.iser=oo,t.isernot=function(t){return!oo(t)},t.isestr=Bn,t.isfun=uo,t.isint=Wn,t.isn0int=function(t){return!!Wn(t)&&Xn(t)<=0},t.isn0num=function(t){return!!Gn(t)&&Vn(t)<=0},t.isnbr=Un,t.isnint=io,t.isnull=to,t.isnum=Gn,t.isobj=eo,t.isobj0=no,t.isp0int=rr,t.isp0num=function(t){return!!Gn(t)&&Vn(t)>=0},t.ispint=Yn,t.ispm=co,t.isstr=Mn,t.isstr0=ro,t.isundefined=Zr,t.j2o=function(t){if(!Bn(t))return{};let e={};try{e=JSON.parse(t)}catch(t){e={}}return e},t.o2j=function(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(Zr(t))return"";let n="";try{n=e?JSON.stringify(t,null,2):JSON.stringify(t)}catch(t){n=""}return n},t.pm2resolve=fo,t.pmChain=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!Qr(t)){let t=nr();return t.reject("pms is not an array"),t}return t.reduce(((t,e)=>t.then(e)),Promise.resolve(e))},t.pmHook=ao,t.pmHookReject=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:()=>{};return uo(t)?(uo(e)||(e=()=>{}),ao(t,(t=>{if("afterCatch"===t.mode)return e(t.data)}))):null},t.pmIni=function(){return Promise.resolve()},t.pmMap=function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r={},o=!1,u=nr();if(!Qr(t)&&!eo(t))return u.reject("rs is not an array or object"),u;let i=!1;if(eo(t)){i=!0;let e=[];xn(t,((t,n)=>{e.push({k:n,v:t})})),t=e}let c=so(n);return c.on("message",(function(n){if(o)return;let f,a=c.get();if(uo(e)){let t=a.key,n=a.value;i&&(t=a.value.k,n=a.value.v),f=e(n,t)}else f=a.value;f.then((t=>{r[a.key]=t})).catch((t=>{o=!0,c.clear(),u.reject(t)})).finally((()=>{c.cb(),Hr(r)===Hr(t)&&u.resolve(lo(r))}))})),xn(t,((t,e)=>{c.push({key:e,value:t})})),u},t.pmQueue=function(){return new function(t,e){let n=null;rr(t)||(t=0),t=Xn(t),Yr(e)||(e=!1);let r=so(t);return r.on("message",(async function(t){let e=r.get();if(!e)return;await function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:10;Gn(t)||(t=10);let e=nr();return setTimeout((function(){e.resolve()}),t),e}(1);let n,o=pn(e,"id"),u=pn(e,"fun"),i=pn(e,"input");n=uo(u)?await fo(u)(...i):{state:"error",msg:"fun is not a function"},r.emit(o,n),r.cb()})),function(t){let o=nr(),u=er();n=u;for(var i=arguments.length,c=new Array(i>1?i-1:0),f=1;f<i;f++)c[f-1]=arguments[f];let a={id:u,fun:t,input:c};return r.push(a),r.once(u,(t=>{e?u===n?"success"===t.state?o.resolve(t.msg):o.reject(t.msg):o.reject({reason:"cancelled"}):"success"===t.state?o.resolve(t.msg):o.reject(t.msg)})),o}}(arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,arguments.length>1&&void 0!==arguments[1]&&arguments[1])},t.pmSeries=function(t,e){let n=nr();if(!Qr(t)&&!eo(t))return n.reject("rs is not an array or object"),n;let r=!1;if(eo(t)){r=!0;let e=[];xn(t,((t,n)=>{e.push({k:n,v:t})})),t=e}uo(e)||(e=function(t){return t});let o=-1,u=[];return t.reduce((function(t,n){return t.then((function(t){u.push(t),o+=1;let i=o,c=n;return r&&(i=n.k,c=n.v),uo(e)?e(c,i):c}))}),Promise.resolve()).then((function(t){var e,r,o,i;u.push(t),i=null==(e=u)?0:e.length,u=i?lr(e,(r=o||void 0===r?1:Dn(r))<0?0:r,i):[],n.resolve(u)})).catch((function(t){n.reject(t)})),n},t.pmThrottle=function(){let t=i(),e=[],n=null,r=!1;return function(o){let u=nr();if(!uo(o))return void console.log("func is not a function");let i=er();for(var c=arguments.length,f=new Array(c>1?c-1:0),a=1;a<c;a++)f[a-1]=arguments[a];return e.push({id:i,func:o,input:f}),null===n&&(n=setInterval((async()=>{if(r)return;r=!0;let o=e.pop();for(let n=0;n<e.length;n++){let r=e[n].id,o={state:"cancelled"};t.emit(r,o)}if(e=[],o){let e,n=o.id;e=uo(o.func)?await fo(o.func)(...o.input):{state:"error",msg:"fun is not a function"},t.emit(n,e)}r=!1,r||0!==e.length||(clearInterval(n),n=null)}),10)),t.once(i,(t=>{"success"===t.state?u.resolve(t.msg):"cancelled"===t.state?u.reject({reason:"cancelled"}):u.reject(t.msg)})),u}},t.replace=function(t,e,n){return Bn(t)&&Bn(e)&&Mn(n)?String(t).replaceAll(e,n):""},t.sep=function(t,e){if(!Bn(t))return[];if(!Bn(e))return[];let n=function(t,e){return Bn(t)&&Bn(e)?t.split(e):[]}(t,e);n=On(n,vo);let r=[];return xn(n,(function(t){Bn(t)&&r.push(t)})),r},t.strdelleft=function(t,e){return Bn(t)&&rr(e)?0===(e=Xn(e))?t:or(t,t.length-e):""},t.strdelright=ir,t.strleft=ur,t.strmid=function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return Bn(t)&&rr(e)?(n=Yn(n)?Xn(n):1,t.substring(e,e+n)):""},t.strright=or,t.waitFun=async function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=null,r=nr();if(!uo(t))return r.reject("waitfunction需輸入函數f"),r;let o=async()=>{let e=t();return co(e)&&(e=await e),e};if(n=await o(),!0===n)return r.resolve(),r;let u=pn(e,"attemptNum",null);Yn(u)||(u=200);let i=pn(e,"timeInterval",null);Yn(i)||(i=1e3);let c=0,f=setInterval((async()=>{c+=1,n=await o(),!0===n&&(clearInterval(f),r.resolve()),c>u&&(clearInterval(f),r.reject(`exceeded attemptNum[${u}]`))}),i);return r}}));
