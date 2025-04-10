/*!
 * wpf v1.7.80
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).wpf={})}(this,(function(t){"use strict";function e(t,e){for(var n=-1,r=null==t?0:t.length;++n<r&&!1!==e(t[n],n,t););return t}var n,r=function(t,e,r){for(var o=-1,u=Object(t),c=r(t),i=c.length;i--;){var f=c[n?i:++o];if(!1===e(u[f],f,u))break}return t},o=r;var u="object"==typeof global&&global&&global.Object===Object&&global,c="object"==typeof self&&self&&self.Object===Object&&self,i=u||c||Function("return this")(),f=i.Symbol,a=Object.prototype,l=a.hasOwnProperty,s=a.toString,p=f?f.toStringTag:void 0;var v=Object.prototype.toString;var b="[object Null]",y="[object Undefined]",j=f?f.toStringTag:void 0;function h(t){return null==t?void 0===t?y:b:j&&j in Object(t)?function(t){var e=l.call(t,p),n=t[p];try{t[p]=void 0;var r=!0}catch(t){}var o=s.call(t);return r&&(e?t[p]=n:delete t[p]),o}(t):function(t){return v.call(t)}(t)}function d(t){return null!=t&&"object"==typeof t}function g(t){return d(t)&&"[object Arguments]"==h(t)}var O=Object.prototype,m=O.hasOwnProperty,_=O.propertyIsEnumerable,w=g(function(){return arguments}())?g:function(t){return d(t)&&m.call(t,"callee")&&!_.call(t,"callee")},x=w,S=Array.isArray;var A="object"==typeof t&&t&&!t.nodeType&&t,k=A&&"object"==typeof module&&module&&!module.nodeType&&module,P=k&&k.exports===A?i.Buffer:void 0,F=(P?P.isBuffer:void 0)||function(){return!1},T=9007199254740991,M=/^(?:0|[1-9]\d*)$/;function E(t,e){var n=typeof t;return!!(e=null==e?T:e)&&("number"==n||"symbol"!=n&&M.test(t))&&t>-1&&t%1==0&&t<e}var N=9007199254740991;function $(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=N}var C={};C["[object Float32Array]"]=C["[object Float64Array]"]=C["[object Int8Array]"]=C["[object Int16Array]"]=C["[object Int32Array]"]=C["[object Uint8Array]"]=C["[object Uint8ClampedArray]"]=C["[object Uint16Array]"]=C["[object Uint32Array]"]=!0,C["[object Arguments]"]=C["[object Array]"]=C["[object ArrayBuffer]"]=C["[object Boolean]"]=C["[object DataView]"]=C["[object Date]"]=C["[object Error]"]=C["[object Function]"]=C["[object Map]"]=C["[object Number]"]=C["[object Object]"]=C["[object RegExp]"]=C["[object Set]"]=C["[object String]"]=C["[object WeakMap]"]=!1;var I,L="object"==typeof t&&t&&!t.nodeType&&t,B=L&&"object"==typeof module&&module&&!module.nodeType&&module,U=B&&B.exports===L&&u.process,R=function(){try{var t=B&&B.require&&B.require("util").types;return t||U&&U.binding&&U.binding("util")}catch(t){}}(),D=R&&R.isTypedArray,V=D?(I=D,function(t){return I(t)}):function(t){return d(t)&&$(t.length)&&!!C[h(t)]},W=Object.prototype.hasOwnProperty;function q(t,e){var n=S(t),r=!n&&x(t),o=!n&&!r&&F(t),u=!n&&!r&&!o&&V(t),c=n||r||o||u,i=c?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],f=i.length;for(var a in t)!e&&!W.call(t,a)||c&&("length"==a||o&&("offset"==a||"parent"==a)||u&&("buffer"==a||"byteLength"==a||"byteOffset"==a)||E(a,f))||i.push(a);return i}var z=Object.prototype;var G=function(t,e){return function(n){return t(e(n))}}(Object.keys,Object),H=G,J=Object.prototype.hasOwnProperty;function K(t){if(n=(e=t)&&e.constructor,e!==("function"==typeof n&&n.prototype||z))return H(t);var e,n,r=[];for(var o in Object(t))J.call(t,o)&&"constructor"!=o&&r.push(o);return r}function Q(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var X="[object AsyncFunction]",Y="[object Function]",Z="[object GeneratorFunction]",tt="[object Proxy]";function et(t){if(!Q(t))return!1;var e=h(t);return e==Y||e==Z||e==X||e==tt}function nt(t){return null!=t&&$(t.length)&&!et(t)}function rt(t){return nt(t)?q(t):K(t)}var ot=function(t,e){return function(n,r){if(null==n)return n;if(!nt(n))return t(n,r);for(var o=n.length,u=e?o:-1,c=Object(n);(e?u--:++u<o)&&!1!==r(c[u],u,c););return n}}((function(t,e){return t&&o(t,e,rt)})),ut=ot;function ct(t){return t}function it(t,n){var r;return(S(t)?e:ut)(t,"function"==typeof(r=n)?r:ct)}var ft,at=i["__core-js_shared__"],lt=(ft=/[^.]+$/.exec(at&&at.keys&&at.keys.IE_PROTO||""))?"Symbol(src)_1."+ft:"";var st=Function.prototype.toString;function pt(t){if(null!=t){try{return st.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var vt=/^\[object .+?Constructor\]$/,bt=Function.prototype,yt=Object.prototype,jt=bt.toString,ht=yt.hasOwnProperty,dt=RegExp("^"+jt.call(ht).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function gt(t){return!(!Q(t)||function(t){return!!lt&&lt in t}(t))&&(et(t)?dt:vt).test(pt(t))}function Ot(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return gt(n)?n:void 0}var mt=Ot(i,"DataView"),_t=Ot(i,"Map"),wt=Ot(i,"Promise"),xt=Ot(i,"Set"),St=Ot(i,"WeakMap"),At="[object Map]",kt="[object Promise]",Pt="[object Set]",Ft="[object WeakMap]",Tt="[object DataView]",Mt=pt(mt),Et=pt(_t),Nt=pt(wt),$t=pt(xt),Ct=pt(St),It=h;(mt&&It(new mt(new ArrayBuffer(1)))!=Tt||_t&&It(new _t)!=At||wt&&It(wt.resolve())!=kt||xt&&It(new xt)!=Pt||St&&It(new St)!=Ft)&&(It=function(t){var e=h(t),n="[object Object]"==e?t.constructor:void 0,r=n?pt(n):"";if(r)switch(r){case Mt:return Tt;case Et:return At;case Nt:return kt;case $t:return Pt;case Ct:return Ft}return e});var Lt=It,Bt="[object String]";var Ut,Rt=(Ut="length",function(t){return null==t?void 0:t[Ut]}),Dt=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");var Vt="\\ud800-\\udfff",Wt="["+Vt+"]",qt="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",zt="\\ud83c[\\udffb-\\udfff]",Gt="[^"+Vt+"]",Ht="(?:\\ud83c[\\udde6-\\uddff]){2}",Jt="[\\ud800-\\udbff][\\udc00-\\udfff]",Kt="(?:"+qt+"|"+zt+")"+"?",Qt="[\\ufe0e\\ufe0f]?",Xt=Qt+Kt+("(?:\\u200d(?:"+[Gt,Ht,Jt].join("|")+")"+Qt+Kt+")*"),Yt="(?:"+[Gt+qt+"?",qt,Ht,Jt,Wt].join("|")+")",Zt=RegExp(zt+"(?="+zt+")|"+Yt+Xt,"g");function te(t){return function(t){return Dt.test(t)}(t)?function(t){for(var e=Zt.lastIndex=0;Zt.test(t);)++e;return e}(t):Rt(t)}var ee="[object Map]",ne="[object Set]";function re(t){if(null==t)return 0;if(nt(t))return"string"==typeof(e=t)||!S(e)&&d(e)&&h(e)==Bt?te(t):t.length;var e,n=Lt(t);return n==ee||n==ne?t.size:K(t).length}function oe(t,e){for(var n=-1,r=null==t?0:t.length,o=Array(r);++n<r;)o[n]=e(t[n],n,t);return o}function ue(t){return null==t?[]:function(t,e){return oe(e,(function(e){return t[e]}))}(t,rt(t))}function ce(t){return"[object Array]"===Object.prototype.toString.call(t)}function ie(t){return"[object Object]"===Object.prototype.toString.call(t)}function fe(t){let e=Object.prototype.toString.call(t);return"[object Function]"===e||"[object AsyncFunction]"===e}function ae(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var le={exports:{}};!function(t){var e=Object.prototype.hasOwnProperty,n="~";function r(){}function o(t,e,n){this.fn=t,this.context=e,this.once=n||!1}function u(t,e,r,u,c){if("function"!=typeof r)throw new TypeError("The listener must be a function");var i=new o(r,u||t,c),f=n?n+e:e;return t._events[f]?t._events[f].fn?t._events[f]=[t._events[f],i]:t._events[f].push(i):(t._events[f]=i,t._eventsCount++),t}function c(t,e){0==--t._eventsCount?t._events=new r:delete t._events[e]}function i(){this._events=new r,this._eventsCount=0}Object.create&&(r.prototype=Object.create(null),(new r).__proto__||(n=!1)),i.prototype.eventNames=function(){var t,r,o=[];if(0===this._eventsCount)return o;for(r in t=this._events)e.call(t,r)&&o.push(n?r.slice(1):r);return Object.getOwnPropertySymbols?o.concat(Object.getOwnPropertySymbols(t)):o},i.prototype.listeners=function(t){var e=n?n+t:t,r=this._events[e];if(!r)return[];if(r.fn)return[r.fn];for(var o=0,u=r.length,c=new Array(u);o<u;o++)c[o]=r[o].fn;return c},i.prototype.listenerCount=function(t){var e=n?n+t:t,r=this._events[e];return r?r.fn?1:r.length:0},i.prototype.emit=function(t,e,r,o,u,c){var i=n?n+t:t;if(!this._events[i])return!1;var f,a,l=this._events[i],s=arguments.length;if(l.fn){switch(l.once&&this.removeListener(t,l.fn,void 0,!0),s){case 1:return l.fn.call(l.context),!0;case 2:return l.fn.call(l.context,e),!0;case 3:return l.fn.call(l.context,e,r),!0;case 4:return l.fn.call(l.context,e,r,o),!0;case 5:return l.fn.call(l.context,e,r,o,u),!0;case 6:return l.fn.call(l.context,e,r,o,u,c),!0}for(a=1,f=new Array(s-1);a<s;a++)f[a-1]=arguments[a];l.fn.apply(l.context,f)}else{var p,v=l.length;for(a=0;a<v;a++)switch(l[a].once&&this.removeListener(t,l[a].fn,void 0,!0),s){case 1:l[a].fn.call(l[a].context);break;case 2:l[a].fn.call(l[a].context,e);break;case 3:l[a].fn.call(l[a].context,e,r);break;case 4:l[a].fn.call(l[a].context,e,r,o);break;default:if(!f)for(p=1,f=new Array(s-1);p<s;p++)f[p-1]=arguments[p];l[a].fn.apply(l[a].context,f)}}return!0},i.prototype.on=function(t,e,n){return u(this,t,e,n,!1)},i.prototype.once=function(t,e,n){return u(this,t,e,n,!0)},i.prototype.removeListener=function(t,e,r,o){var u=n?n+t:t;if(!this._events[u])return this;if(!e)return c(this,u),this;var i=this._events[u];if(i.fn)i.fn!==e||o&&!i.once||r&&i.context!==r||c(this,u);else{for(var f=0,a=[],l=i.length;f<l;f++)(i[f].fn!==e||o&&!i[f].once||r&&i[f].context!==r)&&a.push(i[f]);a.length?this._events[u]=1===a.length?a[0]:a:c(this,u)}return this},i.prototype.removeAllListeners=function(t){var e;return t?(e=n?n+t:t,this._events[e]&&c(this,e)):(this._events=new r,this._eventsCount=0),this},i.prototype.off=i.prototype.removeListener,i.prototype.addListener=i.prototype.on,i.prefixed=n,i.EventEmitter=i,t.exports=i}(le);var se=ae(le.exports);var pe=/\s/;var ve=/^\s+/;function be(t){return t?t.slice(0,function(t){for(var e=t.length;e--&&pe.test(t.charAt(e)););return e}(t)+1).replace(ve,""):t}var ye="[object Symbol]";function je(t){return"symbol"==typeof t||d(t)&&h(t)==ye}var he=NaN,de=/^[-+]0x[0-9a-f]+$/i,ge=/^0b[01]+$/i,Oe=/^0o[0-7]+$/i,me=parseInt;function _e(t){if("number"==typeof t)return t;if(je(t))return he;if(Q(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=Q(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=be(t);var n=ge.test(t);return n||Oe.test(t)?me(t.slice(2),n?2:8):de.test(t)?he:+t}var we=1/0,xe=17976931348623157e292;function Se(t){return t?(t=_e(t))===we||t===-we?(t<0?-1:1)*xe:t==t?t:0:0===t?t:0}function Ae(t){var e=Se(t),n=e%1;return e==e?n?e-n:e:0}function ke(t){return"[object String]"===Object.prototype.toString.call(t)}function Pe(t){return t!=t}function Fe(t){let e=!1;if(function(t){return!(!ke(t)||""===t)}(t))e=!isNaN(Number(t));else if(function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)){if(Pe(t))return!1;e=!0}return e}function Te(t){if(!Fe(t))return 0;return Se(t)}function Me(t){return!!Fe(t)&&(t=Te(t),"number"==typeof(e=t)&&e==Ae(e));var e}var Ee=1/0,Ne=f?f.prototype:void 0,$e=Ne?Ne.toString:void 0;function Ce(t){if("string"==typeof t)return t;if(S(t))return oe(t,Ce)+"";if(je(t))return $e?$e.call(t):"";var e=t+"";return"0"==e&&1/t==-Ee?"-0":e}function Ie(t){return null==t?"":Ce(t)}var Le=i.isFinite,Be=Math.min;var Ue=function(t){var e=Math[t];return function(t,n){if(t=_e(t),(n=null==n?0:Be(Ae(n),292))&&Le(t)){var r=(Ie(t)+"e").split("e");return+((r=(Ie(e(r[0]+"e"+(+r[1]+n)))+"e").split("e"))[0]+"e"+(+r[1]-n))}return e(t)}}("round"),Re=Ue;function De(t){if(!Fe(t))return 0;t=Te(t);let e=Re(t);return"0"===String(e)?0:e}function Ve(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=0,n=[];var r;Me(r=t)&&De(r)<0&&(t=0),t=De(t);let o=new se;return o.get=function(){if(n.length>0){return e+=1,n.splice(0,1)[0]}return null},o.cb=function(){e-=1,e<0&&(e=0),n.length>0&&o.emit("message",n)},o.push=function(r){n.push(r),(t<=0||e<t)&&o.emit("message",n)},o.clear=function(){e=0,n=[]},o}function We(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if(ie(t)){for(let e in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!ke(t)||""!==t)}(t)||(!!function(t){return!!ce(t)&&0===t.length}(t)||!!Pe(t)))))}var qe="[object Boolean]";t.cint=De,t.isbol=function(t){return!0===(e=t)||!1===e||d(e)&&h(e)==qe;var e},t.isearr=function(t){return!!ce(t)&&(0!==t.length&&(1!==t.length||!We(t[0])))},t.iseobj=function(t){if(ie(t)){for(let e in t)return!0;return!1}return!1},t.isfun=fe,t.ispint=function(t){return!!Me(t)&&De(t)>0},t.pmMap=function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r={},o=!1,u=function(){let t,e,n=new Promise((function(){t=arguments[0],e=arguments[1]}));return n.resolve=t,n.reject=e,n}();if(!ce(t)&&!ie(t))return u.reject("rs is not an array or object"),u;let c=!1;if(ie(t)){c=!0;let e=[];it(t,((t,n)=>{e.push({k:n,v:t})})),t=e}let i=Ve(n);return i.on("message",(function(n){if(o)return;let f,a=i.get();if(fe(e)){let t=a.key,n=a.value;c&&(t=a.value.k,n=a.value.v),f=e(n,t)}else f=a.value;f.then((t=>{r[a.key]=t})).catch((t=>{o=!0,i.clear(),u.reject(t)})).finally((()=>{i.cb(),re(r)===re(t)&&u.resolve(ue(r))}))})),it(t,((t,e)=>{i.push({key:e,value:t})})),u}}));
