import assert from 'assert'
import replacePlus from '../src/replacePlus.mjs'


//ws286b: replacePlus 必須參數遇非預期改拋錯(原回''), 且pre、aft、not、r改為普通文字(不作正規表示式; 使用者2026-11-02逐列確認並定)
//  規格: dspec〈輸入參數之檢測機制〉§5.1(同步工具函數之必須參數無效throw Error)、V19(訊息格式)、V20(不回顯輸入值)
//  c為''回傳''(不變), 但其餘必須參數(pre、aft、r)仍須有效(檢測順序: c、pre、aft、r, 皆先於c為''之回傳)
//  not維持『其中每個字元皆不可出現在字首與字尾之間』之語意(逸出字元類別內之特殊字元); 自字首比對到最後一個字尾(貪婪)之行為不變
describe(`replacePlus`, function() {

    const MSG_C = 'invalid c: must be a string'
    const MSG_PRE = 'invalid pre: must be a non-empty string'
    const MSG_AFT = 'invalid aft: must be a non-empty string'
    const MSG_R = 'invalid r: must be a string'

    //--- 正常輸出(不變) ---

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '1.25abxyz結尾')
    })

    it(`should return 'xyz結尾' when input '1.25mn1.25abc中文結尾', '1', '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', '1', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, 'xyz結尾')
    })

    it(`should return '1.25mnxyz結尾' when input '1.25mn1.25abc中文結尾', '1', '文', 'mn', 'xyz'`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', '1', '文', 'm', 'xyz')
        assert.strict.deepStrictEqual(r, '1.25mnxyz結尾')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', 'c', '文', 'mn', 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', '文', 'mn', 'xyz')
        assert.strict.deepStrictEqual(r, '1.25abxyz結尾')
    })

    it(`should return '1.25mn1.25ab結尾' when input '1.25mn1.25abc中文結尾', 'c', '文', null, ''`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', null, '')
        assert.strict.deepStrictEqual(r, '1.25mn1.25ab結尾')
    })

    it(`should return '1.25mn1.25ab結尾' when input '1.25mn1.25abc中文結尾', 'c', '文', '', ''`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', '', '')
        assert.strict.deepStrictEqual(r, '1.25mn1.25ab結尾')
    })

    //r為空字串是有效的(可取代成空字串)
    it(`should accept r = '' (replace by empty string): 'a1b', 'a', 'b', null, '' -> ''`, function() {
        assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', null, ''), '')
        assert.strict.deepStrictEqual(replacePlus('xa1by', 'a', 'b', null, ''), 'xy')
    })

    //c為''回傳'', 其餘必須參數有效
    it(`should return '' when c is '' and the other required parameters are valid`, function() {
        assert.strict.deepStrictEqual(replacePlus('', 'a', 'b', null, 'X'), '')
        assert.strict.deepStrictEqual(replacePlus('', 'c', '文', null, 'xyz'), '')
        assert.strict.deepStrictEqual(replacePlus('', 'a', 'b', null, ''), '')
    })

    //未匹配時原樣回傳
    it(`should return c unchanged when nothing matches`, function() {
        assert.strict.deepStrictEqual(replacePlus('abc', 'x', 'y', null, 'R'), 'abc')
        assert.strict.deepStrictEqual(replacePlus('abc', 'c', 'a', null, 'R'), 'abc')
    })

    //--- not 無效忽略(不變) ---

    it(`should ignore an invalid not (not a non-empty string): 'a1b', 'a', 'b', not, 'X' -> 'X'`, function() {
        for (let not of [123, 0, true, false, [], {}, null, undefined, '', NaN, () => 'x']) {
            assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', not, 'X'), 'X', String(not))
        }
        assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', 123, 'X'), 'X')
    })

    //--- 必須參數無效 -> throw, 訊息固定不帶值 ---

    let NOT_STR = [
        ['123', 123],
        ['0', 0],
        ['NaN', NaN],
        ['true', true],
        ['null', null],
        ['undefined', undefined],
        ['[]', []],
        [`['a']`, ['a']],
        ['{}', {}],
        ['() => 1', () => 1],
        ['Symbol()', Symbol('x')],
        ['1n', 1n],
    ]

    for (let [label, c] of NOT_STR) {
        it(`should throw '${MSG_C}' when c is not a string: ${label}`, function() {
            assert.throws(() => replacePlus(c, 'a', 'b', null, 'X'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, MSG_C)
                return true
            })
        })
    }

    for (let [label, v] of [...NOT_STR, [`'' (empty string)`, '']]) {
        it(`should throw '${MSG_PRE}' when pre is not a non-empty string: ${label}`, function() {
            for (let c of ['a1b', '']) { //c為''時亦須檢測
                assert.throws(() => replacePlus(c, v, 'b', null, 'X'), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_PRE)
                    return true
                })
            }
        })

        it(`should throw '${MSG_AFT}' when aft is not a non-empty string: ${label}`, function() {
            for (let c of ['a1b', '']) {
                assert.throws(() => replacePlus(c, 'a', v, null, 'X'), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_AFT)
                    return true
                })
            }
        })
    }

    for (let [label, r] of NOT_STR) {
        it(`should throw '${MSG_R}' when r is not a string: ${label}`, function() {
            for (let c of ['a1b', '']) {
                assert.throws(() => replacePlus(c, 'a', 'b', null, r), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_R)
                    return true
                })
            }
        })
    }

    it(`should throw for the former cases that returned '' (required parameters invalid)`, function() {
        assert.throws(() => replacePlus(123, 'a', 'b', null, 'X'), { message: MSG_C })
        assert.throws(() => replacePlus('a1b', '', 'b', null, 'X'), { message: MSG_PRE })
        assert.throws(() => replacePlus('a1b', 'a', '', null, 'X'), { message: MSG_AFT })
        assert.throws(() => replacePlus('a1b', 'a', 'b', null, 123), { message: MSG_R })
        assert.throws(() => replacePlus('1.25abc中文結尾', 'c', '文', null, []), { message: MSG_R })
        assert.throws(() => replacePlus('1.25abc中文結尾', 'c', '文', null, undefined), { message: MSG_R })
        assert.throws(() => replacePlus(''), { message: MSG_PRE })
        assert.throws(() => replacePlus([]), { message: MSG_C })
        assert.throws(() => replacePlus(undefined), { message: MSG_C })
    })

    it(`should check in the order c, pre, aft, r`, function() {
        assert.throws(() => replacePlus(1, 2, 3, null, 4), { message: MSG_C })
        assert.throws(() => replacePlus('a', 2, 3, null, 4), { message: MSG_PRE })
        assert.throws(() => replacePlus('a', 'a', 3, null, 4), { message: MSG_AFT })
        assert.throws(() => replacePlus('a', 'a', 'b', null, 4), { message: MSG_R })
    })

    it(`the error messages should not carry the input values`, function() {
        let secret = { secret: 'SECRET-VALUE-123' }
        for (let args of [[secret, 'a', 'b', null, 'X'], ['a', secret, 'b', null, 'X'], ['a', 'a', secret, null, 'X'], ['a', 'a', 'b', null, secret]]) {
            assert.throws(() => replacePlus(...args), (err) => {
                assert.ok(!err.message.includes('SECRET'), err.message)
                return true
            })
        }
    })

    //--- 普通文字: pre、aft、not、r皆不作正規表示式 ---

    it(`should treat '(' ')' '[' ']' as plain text (table of the user-confirmed rows)`, function() {
        assert.strict.deepStrictEqual(replacePlus('a(b)c', '(', ')', null, 'X'), 'aXc')
        assert.strict.deepStrictEqual(replacePlus('abc[1]def', '[', ']', null, 'X'), 'abcXdef')
    })

    it(`should treat r as plain text: '$&$&' is output as is`, function() {
        assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', null, '$&$&'), '$&$&')
    })

    it(`should treat ']' in not as a plain character: 'x]y-z' is not replaced since ']' is between x and z`, function() {
        assert.strict.deepStrictEqual(replacePlus('x]y-z', 'x', 'z', ']', 'R'), 'x]y-z')
        assert.strict.deepStrictEqual(replacePlus('xy-z', 'x', 'z', ']', 'R'), 'R') // 區間內無']'
    })

    //正規表示式特殊字元: . * + ? ^ $ ( ) [ ] { } | \
    let SPECIAL = ['.', '*', '+', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|', '\\']

    for (let s of SPECIAL) {
        let ls = `'${s}'`

        it(`should treat ${ls} as plain text in pre`, function() {
            //字首為s; 若被當正規表示式, '.'會匹配'x'、其餘多為語法錯誤或不匹配
            assert.strict.deepStrictEqual(replacePlus(`x${s}y${s}z!`, s, 'z', null, 'X'), 'xX!')
            assert.strict.deepStrictEqual(replacePlus(`x${s}z!`, s, 'z', null, 'X'), 'xX!')
        })

        it(`should treat ${ls} as plain text in aft (greedy up to the last aft)`, function() {
            assert.strict.deepStrictEqual(replacePlus(`a${s}b${s}c`, 'a', s, null, 'X'), 'Xc')
            assert.strict.deepStrictEqual(replacePlus(`a${s}bc`, 'a', s, null, 'X'), 'Xbc')
        })

        it(`should treat ${ls} as one plain forbidden character in not`, function() {
            //第一個a後方遇s被擋(其後須直接接b才能匹配), 第二個a3b可匹配
            assert.strict.deepStrictEqual(replacePlus(`a1${s}2b-a3b`, 'a', 'b', s, 'X'), `a1${s}2b-X`)
            //無s時可匹配
            assert.strict.deepStrictEqual(replacePlus('a12b', 'a', 'b', s, 'X'), 'X')
        })

        it(`should treat ${ls} as plain text when it is also an ordinary character of the text between`, function() {
            //s出現在字首與字尾之間且不在not中: 照常匹配
            assert.strict.deepStrictEqual(replacePlus(`a${s}b`, 'a', 'b', 'q', 'X'), 'X')
        })
    }

    it(`should treat '-' in not as a plain character, not as a range ('1-3' forbids '1', '-', '3' only)`, function() {
        assert.strict.deepStrictEqual(replacePlus('a2b', 'a', 'b', '1-3', 'X'), 'X') // '2'不在not內
        assert.strict.deepStrictEqual(replacePlus('a-b', 'a', 'b', '1-3', 'X'), 'a-b') // '-'在not內
        assert.strict.deepStrictEqual(replacePlus('a3b', 'a', 'b', '1-3', 'X'), 'a3b') // '3'在not內
        assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', '1-3', 'X'), 'a1b') // '1'在not內
    })

    it(`should treat every character of a multi-character not as forbidden (the original semantic)`, function() {
        assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', '123', 'X'), 'a1b')
        assert.strict.deepStrictEqual(replacePlus('a3b', 'a', 'b', '123', 'X'), 'a3b')
        assert.strict.deepStrictEqual(replacePlus('a4b', 'a', 'b', '123', 'X'), 'X')
        assert.strict.deepStrictEqual(replacePlus('a\\b', 'a', 'b', '\\]^', 'X'), 'a\\b')
    })

    it(`should treat a multi-character pre and aft as plain text (not as a sequence of regex tokens)`, function() {
        assert.strict.deepStrictEqual(replacePlus('x(a|b)yz(a|b)', '(a|b)', 'y', null, 'R'), 'xRz(a|b)')
        assert.strict.deepStrictEqual(replacePlus('ab ac', 'a.', 'c', null, 'R'), 'ab ac') // 'a.'為普通文字, 文中無
        assert.strict.deepStrictEqual(replacePlus('a.c', 'a.', 'c', null, 'R'), 'R')
    })

    //r之特殊取代樣式皆原樣輸出: $& $1 $` $' $$ $<name>
    for (let r of ['$&$&', '$1', '$`', `$'`, '$$', '$<a>', '$0', '$&', 'x$&y$1z']) {
        it(`should output r as is: ${JSON.stringify(r)}`, function() {
            assert.strict.deepStrictEqual(replacePlus('p-a1b-s', 'a', 'b', null, r), 'p-' + r + '-s')
            assert.strict.deepStrictEqual(replacePlus('a1b', 'a', 'b', null, r), r)
        })
    }

    //貪婪行為不變: 自字首比對到最後一個字尾; 多段時一次吃到最後
    it(`should keep the greedy behavior: from the first pre to the last aft`, function() {
        assert.strict.deepStrictEqual(replacePlus('a1b-a2b-a3b', 'a', 'b', null, 'X'), 'X')
        assert.strict.deepStrictEqual(replacePlus('a1b-a2b-a3b-tail', 'a', 'b', null, 'X'), 'X-tail')
        assert.strict.deepStrictEqual(replacePlus('1.25mn1.25abc中文結尾', '1', '文', null, 'xyz'), 'xyz結尾')
    })

    //not讓貪婪被切斷後, 可有多段匹配(全域取代)
    it(`should replace every separate match globally when not splits the text`, function() {
        assert.strict.deepStrictEqual(replacePlus('a1b;a2b;a3b', 'a', 'b', ';', 'X'), 'X;X;X')
        assert.strict.deepStrictEqual(replacePlus('a1b;a2b', 'a', 'b', ';', '[$&]'), '[$&];[$&]')
    })

    //astral(非BMP)字元: not內之字元以字元(code point)為單位, 不可誤擋共用高代理之其他字元
    it(`should treat an astral character in not as one character (not blocking other astral characters)`, function() {
        assert.strict.deepStrictEqual(replacePlus('a😀b a😁b', 'a', 'b', '😀', 'X'), 'a😀b X')
        assert.strict.deepStrictEqual(replacePlus('a😁b', 'a', 'b', '😀', 'X'), 'X')
        assert.strict.deepStrictEqual(replacePlus('a😀b', 'a', 'b', '😀', 'X'), 'a😀b')
    })

    it(`should accept an astral character in pre and aft`, function() {
        assert.strict.deepStrictEqual(replacePlus('x😀1😁y', '😀', '😁', null, 'R'), 'xRy')
    })

})
