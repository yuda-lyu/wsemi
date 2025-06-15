import assert from 'assert'
import estimateTicks from '../src/estimateTicks.mjs'


describe(`estimateTicks`, function() {

    it(`should return { tickNum: 3, tickInterval: 0.8, tickPositions: [ -4.7, -3.9, -3.1 ] } when input -4.66, -3.11`, function() {
        let r = estimateTicks(-4.66, -3.11)
        let rr = { tickNum: 3, tickInterval: 0.8, tickPositions: [-4.7, -3.9, -3.1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ] } when input 0, 0.9`, function() {
        let r = estimateTicks(0, 0.9)
        let rr = { tickNum: 3, tickInterval: 0.5, tickPositions: [0, 0.5, 1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ] } when input 0, 1`, function() {
        let r = estimateTicks(0, 1)
        let rr = { tickNum: 3, tickInterval: 0.5, tickPositions: [0, 0.5, 1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] } when input 0, 99`, function() {
        let r = estimateTicks(0, 99)
        let rr = { tickNum: 3, tickInterval: 50, tickPositions: [0, 50, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] } when input 0, 100`, function() {
        let r = estimateTicks(0, 100)
        let rr = { tickNum: 3, tickInterval: 50, tickPositions: [0, 50, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.4, tickPositions: [ 0.1, 0.5, 0.9 ] } when input 0.1, 0.9`, function() {
        let r = estimateTicks(0.1, 0.9)
        let rr = { tickNum: 3, tickInterval: 0.4, tickPositions: [0.1, 0.5, 0.9] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ] } when input 0.1, 1`, function() {
        let r = estimateTicks(0.1, 1)
        let rr = { tickNum: 3, tickInterval: 0.5, tickPositions: [0, 0.5, 1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] } when input 0.1, 99`, function() {
        let r = estimateTicks(0.1, 99)
        let rr = { tickNum: 3, tickInterval: 50, tickPositions: [0, 50, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] } when input 0.1, 100`, function() {
        let r = estimateTicks(0.1, 100)
        let rr = { tickNum: 3, tickInterval: 50, tickPositions: [0, 50, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 4, tickInterval: 34, tickPositions: [ 0, 34, 68, 102 ] } when input 0.1, 100.1`, function() {
        let r = estimateTicks(0.1, 100.1)
        let rr = { tickNum: 4, tickInterval: 34, tickPositions: [0, 34, 68, 102] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.01, tickPositions: [ 0.88, 0.89, 0.9 ] } when input 0.89, 0.9`, function() {
        let r = estimateTicks(0.89, 0.9)
        let rr = { tickNum: 3, tickInterval: 0.01, tickPositions: [0.88, 0.89, 0.9] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.1, tickPositions: [ 0.8, 0.9, 1 ] } when input 0.89, 1`, function() {
        let r = estimateTicks(0.89, 1)
        let rr = { tickNum: 3, tickInterval: 0.1, tickPositions: [0.8, 0.9, 1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] } when input 0.89, 99`, function() {
        let r = estimateTicks(0.89, 99)
        let rr = { tickNum: 3, tickInterval: 50, tickPositions: [0, 50, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] } when input 0.89, 100`, function() {
        let r = estimateTicks(0.89, 100)
        let rr = { tickNum: 3, tickInterval: 50, tickPositions: [0, 50, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 4, tickInterval: 34, tickPositions: [ 0, 34, 68, 102 ] } when input 0.89, 100.89`, function() {
        let r = estimateTicks(0.89, 100.89)
        let rr = { tickNum: 4, tickInterval: 34, tickPositions: [0, 34, 68, 102] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 25, tickPositions: [ 50, 75, 100 ] } when input 50.89, 99`, function() {
        let r = estimateTicks(50.89, 99)
        let rr = { tickNum: 3, tickInterval: 25, tickPositions: [50, 75, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 25, tickPositions: [ 50, 75, 100 ] } when input 50.89, 100`, function() {
        let r = estimateTicks(50.89, 100)
        let rr = { tickNum: 3, tickInterval: 25, tickPositions: [50, 75, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 4, tickInterval: 3, tickPositions: [ 90, 93, 96, 99 ] } when input 90.89, 99`, function() {
        let r = estimateTicks(90.89, 99)
        let rr = { tickNum: 4, tickInterval: 3, tickPositions: [90, 93, 96, 99] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 5, tickPositions: [ 90, 95, 100 ] } when input 90.89, 100`, function() {
        let r = estimateTicks(90.89, 100)
        let rr = { tickNum: 3, tickInterval: 5, tickPositions: [90, 95, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 1, tickPositions: [ 98, 99, 100 ] } when input 98.9, 99`, function() {
        let r = estimateTicks(98.9, 99)
        let rr = { tickNum: 3, tickInterval: 1, tickPositions: [98, 99, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 1, tickPositions: [ 98, 99, 100 ] } when input 98.9, 100`, function() {
        let r = estimateTicks(98.9, 100)
        let rr = { tickNum: 3, tickInterval: 1, tickPositions: [98, 99, 100] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 1, tickPositions: [ -1, 0, 1 ] } when input 0, 0`, function() {
        let r = estimateTicks(0, 0)
        let rr = { tickNum: 3, tickInterval: 1, tickPositions: [-1, 0, 1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.1, tickPositions: [ 0.9, 1, 1.1 ] } when input 1, 1`, function() {
        let r = estimateTicks(1, 1)
        let rr = { tickNum: 3, tickInterval: 0.1, tickPositions: [0.9, 1, 1.1] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { tickNum: 3, tickInterval: 0.1, tickPositions: [ -1.1, -1, -0.9 ] } when input -1, -1`, function() {
        let r = estimateTicks(-1, -1)
        let rr = { tickNum: 3, tickInterval: 0.1, tickPositions: [-1.1, -1, -0.9] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin[1] > rmax[-1]' when input 1, -1`, function() {
        let r = ''
        try {
            r = estimateTicks(1, -1)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin[1] > rmax[-1]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input ''`, function() {
        let r = ''
        try {
            r = estimateTicks('')
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input false`, function() {
        let r = ''
        try {
            r = estimateTicks(false)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input []`, function() {
        let r = ''
        try {
            r = estimateTicks([])
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input {}`, function() {
        let r = ''
        try {
            r = estimateTicks({})
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input null`, function() {
        let r = ''
        try {
            r = estimateTicks(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input undefined`, function() {
        let r = ''
        try {
            r = estimateTicks(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rmin is not a number' when input NaN`, function() {
        let r = ''
        try {
            r = estimateTicks(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'rmin is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

})
