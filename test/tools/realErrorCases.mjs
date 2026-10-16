//R-CODEC-ERR-01 規則1之值軸: 真Error(含無可呼叫之toString者)與恰帶字串name、message之非Error物件, 供obj2stru8arr與obj2str之「Error轉換」段共用
import vm from 'vm'


//HttpError, 繼承Error並加掛欄位之自訂錯誤類別
class HttpError extends Error {
    constructor(m) {
        super(m)
        this.name = 'HttpError'
        this.status = 503
    }
}


//AppError, 未繼承Error但恰帶字串name與message之錯誤類別, 為一般物件
class AppError {
    constructor() {
        this.name = 'AppError'
        this.message = 'quota exceeded'
        this.code = 429
    }
}


//AppErrorWithToString, 同AppError且另定義toString
class AppErrorWithToString {
    constructor() {
        this.name = 'AppError'
        this.message = 'quota exceeded'
        this.code = 429
    }

    toString() {
        return `${this.name}: ${this.message}`
    }
}


//ChatMessage, 恰帶字串name與message之一般資料類別
class ChatMessage {
    constructor() {
        this.name = 'Alice'
        this.message = 'hi'
        this.ts = 1
        this.room = 'r1'
    }
}


//realErrorCases, 逐值, rr為該值經序列化後之JSON片段
//  前7列為真Error(含子類別、DOMException、以Error.prototype為原型者、Error之Proxy、跨realm之Error), 轉為'名稱: 訊息'字串
//  後6列為一般物件, 照一般物件序列化並保留全部可列舉欄位(含恰帶字串name與message之類別實例、跨realm之非Error類別實例、偽造Symbol.toStringTag者)
let realErrorCases = [
    { name: 'Error', mk: () => new Error('m'), rr: '"Error: m"' },
    { name: 'TypeError', mk: () => new TypeError('t'), rr: '"TypeError: t"' },
    { name: 'a custom error class extending Error with extra fields (HttpError)', mk: () => new HttpError('down'), rr: '"HttpError: down"' },
    { name: 'DOMException', mk: () => new DOMException('dom msg', 'AbortError'), rr: '"AbortError: dom msg"' },
    {
        name: 'an object created from Error.prototype',
        mk: () => {
            let e = Object.create(Error.prototype)
            e.message = 'oc'
            return e
        },
        rr: '"Error: oc"',
    },
    { name: 'a Proxy of Error', mk: () => new Proxy(new Error('p'), {}), rr: '"Error: p"' },
    { name: 'an Error from another realm (vm context)', mk: () => vm.runInContext('new Error("fx")', vm.createContext({})), rr: '"Error: fx"' },
    { name: 'a non-Error class with string name and message (AppError)', mk: () => new AppError(), rr: '{"name":"AppError","message":"quota exceeded","code":429}' },
    { name: 'a non-Error class with string name and message and its own toString (AppError)', mk: () => new AppErrorWithToString(), rr: '{"name":"AppError","message":"quota exceeded","code":429}' },
    { name: 'a data class with string name and message (ChatMessage)', mk: () => new ChatMessage(), rr: '{"name":"Alice","message":"hi","ts":1,"room":"r1"}' },
    {
        name: 'a non-Error class instance from another realm (vm context)',
        mk: () => vm.runInContext(`class AppError { constructor() { this.name = 'AppError'; this.message = 'm'; this.code = 1 } }; new AppError()`, vm.createContext({})),
        rr: '{"name":"AppError","message":"m","code":1}',
    },
    { name: 'a plain object with string name and message', mk: () => ({ name: 'AppError', message: 'quota exceeded', code: 429 }), rr: '{"name":"AppError","message":"quota exceeded","code":429}' },
    { name: 'a plain object spoofing Symbol.toStringTag as Error', mk: () => ({ message: 'spoof', [Symbol.toStringTag]: 'Error' }), rr: '{"message":"spoof"}' },
]


//nestedErrorCase, 巢狀: 任意深度之真Error皆轉字串, 其旁之一般資料物件保留欄位
let nestedErrorCase = {
    mk: () => ({ list: [new Error('e1'), new ChatMessage(), { inner: new TypeError('e2') }] }),
    rr: '{"list":["Error: e1",{"name":"Alice","message":"hi","ts":1,"room":"r1"},{"inner":"TypeError: e2"}]}',
}


//errorProtoToStringCases, toString恰為Object預設者(首列)或無可呼叫之toString者(以null為原型、toString被設為非函數)之真Error, rr為該值經序列化後之JSON片段
//  R-CODEC-ERR-01 規則1: 以Error.prototype.toString之語意得'名稱: 訊息', 即讀name(undefined時為'Error')與message(undefined時為''), 兩者皆非空時以': '相接, 否則取非空之一
//  以null為原型者讀不到原型上之name, 故TypeError亦得'Error: …'; toString被設為非函數而原型仍在者讀得原型上之name
let errorProtoToStringCases = [
    { name: 'an Error whose prototype is Object.prototype (toString is the Object default)', mk: () => Object.setPrototypeOf(new Error('boom'), Object.prototype), rr: '"Error: boom"' },
    { name: 'an Error without prototype (Object.setPrototypeOf(new Error(\'boom\'), null))', mk: () => Object.setPrototypeOf(new Error('boom'), null), rr: '"Error: boom"' },
    { name: 'a TypeError without prototype (name on its prototype is unreachable)', mk: () => Object.setPrototypeOf(new TypeError('t'), null), rr: '"Error: t"' },
    {
        name: 'an Error without prototype with own name HttpError',
        mk: () => {
            let e = Object.setPrototypeOf(new Error('down'), null)
            e.name = 'HttpError'
            return e
        },
        rr: '"HttpError: down"',
    },
    { name: 'an Error without prototype and without message', mk: () => Object.setPrototypeOf(new Error(), null), rr: '"Error"' },
    {
        name: 'an Error whose toString is set to a number',
        mk: () => {
            let e = new Error('boom')
            e.toString = 123
            return e
        },
        rr: '"Error: boom"',
    },
    {
        name: 'a TypeError whose toString is set to null',
        mk: () => {
            let e = new TypeError('t')
            e.toString = null
            return e
        },
        rr: '"TypeError: t"',
    },
]


//nameThrowsErrorCase, 以null為原型且讀name拋錯之真Error
//  R-CODEC-ERR-01 規則1: Error.prototype.toString讀name/message拋錯時依codec之catch回報; 規則2: catch以_errToStr轉字串, Error得'名稱: 訊息'
let nameThrowsErrorCase = {
    mk: () => {
        let e = Object.setPrototypeOf(new Error('boom'), null)
        Object.defineProperty(e, 'name', {
            get() {
                throw new Error('nm')
            },
        })
        return e
    },
    msg: 'Error: nm',
}


export { HttpError, AppError, AppErrorWithToString, ChatMessage, realErrorCases, nestedErrorCase, errorProtoToStringCases, nameThrowsErrorCase }
