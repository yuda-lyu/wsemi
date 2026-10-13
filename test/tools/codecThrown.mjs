//R-CODEC-ERR-01之2測試共用: 呼叫端(toJSON、getter、Proxy陷阱、注入之fs)可拋出之各種值, 以及catch應回報之msg
//  同一helper只定義於此, 供o2j、obj2str、obj2stru8arr、obj2u8arr、fsGetFile*Hash等測試檔引用
import { revoked } from './caseKit.mjs'


//thrower, 回傳「呼叫即拋出v」之函數; 以變數拋出, 避免throw字面值(null、undefined)被no-throw-literal擋下
function thrower(v) {
    return () => {
        throw v
    }
}


//thrownCases, 各種被拋出之值(mk每次回傳新值)與_errToStr應得之msg: 先String(err), 拋錯則讀字串message, 再無則'unknown error'
let thrownCases = [
    { name: 'null', mk: () => null, msg: 'null' },
    { name: 'undefined', mk: () => undefined, msg: 'undefined' },
    { name: 'an object without prototype', mk: () => Object.create(null), msg: 'unknown error' },
    { name: 'a revoked Proxy', mk: () => revoked(), msg: 'unknown error' },
    { name: 'an object without prototype but with a string message', mk: () => Object.assign(Object.create(null), { message: 'np-msg' }), msg: 'np-msg' },
]


//mkFsReadStub, 讀檔類fs替身(不觸及實體檔案): 僅使fsIsFileCore之前置檢查(statSync、lstatSync)通過, createReadStream由各案注入
function mkFsReadStub(createReadStream) {
    return {
        statSync: () => ({}),
        lstatSync: () => ({ isDirectory: () => false, isSymbolicLink: () => false }),
        createReadStream,
    }
}


export { thrower, revoked, thrownCases, mkFsReadStub }
