import assert from 'assert'
import arrReduce from '../src/arrReduce.mjs'


describe(`arrReduce`, function() {
    let k
    let oin = {}
    let oinf = {}
    let oout = {}


    k = 1
    oin[k] = [100000, 1, 30, 4, 21]
    oinf[k] = (vTemp, vNow) => {
        if (vTemp === null) {
            return vNow
        }
        return Math.min(vTemp, vNow)
    }
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, ${oinf[k].toString()}`, function() {
        k = 1
        let r = arrReduce(oin[k], oinf[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })


    k = 2
    oin[k] = [1, 30, 4, 21, 100000]
    oinf[k] = (vTemp, vNow) => {
        if (vTemp === null) {
            return vNow
        }
        return Math.max(vTemp, vNow)
    }
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, ${oinf[k].toString()}`, function() {
        k = 2
        let r = arrReduce(oin[k], oinf[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    oin[k] = [1, 30, 4, 100000, 21]
    oinf[k] = (vTemp, vNow) => {
        if (vTemp === null) {
            return vNow
        }
        return Math.max(vTemp, vNow)
    }
    oout[k] = 3
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, ${oinf[k].toString()}`, function() {
        k = 3
        let r = arrReduce(oin[k], oinf[k], { returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 25, }]
    oinf[k] = (vTemp, vNow) => {
        if (vTemp === null) {
            return vNow.i
        }
        return Math.min(vTemp, vNow.i)
    }
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, ${oinf[k].toString()}`, function() {
        k = 4
        let r = arrReduce(oin[k], oinf[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 25, }]
    oinf[k] = (vTemp, vNow) => {
        if (vTemp === null) {
            return vNow
        }
        return vTemp.i < vNow.i ? vNow : vTemp //max
    }
    oout[k] = { s: 'Feb', i: 100000 }
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, ${oinf[k].toString()}`, function() {
        k = 5
        let r = arrReduce(oin[k], oinf[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 25, }]
    oinf[k] = (vTemp, vNow) => {
        if (vTemp === null) {
            return vNow
        }
        return vTemp.i < vNow.i ? vNow : vTemp //max
    }
    oout[k] = 2
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, ${oinf[k].toString()}`, function() {
        k = 6
        let r = arrReduce(oin[k], oinf[k], { returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], ''`, function() {
        let r = arrReduce(['123'], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], []`, function() {
        let r = arrReduce(['123'], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], {}`, function() {
        let r = arrReduce(['123'], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], null`, function() {
        let r = arrReduce(['123'], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], undefined`, function() {
        let r = arrReduce(['123'], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrReduce(['abc'], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrReduce(['abc'], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrReduce(['abc'], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrReduce(['abc'], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrReduce(['abc'], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrReduce([], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrReduce([], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrReduce([], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrReduce([], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrReduce([], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrReduce('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrReduce([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrReduce({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrReduce(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrReduce(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrReduce(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
