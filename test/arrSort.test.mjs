import assert from 'assert'
import arrSort from '../src/arrSort.mjs'


describe(`arrSort`, function() {
    let k
    let oin = {}
    let oout = {}

    k = 1
    oin[k] = [1, 30, 4, 21, 100000]
    oout[k] = [1, 4, 21, 30, 100000]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 1
        let r = arrSort(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    oin[k] = [1, 30, 4, 21, 100000]
    oout[k] = [0, 2, 3, 1, 4]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { returnIndex: true }`, function() {
        k = 2
        let r = arrSort(oin[k], { returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    oin[k] = ['March', 'Jan', 'Feb', 'Dec']
    oout[k] = ['Dec', 'Feb', 'Jan', 'March']
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 3
        let r = arrSort(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    oin[k] = ['1', '30', '  4  ', '21', '100000']
    oout[k] = ['1', '  4  ', '21', '30', '100000']
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 4
        let r = arrSort(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    oin[k] = ['1', '30', '  4  ', 21, '100000']
    oout[k] = ['1', '  4  ', 21, '30', '100000']
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 5
        let r = arrSort(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    oin[k] = ['abc1', 'abc30', 'abc4', 'abc21', 'abc100000']
    oout[k] = ['abc1', 'abc4', 'abc21', 'abc30', 'abc100000']
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 6
        let r = arrSort(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 7
    oin[k] = ['1a', '30c', '  4 abc ', 'xyz', '21d', '100000xy']
    oout[k] = ['  4 abc ', '100000xy', '1a', '21d', '30c', 'xyz']
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 7
        let r = arrSort(oin[k])
        console.log('r', r)
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 8
    oin[k] = [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }]
    oout[k] = [
        { s: 'March', i: 1 },
        { s: 'Jan', i: 4 },
        { s: 'Dec', i: 30 },
        { s: 'Feb', i: 100000 }
    ]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 'i' }`, function() {
        k = 8
        let r = arrSort(oin[k], { compareKey: 'i' })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 9
    oin[k] = [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }]
    oout[k] = [
        { s: 'Dec', i: 30 },
        { s: 'Feb', i: 100000 },
        { s: 'Jan', i: 4 },
        { s: 'March', i: 1 }
    ]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's' }`, function() {
        k = 9
        let r = arrSort(oin[k], { compareKey: 's' })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 10
    oin[k] = [{ s: 'abc1', i: 1, }, { s: 'abc', i: -1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }]
    oout[k] = [
        { s: 'abc', i: -1 },
        { s: 'abc1', i: 1 },
        { s: 'abc100000', i: 30 },
        { s: 'abc30', i: 4 },
        { s: 'abc4', i: 100000 }
    ]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's' }`, function() {
        k = 10
        let r = arrSort(oin[k], { compareKey: 's' })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 11
    oin[k] = [{ s: 'abc1', i: 1, }, { s: 'abc', i: -1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }]
    oout[k] = [
        { s: 'abc', i: -1 },
        { s: 'abc1', i: 1 },
        { s: 'abc4', i: 100000 },
        { s: 'abc30', i: 4 },
        { s: 'abc100000', i: 30 }
    ]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's', localeCompare: true }`, function() {
        k = 11
        let r = arrSort(oin[k], { compareKey: 's', localeCompare: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 12
    oin[k] = [{ s: '中文1', i: 1, }, { s: '中文', i: -1, }, { s: '中文30', i: 4, }, { s: '中文4', i: 100000, }, { s: '中文100000', i: 30, }]
    oout[k] = [
        { s: '中文', i: -1 },
        { s: '中文1', i: 1 },
        { s: '中文4', i: 100000 },
        { s: '中文30', i: 4 },
        { s: '中文100000', i: 30 }
    ]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's', localeCompare: true }`, function() {
        k = 12
        let r = arrSort(oin[k], { compareKey: 's', localeCompare: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 13
    oin[k] = [{ s: 'xyz.txt', i: 100, }, { s: 'abc1.txt', i: 1, }, { s: 'abc.txt', i: -1, }, { s: 'abc', i: -2, }, { s: 'abc30.txt', i: 4, }, { s: 'abc4.txt', i: 100000, }, { s: 'abc100000.txt', i: 30, }]
    oout[k] = [
        { s: 'abc', i: -2 },
        { s: 'abc.txt', i: -1 },
        { s: 'abc1.txt', i: 1 },
        { s: 'abc4.txt', i: 100000 },
        { s: 'abc30.txt', i: 4 },
        { s: 'abc100000.txt', i: 30 },
        { s: 'xyz.txt', i: 100 }
    ]
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's', localeCompare: true }`, function() {
        k = 13
        let r = arrSort(oin[k], { compareKey: 's', localeCompare: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 1`, function() {
        let r = arrSort([1, 2, 3, '4', 5, 'abc'], 1)
        let rr = [1, 2, 3, '4', 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 'abc', 5, 3, '4'], 1`, function() {
        let r = arrSort([1, 2, 'abc', 5, 3, '4'], 1)
        let rr = [1, 2, 3, '4', 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrSort(['abc'], '')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrSort(['abc'], [])
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrSort(['abc'], {})
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrSort(['abc'], null)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrSort(['abc'], undefined)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrSort([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrSort([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrSort([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrSort([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrSort([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrSort('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrSort([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrSort({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrSort(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrSort(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrSort(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //--- 無法轉數字或無法解析者放最末 ---

    it(`should sort numbers numerically and put what cannot be converted or parsed last in original order`, function() {
        //數字依數值; 非數字字串其次; 空字串、純空白字串、null等無法排序者放最末且維持原順序
        let r = arrSort([10, '', 9, 'N/A', ' ', null, 100])
        let rr = [9, 10, 100, 'N/A', '', ' ', null]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep numeric sorting for a column of numbers or numeric strings with blank cells`, function() {
        //網頁輸入、表格轉存之數值欄常含空格: 數字不退回字典序(10在9之後), 空格在最後
        let r = [
            arrSort([10, ' ', 9]),
            arrSort(['10', '9', ' ']),
            arrSort([10, 9, -1, '']),
            arrSort(['10', '', '9', '\t']),
        ]
        let rr = [
            [9, 10, ' '],
            ['9', '10', ' '],
            [-1, 9, 10, ''],
            ['9', '10', '', '\t'],
        ]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should put strings after numbers, sorting those with numbers inside by their numbers`, function() {
        let r = [
            arrSort([5, 'abc10', 'abc3']),
            arrSort(['b', ' ', 'a']),
            arrSort(['abc1', 'abc30', ' ', 'abc4']),
        ]
        let rr = [
            [5, 'abc3', 'abc10'],
            ['a', 'b', ' '],
            ['abc1', 'abc4', 'abc30', ' '],
        ]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should put values of other types last instead of returning []`, function() {
        //原本非同質陣列回傳[](資料遺失), 改為可排序者排序、其餘放最末
        let o = { a: 1 }
        let r = arrSort([3, o, 1, true, undefined, NaN, [2]])
        let rr = [1, 3, o, true, undefined, NaN, [2]]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return the indexes with what cannot be sorted last when returnIndex`, function() {
        let r = [
            arrSort([10, ' ', 9], { returnIndex: true }),
            arrSort([7], { returnIndex: true }),
        ]
        let rr = [
            [2, 0, 1],
            [0],
        ]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should put objects whose compareKey value cannot be sorted last`, function() {
        let r = arrSort([{ i: 10 }, { s: 'x' }, { i: 9 }, { i: ' ' }], { compareKey: 'i' })
        let rr = [{ i: 9 }, { i: 10 }, { s: 'x' }, { i: ' ' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should put what cannot be sorted last when localeCompare`, function() {
        let r = arrSort(['b10', ' ', 'b9', null, 'a'], { localeCompare: true })
        let rr = ['a', 'b9', 'b10', ' ', null]
        assert.strict.deepStrictEqual(r, rr)
    })

})
