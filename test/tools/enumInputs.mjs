//enumInputs.mjs: 「既有函數改用isenum/iseint」(排程第221項第一批)各測試檔共用之輸入矩陣
//  依據: dspec〈輸入參數之檢測機制〉§3.1(數字字串格式)、§7.1(isenum)、§7.2(測試矩陣)、§11(2026-10-31使用者裁定)
//  標籤(label)只供測試標題, 值為實際輸入; 每次匯入取得同一組物件(包裝物件不被測試改動)

//isnum為true、但不是有效數字(isenum為false)者: 判斷界線收緊後之差異, 每個呼叫端的新測試都必須涵蓋
const INVALID_BUT_ISNUM = [
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    [`'Infinity'`, 'Infinity'],
    [`'-Infinity'`, '-Infinity'],
    [`'0x10'`, '0x10'],
    [`'0b11'`, '0b11'],
    [`'0o7'`, '0o7'],
    [`'1e400'`, '1e400'],
    [`'-1e400'`, '-1e400'],
    [`'1e-400'`, '1e-400'], //下溢為0而尾數含非零數字
    ['new Number(30)', new Number(30)], // eslint-disable-line no-new-wrappers
    [`new String('30')`, new String('30')], // eslint-disable-line no-new-wrappers
]

//isnum亦為false者: 收緊前後皆無效(維持既有失敗通道)
const INVALID_NOT_ISNUM = [
    ['NaN', NaN],
    [`'-'`, '-'],
    [`'NP'`, 'NP'],
    [`''`, ''],
    [`'   '`, '   '],
    ['null', null],
    ['undefined', undefined],
    ['true', true],
    ['false', false],
    ['[]', []],
    ['[5]', [5]],
    ['{}', {}],
    ['5n', 5n],
    [`'1,234'`, '1,234'],
    [`'１２'`, '１２'],
    [`'abc'`, 'abc'],
    ['Symbol()', Symbol('x')],
    ['function', () => 5],
]

//全部無效輸入
const INVALID = [...INVALID_BUT_ISNUM, ...INVALID_NOT_ISNUM]

//有效數字字串([標籤, 字串, 去頭尾空白後Number(…)之值]): 含頭尾空白、正負號、小數點、科學記號、前導零
const VALID_STR = [
    [`'30'`, '30', 30],
    [`' 30 '`, ' 30 ', 30],
    [`'\\t30\\n'`, '\t30\n', 30],
    [`'+5.'`, '+5.', 5],
    [`'1e1'`, '1e1', 10],
    [`'1E+1'`, '1E+1', 10],
    [`'-.5'`, '-.5', -0.5],
    [`'00012'`, '00012', 12],
    [`'1.2e-5'`, '1.2e-5', 1.2e-5],
]


export { INVALID_BUT_ISNUM, INVALID_NOT_ISNUM, INVALID, VALID_STR }
