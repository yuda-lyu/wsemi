import assert from 'assert'
import arrSep from '../src/arrSep.mjs'


describe(`arrSep`, function() {
    let k
    let o = {}

    let arr = ['a', 123, 'xyz', 5.678, null, 'd', [], { x: 'x1', y: 'y1' }]

    k = 0
    o[k] = [
        ['a', 123],
        ['xyz', 5.678],
        [null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, 2`, function() {
        k = 0
        let r = arrSep(arr, 2)
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 1
    o[k] = [
        ['a', 123, 'xyz'],
        [5.678, null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, 3`, function() {
        k = 1
        let r = arrSep(arr, 3)
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 2
    o[k] = [
        ['a', 123],
        ['xyz', 5.678],
        [null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, { numCount: 2 }`, function() {
        k = 2
        let r = arrSep(arr, { numCount: 2 })
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 3
    o[k] = [
        ['a', 'd'],
        [123, []],
        ['xyz', { x: 'x1', y: 'y1' }],
        [5.678],
        [null]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, { numGroup: 5 }`, function() {
        k = 3
        let r = arrSep(arr, { numGroup: 5 })
        assert.strict.deepStrictEqual(r, o[k])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, ''`, function() {
        let r = arrSep(arr, '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, []`, function() {
        let r = arrSep(arr, [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, {}`, function() {
        let r = arrSep(arr, {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, null`, function() {
        let r = arrSep(arr, null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, undefined`, function() {
        let r = arrSep(arr, undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = arrSep('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = arrSep([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = arrSep({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = arrSep(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = arrSep(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input NaN`, function() {
        let r = arrSep(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

    //第221項已知缺陷先修(ws270): 整數寫法與opt.numCount、opt.numGroup皆改iseint(x, { use: 'count', min: 1 }), 通過後以Number()取值再用於迴圈(修前數字字串與迴圈之+=字串相加而切錯)
    //  Infinity等使迴圈不終止之輸入(含'Infinity'字串)於intInputHang.test.mjs(子行程加逾時)驗, 不在此行程內跑(修前原碼會使行程卡死); 整數寫法本輪不移除(排程第223項日後處理)
    let a8 = [1, 2, 3, 4, 5, 6, 7, 8]
    let by2 = [[1, 2], [3, 4], [5, 6], [7, 8]]
    let g3 = [[1, 4, 7], [2, 5, 8], [3, 6]]

    describe(`valid numeric strings (converted by Number() before the loops)`, function() {

        it(`should return ${JSON.stringify(by2)} when input a8, '2'`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, '2'), by2) // 修前為[[1,2],[]]
        })

        it(`should return ${JSON.stringify(by2)} when input a8, ' 2 '`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, ' 2 '), by2)
        })

        it(`should return ${JSON.stringify(by2)} when input a8, '2.0'`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, '2.0'), by2)
        })

        it(`should return ${JSON.stringify(by2)} when input a8, { numCount: '2' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2' }), by2)
        })

        it(`should return ${JSON.stringify(g3)} when input a8, { numGroup: '3' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: '3' }), g3) // 修前numGroup為字串時迴圈與比較失真
        })

        it(`should return the same as the number form for numGroup 3 (number)`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: 3 }), g3)
        })

        it(`should use numGroup when numCount is invalid and numGroup is valid`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 0, numGroup: '3' }), g3)
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 1.5, numGroup: 3 }), g3)
        })

        it(`should prefer numCount when both are valid`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2', numGroup: 3 }), by2)
        })

        it(`should return [[...]] (one group) when num is larger than the array length`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, 100), [a8])
            assert.strict.deepStrictEqual(arrSep(a8, '100'), [a8])
        })

        it(`should return [] for an empty array`, function() {
            assert.strict.deepStrictEqual(arrSep([], 2), [])
        })

        it(`should accept the lower bound 1 in all three forms`, function() {
            let by1 = [[1], [2], [3], [4], [5], [6], [7], [8]]
            assert.strict.deepStrictEqual(arrSep(a8, 1), by1)
            assert.strict.deepStrictEqual(arrSep(a8, '1'), by1)
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 1 }), by1)
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: 1 }), [a8])
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: '1' }), [a8])
        })

    })

    describe(`generic invalid values (spec V24 matrix) for the integer form and for each object key`, function() {

        // 修前即不終止者(Infinity、超過個數上限)於intInputHang.test.mjs(子行程)驗, 此處為不致使修前原碼卡死之輸入
        let INVALIDS = [
            ['undefined', undefined],
            ['null', null],
            ['true', true],
            ['false', false],
            [`'true'`, 'true'],
            ['NaN', NaN],
            [`''`, ''],
            [`'   '`, '   '],
            [`'abc'`, 'abc'],
            ['[]', []],
            ['[2]', [2]],
            ['{}', {}],
            ['5n', 5n],
            ['Symbol()', Symbol('x')],
            ['function', () => 2],
        ]
        for (let [label, v] of INVALIDS) {
            it(`should return [] when input a8, ${label}`, function() {
                assert.strict.deepStrictEqual(arrSep(a8, v), [])
            })
            it(`should throw when input a8, { numCount: ${label} }`, function() {
                assert.throws(() => arrSep(a8, { numCount: v }), { message: 'invalid opt.numCount or opt.numGroup' })
            })
            it(`should throw when input a8, { numGroup: ${label} }`, function() {
                assert.throws(() => arrSep(a8, { numGroup: v }), { message: 'invalid opt.numCount or opt.numGroup' })
            })
        }

    })

    describe(`invalid num (not iseint count min 1) in the integer form should return []`, function() {

        for (let [label, v] of [
            ['0', 0],
            [`'0'`, '0'],
            ['-1', -1],
            [`'-2'`, '-2'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            [`'0x2'`, '0x2'],
            ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
            ['2n', 2n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
        ]) {
            it(`should return [] when input a8, ${label}`, function() {
                assert.strict.deepStrictEqual(arrSep(a8, v), [])
            })
        }

    })

    describe(`invalid numCount and numGroup in the object form should throw invalid opt.numCount or opt.numGroup`, function() {

        for (let [label, o] of [
            ['{ numCount: 0 }', { numCount: 0 }],
            ['{ numCount: -1 }', { numCount: -1 }],
            ['{ numGroup: 0 }', { numGroup: 0 }],
            ['{ numGroup: 1.5 }', { numGroup: 1.5 }],
            [`{ numCount: '0x2' }`, { numCount: '0x2' }],
            [`{ numGroup: '0x2' }`, { numGroup: '0x2' }],
            ['{ numCount: 1.5 }', { numCount: 1.5 }],
            ['{ numGroup: -1 }', { numGroup: -1 }],
            [`{ numCount: 'abc', numGroup: 'abc' }`, { numCount: 'abc', numGroup: 'abc' }],
            ['{ numCount: new Number(2) }', { numCount: new Number(2) }], // eslint-disable-line no-new-wrappers
            ['{ numGroup: new Number(2) }', { numGroup: new Number(2) }], // eslint-disable-line no-new-wrappers
            ['{ x: 1 }', { x: 1 }],
        ]) {
            it(`should throw when input a8, ${label}`, function() {
                assert.throws(() => arrSep(a8, o), { message: 'invalid opt.numCount or opt.numGroup' })
            })
        }

    })

})
