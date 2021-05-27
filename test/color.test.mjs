import assert from 'assert'
import oc from '../src/color.mjs'


describe(`color`, function() {

    it(`should return 'rgba(135, 206, 235, 1)' when toRgbaString input 'skyblue'`, function() {
        let r = oc.toRgbaString('skyblue')
        let rr = 'rgba(135, 206, 235, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 0, 1)' when toRgbaString input 'rgb (255, 0, 0)'`, function() {
        let r = oc.toRgbaString('rgb (255, 0, 0)')
        let rr = 'rgba(255, 0, 0, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 200, 30, 1)' when toRgbaString input 'rgb (255 200 30)'`, function() {
        let r = oc.toRgbaString('rgb (255 200 30)')
        let rr = 'rgba(255, 200, 30, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 1)' when toRgbaString input 'rgb (50% 12% 8%)'`, function() {
        let r = oc.toRgbaString('rgb (50% 12% 8%)')
        let rr = 'rgba(128, 31, 20, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 0, 1)' when toRgbaString input 'rgb 255, 0, 0'`, function() {
        let r = oc.toRgbaString('rgb 255, 0, 0')
        let rr = 'rgba(255, 0, 0, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 200, 30, 1)' when toRgbaString input 'rgb 255 200 30'`, function() {
        let r = oc.toRgbaString('rgb 255 200 30')
        let rr = 'rgba(255, 200, 30, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 1)' when toRgbaString input 'rgb 50%, 12%, 8%'`, function() {
        let r = oc.toRgbaString('rgb 50%, 12%, 8%')
        let rr = 'rgba(128, 31, 20, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 1)' when toRgbaString input 'rgb 50% 12% 8%'`, function() {
        let r = oc.toRgbaString('rgb 50% 12% 8%')
        let rr = 'rgba(128, 31, 20, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 0, 0.1)' when toRgbaString input 'rgba (255, 0, 0, 0.1)'`, function() {
        let r = oc.toRgbaString('rgba (255, 0, 0, 0.1)')
        let rr = 'rgba(255, 0, 0, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 200, 30, 0.1)' when toRgbaString input 'rgba (255 200 30 0.1)'`, function() {
        let r = oc.toRgbaString('rgba (255 200 30 0.1)')
        let rr = 'rgba(255, 200, 30, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 0.1)' when toRgbaString input 'rgba (50%, 12%, 8%, 0.1)'`, function() {
        let r = oc.toRgbaString('rgba (50%, 12%, 8%, 0.1)')
        let rr = 'rgba(128, 31, 20, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 0.1)' when toRgbaString input 'rgba (50% 12% 8% 0.1)'`, function() {
        let r = oc.toRgbaString('rgba (50% 12% 8% 0.1)')
        let rr = 'rgba(128, 31, 20, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 0, 0.1)' when toRgbaString input 'rgba 255, 0, 0, 0.1'`, function() {
        let r = oc.toRgbaString('rgba 255, 0, 0, 0.1')
        let rr = 'rgba(255, 0, 0, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 200, 30, 0.1)' when toRgbaString input 'rgba 255 200 30 0.1'`, function() {
        let r = oc.toRgbaString('rgba 255 200 30 0.1')
        let rr = 'rgba(255, 200, 30, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 0.1)' when toRgbaString input 'rgba 50%, 12%, 8%, 0.1'`, function() {
        let r = oc.toRgbaString('rgba 50%, 12%, 8%, 0.1')
        let rr = 'rgba(128, 31, 20, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 0.123)' when toRgbaString input 'rgba 50% 12% 8% 0.123456'`, function() {
        let r = oc.toRgbaString('rgba 50% 12% 8% 0.123456')
        let rr = 'rgba(128, 31, 20, 0.123)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl (320, 100%, 50%)'`, function() {
        let r = oc.toRgbaString('hsl (320, 100%, 50%)')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl (320 100% 50%)'`, function() {
        let r = oc.toRgbaString('hsl (320 100% 50%)')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl (320, 1, 0.5)'`, function() {
        let r = oc.toRgbaString('hsl (320, 1, 0.5)')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl (320 1 0.5)'`, function() {
        let r = oc.toRgbaString('hsl (320 1 0.5)')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl 320, 100%, 50%'`, function() {
        let r = oc.toRgbaString('hsl 320, 100%, 50%')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl 320 100% 50%'`, function() {
        let r = oc.toRgbaString('hsl 320 100% 50%')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl 320, 1, 0.5'`, function() {
        let r = oc.toRgbaString('hsl 320, 1, 0.5')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 1)' when toRgbaString input 'hsl 320 1 0.5'`, function() {
        let r = oc.toRgbaString('hsl 320 1 0.5')
        let rr = 'rgba(255, 0, 170, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla (320, 100%, 50%, 0.1)'`, function() {
        let r = oc.toRgbaString('hsla (320, 100%, 50%, 0.1)')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla (320 100% 50% 0.1)'`, function() {
        let r = oc.toRgbaString('hsla (320 100% 50% 0.1)')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla (320, 1, 0.5, 0.1)'`, function() {
        let r = oc.toRgbaString('hsla (320, 1, 0.5, 0.1)')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla (320 1 0.5 0.1)'`, function() {
        let r = oc.toRgbaString('hsla (320 1 0.5 0.1)')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla 320, 100%, 50%, 0.1'`, function() {
        let r = oc.toRgbaString('hsla 320, 100%, 50%, 0.1')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla 320 100% 50% 0.1'`, function() {
        let r = oc.toRgbaString('hsla 320 100% 50% 0.1')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla 320, 1, 0.5, 0.1'`, function() {
        let r = oc.toRgbaString('hsla 320, 1, 0.5, 0.1')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 0, 170, 0.1)' when toRgbaString input 'hsla 320 1 0.5 0.1'`, function() {
        let r = oc.toRgbaString('hsla 320 1 0.5 0.1')
        let rr = 'rgba(255, 0, 170, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv (320, 100%, 50%)'`, function() {
        let r = oc.toRgbaString('hsv (320, 100%, 50%)')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv (320 100% 50%)'`, function() {
        let r = oc.toRgbaString('hsv (320 100% 50%)')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv (320, 1, 0.5)'`, function() {
        let r = oc.toRgbaString('hsv (320, 1, 0.5)')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv (320 1 0.5)'`, function() {
        let r = oc.toRgbaString('hsv (320 1 0.5)')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv 320, 100%, 50%'`, function() {
        let r = oc.toRgbaString('hsv 320, 100%, 50%')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv 320 100% 50%'`, function() {
        let r = oc.toRgbaString('hsv 320 100% 50%')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv 320, 1, 0.5'`, function() {
        let r = oc.toRgbaString('hsv 320, 1, 0.5')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 1)' when toRgbaString input 'hsv 320 1 0.5'`, function() {
        let r = oc.toRgbaString('hsv 320 1 0.5')
        let rr = 'rgba(128, 0, 85, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva (320, 100%, 50%, 0.1)'`, function() {
        let r = oc.toRgbaString('hsva (320, 100%, 50%, 0.1)')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva (320 100% 50% 0.1)'`, function() {
        let r = oc.toRgbaString('hsva (320 100% 50% 0.1)')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva (320, 1, 0.5, 0.1)'`, function() {
        let r = oc.toRgbaString('hsva (320, 1, 0.5, 0.1)')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva (320 1 0.5 0.1)'`, function() {
        let r = oc.toRgbaString('hsva (320 1 0.5 0.1)')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva 320, 100%, 50%, 0.1'`, function() {
        let r = oc.toRgbaString('hsva 320, 100%, 50%, 0.1')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva 320 100% 50% 0.1'`, function() {
        let r = oc.toRgbaString('hsva 320 100% 50% 0.1')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva 320, 1, 0.5, 0.1'`, function() {
        let r = oc.toRgbaString('hsva 320, 1, 0.5, 0.1')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 0, 85, 0.1)' when toRgbaString input 'hsva 320 1 0.5 0.1'`, function() {
        let r = oc.toRgbaString('hsva 320 1 0.5 0.1')
        let rr = 'rgba(128, 0, 85, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 1, 0, 1)' when toRgbaString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toRgbaString({ r: 255, g: 150, b: 50 })
        let rr = 'rgba(1, 1, 0, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 1, 0, 1)' when toRgbaString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toRgbaString({ R: 255, G: 150, B: 50 })
        let rr = 'rgba(1, 1, 0, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 1, 0, 1)' when toRgbaString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: 150, b: 50 })
        let rr = 'rgba(1, 1, 0, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 0, 0, 1)' when toRgbaString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: '12%', b: '8%' })
        let rr = 'rgba(1, 0, 0, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 1, 0, 0.1)' when toRgbaString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = 'rgba(1, 1, 0, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 1, 0, 0.1)' when toRgbaString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toRgbaString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = 'rgba(1, 1, 0, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 1, 0, 0.1)' when toRgbaString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = 'rgba(1, 1, 0, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(1, 0, 0, 0.1)' when toRgbaString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = 'rgba(1, 0, 0, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(46, 31, 31, 1)' when toRgbaString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, l: 0.15 })
        let rr = 'rgba(46, 31, 31, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(46, 31, 31, 1)' when toRgbaString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, L: 0.15 })
        let rr = 'rgba(46, 31, 31, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(23, 18, 18, 1)' when toRgbaString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', l: '8%' })
        let rr = 'rgba(23, 18, 18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(46, 31, 31, 1)' when toRgbaString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = 'rgba(46, 31, 31, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(23, 18, 18, 1)' when toRgbaString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', l: '8%' })
        let rr = 'rgba(23, 18, 18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(46, 31, 31, 0.1)' when toRgbaString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'rgba(46, 31, 31, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(46, 31, 31, 0.1)' when toRgbaString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = 'rgba(46, 31, 31, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(23, 18, 18, 0.1)' when toRgbaString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = 'rgba(23, 18, 18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(46, 31, 31, 0.1)' when toRgbaString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'rgba(46, 31, 31, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(23, 18, 18, 0.1)' when toRgbaString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = 'rgba(23, 18, 18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(38, 31, 31, 1)' when toRgbaString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, v: 0.15 })
        let rr = 'rgba(38, 31, 31, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(38, 31, 31, 1)' when toRgbaString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, V: 0.15 })
        let rr = 'rgba(38, 31, 31, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(20, 18, 18, 1)' when toRgbaString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', v: '8%' })
        let rr = 'rgba(20, 18, 18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(38, 31, 31, 1)' when toRgbaString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = 'rgba(38, 31, 31, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(20, 18, 18, 1)' when toRgbaString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', v: '8%' })
        let rr = 'rgba(20, 18, 18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(38, 31, 31, 0.1)' when toRgbaString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'rgba(38, 31, 31, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(38, 31, 31, 0.1)' when toRgbaString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = 'rgba(38, 31, 31, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(20, 18, 18, 0.1)' when toRgbaString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = 'rgba(20, 18, 18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(38, 31, 31, 0.1)' when toRgbaString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'rgba(38, 31, 31, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(20, 18, 18, 0.1)' when toRgbaString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = 'rgba(20, 18, 18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(45, 45, 45, 1)' when toRgbaString input '#2d'`, function() {
        let r = oc.toRgbaString('#2d')
        let rr = 'rgba(45, 45, 45, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(170, 187, 204, 1)' when toRgbaString input '#abc'`, function() {
        let r = oc.toRgbaString('#abc')
        let rr = 'rgba(170, 187, 204, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(170, 187, 204, 1)' when toRgbaString input '#ABC'`, function() {
        let r = oc.toRgbaString('#ABC')
        let rr = 'rgba(170, 187, 204, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(240, 160, 246, 1)' when toRgbaString input '#f0a0f6'`, function() {
        let r = oc.toRgbaString('#f0a0f6')
        let rr = 'rgba(240, 160, 246, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(240, 160, 246, 1)' when toRgbaString input '#F0a0f6'`, function() {
        let r = oc.toRgbaString('#F0a0f6')
        let rr = 'rgba(240, 160, 246, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(240, 160, 246, 0.784)' when toRgbaString input '#f0a0f6c8'`, function() {
        let r = oc.toRgbaString('#f0a0f6c8')
        let rr = 'rgba(240, 160, 246, 0.784)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(240, 160, 246, 0.784)' when toRgbaString input '#f0A0f6c8'`, function() {
        let r = oc.toRgbaString('#f0A0f6c8')
        let rr = 'rgba(240, 160, 246, 0.784)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 1, 0.5, 1)' when toHslaString input 'rgb (255, 0, 0)'`, function() {
        let r = oc.toHslaString('rgb (255, 0, 0)')
        let rr = 'hsla(0, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(45, 1, 0.559, 1)' when toHslaString input 'rgb (255 200 30)'`, function() {
        let r = oc.toHslaString('rgb (255 200 30)')
        let rr = 'hsla(45, 1, 0.559, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 1)' when toHslaString input 'rgb (50% 12% 8%)'`, function() {
        let r = oc.toHslaString('rgb (50% 12% 8%)')
        let rr = 'hsla(6, 0.724, 0.29, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 1, 0.5, 1)' when toHslaString input 'rgb 255, 0, 0'`, function() {
        let r = oc.toHslaString('rgb 255, 0, 0')
        let rr = 'hsla(0, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(45, 1, 0.559, 1)' when toHslaString input 'rgb 255 200 30'`, function() {
        let r = oc.toHslaString('rgb 255 200 30')
        let rr = 'hsla(45, 1, 0.559, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 1)' when toHslaString input 'rgb 50%, 12%, 8%'`, function() {
        let r = oc.toHslaString('rgb 50%, 12%, 8%')
        let rr = 'hsla(6, 0.724, 0.29, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 1)' when toHslaString input 'rgb 50% 12% 8%'`, function() {
        let r = oc.toHslaString('rgb 50% 12% 8%')
        let rr = 'hsla(6, 0.724, 0.29, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 1, 0.5, 0.1)' when toHslaString input 'rgba (255, 0, 0, 0.1)'`, function() {
        let r = oc.toHslaString('rgba (255, 0, 0, 0.1)')
        let rr = 'hsla(0, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(45, 1, 0.559, 0.1)' when toHslaString input 'rgba (255 200 30 0.1)'`, function() {
        let r = oc.toHslaString('rgba (255 200 30 0.1)')
        let rr = 'hsla(45, 1, 0.559, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 0.1)' when toHslaString input 'rgba (50%, 12%, 8%, 0.1)'`, function() {
        let r = oc.toHslaString('rgba (50%, 12%, 8%, 0.1)')
        let rr = 'hsla(6, 0.724, 0.29, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 0.1)' when toHslaString input 'rgba (50% 12% 8% 0.1)'`, function() {
        let r = oc.toHslaString('rgba (50% 12% 8% 0.1)')
        let rr = 'hsla(6, 0.724, 0.29, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 1, 0.5, 0.1)' when toHslaString input 'rgba 255, 0, 0, 0.1'`, function() {
        let r = oc.toHslaString('rgba 255, 0, 0, 0.1')
        let rr = 'hsla(0, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(45, 1, 0.559, 0.1)' when toHslaString input 'rgba 255 200 30 0.1'`, function() {
        let r = oc.toHslaString('rgba 255 200 30 0.1')
        let rr = 'hsla(45, 1, 0.559, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 0.1)' when toHslaString input 'rgba 50%, 12%, 8%, 0.1'`, function() {
        let r = oc.toHslaString('rgba 50%, 12%, 8%, 0.1')
        let rr = 'hsla(6, 0.724, 0.29, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 0.123)' when toHslaString input 'rgba 50% 12% 8% 0.123456'`, function() {
        let r = oc.toHslaString('rgba 50% 12% 8% 0.123456')
        let rr = 'hsla(6, 0.724, 0.29, 0.123)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv (320, 100%, 50%)'`, function() {
        let r = oc.toHslaString('hsv (320, 100%, 50%)')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv (320 100% 50%)'`, function() {
        let r = oc.toHslaString('hsv (320 100% 50%)')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv (320, 1, 0.5)'`, function() {
        let r = oc.toHslaString('hsv (320, 1, 0.5)')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv (320 1 0.5)'`, function() {
        let r = oc.toHslaString('hsv (320 1 0.5)')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv 320, 100%, 50%'`, function() {
        let r = oc.toHslaString('hsv 320, 100%, 50%')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv 320 100% 50%'`, function() {
        let r = oc.toHslaString('hsv 320 100% 50%')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv 320, 1, 0.5'`, function() {
        let r = oc.toHslaString('hsv 320, 1, 0.5')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 1)' when toHslaString input 'hsv 320 1 0.5'`, function() {
        let r = oc.toHslaString('hsv 320 1 0.5')
        let rr = 'hsla(320, 1, 0.25, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva (320, 100%, 50%, 0.1)'`, function() {
        let r = oc.toHslaString('hsva (320, 100%, 50%, 0.1)')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva (320 100% 50% 0.1)'`, function() {
        let r = oc.toHslaString('hsva (320 100% 50% 0.1)')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva (320, 1, 0.5, 0.1)'`, function() {
        let r = oc.toHslaString('hsva (320, 1, 0.5, 0.1)')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva (320 1 0.5 0.1)'`, function() {
        let r = oc.toHslaString('hsva (320 1 0.5 0.1)')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva 320, 100%, 50%, 0.1'`, function() {
        let r = oc.toHslaString('hsva 320, 100%, 50%, 0.1')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva 320 100% 50% 0.1'`, function() {
        let r = oc.toHslaString('hsva 320 100% 50% 0.1')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva 320, 1, 0.5, 0.1'`, function() {
        let r = oc.toHslaString('hsva 320, 1, 0.5, 0.1')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(320, 1, 0.25, 0.1)' when toHslaString input 'hsva 320 1 0.5 0.1'`, function() {
        let r = oc.toHslaString('hsva 320 1 0.5 0.1')
        let rr = 'hsla(320, 1, 0.25, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 0.672, 0.002, 1)' when toHslaString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toHslaString({ r: 255, g: 150, b: 50 })
        let rr = 'hsla(29, 0.672, 0.002, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 0.672, 0.002, 1)' when toHslaString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toHslaString({ R: 255, G: 150, B: 50 })
        let rr = 'hsla(29, 0.672, 0.002, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(74, 0.5, 0.002, 1)' when toHslaString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toHslaString({ r: '50%', g: 150, b: 50 })
        let rr = 'hsla(74, 0.5, 0.002, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.001, 1)' when toHslaString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toHslaString({ r: '50%', g: '12%', b: '8%' })
        let rr = 'hsla(6, 0.724, 0.001, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 0.672, 0.002, 0.1)' when toHslaString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHslaString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = 'hsla(29, 0.672, 0.002, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 0.672, 0.002, 0.1)' when toHslaString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toHslaString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = 'hsla(29, 0.672, 0.002, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(74, 0.5, 0.002, 0.1)' when toHslaString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHslaString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = 'hsla(74, 0.5, 0.002, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.001, 0.1)' when toHslaString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = 'hsla(6, 0.724, 0.001, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.2, 0.15, 1)' when toHslaString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, l: 0.15 })
        let rr = 'hsla(1, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.2, 0.15, 1)' when toHslaString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, L: 0.15 })
        let rr = 'hsla(1, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.12, 0.08, 1)' when toHslaString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', l: '8%' })
        let rr = 'hsla(1, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.2, 0.15, 1)' when toHslaString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = 'hsla(1, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 0.12, 0.08, 1)' when toHslaString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', l: '8%' })
        let rr = 'hsla(0, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.2, 0.15, 0.1)' when toHslaString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsla(1, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.2, 0.15, 0.1)' when toHslaString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = 'hsla(1, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.12, 0.08, 0.1)' when toHslaString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsla(1, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.2, 0.15, 0.1)' when toHslaString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsla(1, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 0.12, 0.08, 0.1)' when toHslaString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsla(0, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.111, 0.135, 1)' when toHslaString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, v: 0.15 })
        let rr = 'hsla(1, 0.111, 0.135, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.111, 0.135, 1)' when toHslaString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, V: 0.15 })
        let rr = 'hsla(1, 0.111, 0.135, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.064, 0.075, 1)' when toHslaString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', v: '8%' })
        let rr = 'hsla(1, 0.064, 0.075, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.111, 0.135, 1)' when toHslaString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = 'hsla(1, 0.111, 0.135, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 0.064, 0.075, 1)' when toHslaString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', v: '8%' })
        let rr = 'hsla(0, 0.064, 0.075, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.111, 0.135, 0.1)' when toHslaString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsla(1, 0.111, 0.135, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.111, 0.135, 0.1)' when toHslaString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = 'hsla(1, 0.111, 0.135, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.064, 0.075, 0.1)' when toHslaString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsla(1, 0.064, 0.075, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(1, 0.111, 0.135, 0.1)' when toHslaString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsla(1, 0.111, 0.135, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 0.064, 0.075, 0.1)' when toHslaString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsla(0, 0.064, 0.075, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(0, 0, 0.176, 1)' when toHslaString input '#2d'`, function() {
        let r = oc.toHslaString('#2d')
        let rr = 'hsla(0, 0, 0.176, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(210, 0.25, 0.733, 1)' when toHslaString input '#abc'`, function() {
        let r = oc.toHslaString('#abc')
        let rr = 'hsla(210, 0.25, 0.733, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(210, 0.25, 0.733, 1)' when toHslaString input '#ABC'`, function() {
        let r = oc.toHslaString('#ABC')
        let rr = 'hsla(210, 0.25, 0.733, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(296, 0.827, 0.796, 1)' when toHslaString input '#f0a0f6'`, function() {
        let r = oc.toHslaString('#f0a0f6')
        let rr = 'hsla(296, 0.827, 0.796, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(296, 0.827, 0.796, 1)' when toHslaString input '#F0a0f6'`, function() {
        let r = oc.toHslaString('#F0a0f6')
        let rr = 'hsla(296, 0.827, 0.796, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(296, 0.827, 0.796, 0.784)' when toHslaString input '#f0a0f6c8'`, function() {
        let r = oc.toHslaString('#f0a0f6c8')
        let rr = 'hsla(296, 0.827, 0.796, 0.784)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(296, 0.827, 0.796, 0.784)' when toHslaString input '#f0A0f6c8'`, function() {
        let r = oc.toHslaString('#f0A0f6c8')
        let rr = 'hsla(296, 0.827, 0.796, 0.784)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 1, 1, 1)' when toHsvaString input 'rgb (255, 0, 0)'`, function() {
        let r = oc.toHsvaString('rgb (255, 0, 0)')
        let rr = 'hsva(0, 1, 1, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(45, 0.882, 1, 1)' when toHsvaString input 'rgb (255 200 30)'`, function() {
        let r = oc.toHsvaString('rgb (255 200 30)')
        let rr = 'hsva(45, 0.882, 1, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 1)' when toHsvaString input 'rgb (50% 12% 8%)'`, function() {
        let r = oc.toHsvaString('rgb (50% 12% 8%)')
        let rr = 'hsva(6, 0.84, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 1, 1, 1)' when toHsvaString input 'rgb 255, 0, 0'`, function() {
        let r = oc.toHsvaString('rgb 255, 0, 0')
        let rr = 'hsva(0, 1, 1, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(45, 0.882, 1, 1)' when toHsvaString input 'rgb 255 200 30'`, function() {
        let r = oc.toHsvaString('rgb 255 200 30')
        let rr = 'hsva(45, 0.882, 1, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 1)' when toHsvaString input 'rgb 50%, 12%, 8%'`, function() {
        let r = oc.toHsvaString('rgb 50%, 12%, 8%')
        let rr = 'hsva(6, 0.84, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 1)' when toHsvaString input 'rgb 50% 12% 8%'`, function() {
        let r = oc.toHsvaString('rgb 50% 12% 8%')
        let rr = 'hsva(6, 0.84, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 1, 1, 0.1)' when toHsvaString input 'rgba (255, 0, 0, 0.1)'`, function() {
        let r = oc.toHsvaString('rgba (255, 0, 0, 0.1)')
        let rr = 'hsva(0, 1, 1, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(45, 0.882, 1, 0.1)' when toHsvaString input 'rgba (255 200 30 0.1)'`, function() {
        let r = oc.toHsvaString('rgba (255 200 30 0.1)')
        let rr = 'hsva(45, 0.882, 1, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 0.1)' when toHsvaString input 'rgba (50%, 12%, 8%, 0.1)'`, function() {
        let r = oc.toHsvaString('rgba (50%, 12%, 8%, 0.1)')
        let rr = 'hsva(6, 0.84, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 0.1)' when toHsvaString input 'rgba (50% 12% 8% 0.1)'`, function() {
        let r = oc.toHsvaString('rgba (50% 12% 8% 0.1)')
        let rr = 'hsva(6, 0.84, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 1, 1, 0.1)' when toHsvaString input 'rgba 255, 0, 0, 0.1'`, function() {
        let r = oc.toHsvaString('rgba 255, 0, 0, 0.1')
        let rr = 'hsva(0, 1, 1, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(45, 0.882, 1, 0.1)' when toHsvaString input 'rgba 255 200 30 0.1'`, function() {
        let r = oc.toHsvaString('rgba 255 200 30 0.1')
        let rr = 'hsva(45, 0.882, 1, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 0.1)' when toHsvaString input 'rgba 50%, 12%, 8%, 0.1'`, function() {
        let r = oc.toHsvaString('rgba 50%, 12%, 8%, 0.1')
        let rr = 'hsva(6, 0.84, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 0.123)' when toHsvaString input 'rgba 50% 12% 8% 0.123456'`, function() {
        let r = oc.toHsvaString('rgba 50% 12% 8% 0.123456')
        let rr = 'hsva(6, 0.84, 0.5, 0.123)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv (320, 100%, 50%)'`, function() {
        let r = oc.toHsvaString('hsv (320, 100%, 50%)')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv (320 100% 50%)'`, function() {
        let r = oc.toHsvaString('hsv (320 100% 50%)')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv (320, 1, 0.5)'`, function() {
        let r = oc.toHsvaString('hsv (320, 1, 0.5)')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv (320 1 0.5)'`, function() {
        let r = oc.toHsvaString('hsv (320 1 0.5)')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv 320, 100%, 50%'`, function() {
        let r = oc.toHsvaString('hsv 320, 100%, 50%')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv 320 100% 50%'`, function() {
        let r = oc.toHsvaString('hsv 320 100% 50%')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv 320, 1, 0.5'`, function() {
        let r = oc.toHsvaString('hsv 320, 1, 0.5')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 1)' when toHsvaString input 'hsv 320 1 0.5'`, function() {
        let r = oc.toHsvaString('hsv 320 1 0.5')
        let rr = 'hsva(320, 1, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva (320, 100%, 50%, 0.1)'`, function() {
        let r = oc.toHsvaString('hsva (320, 100%, 50%, 0.1)')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva (320 100% 50% 0.1)'`, function() {
        let r = oc.toHsvaString('hsva (320 100% 50% 0.1)')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva (320, 1, 0.5, 0.1)'`, function() {
        let r = oc.toHsvaString('hsva (320, 1, 0.5, 0.1)')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva (320 1 0.5 0.1)'`, function() {
        let r = oc.toHsvaString('hsva (320 1 0.5 0.1)')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva 320, 100%, 50%, 0.1'`, function() {
        let r = oc.toHsvaString('hsva 320, 100%, 50%, 0.1')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva 320 100% 50% 0.1'`, function() {
        let r = oc.toHsvaString('hsva 320 100% 50% 0.1')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva 320, 1, 0.5, 0.1'`, function() {
        let r = oc.toHsvaString('hsva 320, 1, 0.5, 0.1')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(320, 1, 0.5, 0.1)' when toHsvaString input 'hsva 320 1 0.5 0.1'`, function() {
        let r = oc.toHsvaString('hsva 320 1 0.5 0.1')
        let rr = 'hsva(320, 1, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 0.004, 1)' when toHsvaString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toHsvaString({ r: 255, g: 150, b: 50 })
        let rr = 'hsva(29, 0.804, 0.004, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 0.004, 1)' when toHsvaString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toHsvaString({ R: 255, G: 150, B: 50 })
        let rr = 'hsva(29, 0.804, 0.004, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(74, 0.667, 0.002, 1)' when toHsvaString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: 150, b: 50 })
        let rr = 'hsva(74, 0.667, 0.002, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.002, 1)' when toHsvaString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: '12%', b: '8%' })
        let rr = 'hsva(6, 0.84, 0.002, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 0.004, 0.1)' when toHsvaString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = 'hsva(29, 0.804, 0.004, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 0.004, 0.1)' when toHsvaString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toHsvaString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = 'hsva(29, 0.804, 0.004, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(74, 0.667, 0.002, 0.1)' when toHsvaString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = 'hsva(74, 0.667, 0.002, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.002, 0.1)' when toHsvaString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = 'hsva(6, 0.84, 0.002, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.333, 0.18, 1)' when toHsvaString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, l: 0.15 })
        let rr = 'hsva(1, 0.333, 0.18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.333, 0.18, 1)' when toHsvaString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, L: 0.15 })
        let rr = 'hsva(1, 0.333, 0.18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.214, 0.09, 1)' when toHsvaString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', l: '8%' })
        let rr = 'hsva(1, 0.214, 0.09, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.333, 0.18, 1)' when toHsvaString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = 'hsva(1, 0.333, 0.18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 0.214, 0.09, 1)' when toHsvaString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', l: '8%' })
        let rr = 'hsva(0, 0.214, 0.09, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.333, 0.18, 0.1)' when toHsvaString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsva(1, 0.333, 0.18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.333, 0.18, 0.1)' when toHsvaString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = 'hsva(1, 0.333, 0.18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.214, 0.09, 0.1)' when toHsvaString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsva(1, 0.214, 0.09, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.333, 0.18, 0.1)' when toHsvaString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsva(1, 0.333, 0.18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 0.214, 0.09, 0.1)' when toHsvaString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsva(0, 0.214, 0.09, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.2, 0.15, 1)' when toHsvaString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, v: 0.15 })
        let rr = 'hsva(1, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.2, 0.15, 1)' when toHsvaString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, V: 0.15 })
        let rr = 'hsva(1, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.12, 0.08, 1)' when toHsvaString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', v: '8%' })
        let rr = 'hsva(1, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.2, 0.15, 1)' when toHsvaString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = 'hsva(1, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 0.12, 0.08, 1)' when toHsvaString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', v: '8%' })
        let rr = 'hsva(0, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.2, 0.15, 0.1)' when toHsvaString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsva(1, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.2, 0.15, 0.1)' when toHsvaString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = 'hsva(1, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.12, 0.08, 0.1)' when toHsvaString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsva(1, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(1, 0.2, 0.15, 0.1)' when toHsvaString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsva(1, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 0.12, 0.08, 0.1)' when toHsvaString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsva(0, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(0, 0, 0.176, 1)' when toHsvaString input '#2d'`, function() {
        let r = oc.toHsvaString('#2d')
        let rr = 'hsva(0, 0, 0.176, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(210, 0.167, 0.8, 1)' when toHsvaString input '#abc'`, function() {
        let r = oc.toHsvaString('#abc')
        let rr = 'hsva(210, 0.167, 0.8, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(210, 0.167, 0.8, 1)' when toHsvaString input '#ABC'`, function() {
        let r = oc.toHsvaString('#ABC')
        let rr = 'hsva(210, 0.167, 0.8, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(296, 0.35, 0.965, 1)' when toHsvaString input '#f0a0f6'`, function() {
        let r = oc.toHsvaString('#f0a0f6')
        let rr = 'hsva(296, 0.35, 0.965, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(296, 0.35, 0.965, 1)' when toHsvaString input '#F0a0f6'`, function() {
        let r = oc.toHsvaString('#F0a0f6')
        let rr = 'hsva(296, 0.35, 0.965, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(296, 0.35, 0.965, 0.784)' when toHsvaString input '#f0a0f6c8'`, function() {
        let r = oc.toHsvaString('#f0a0f6c8')
        let rr = 'hsva(296, 0.35, 0.965, 0.784)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(296, 0.35, 0.965, 0.784)' when toHsvaString input '#f0A0f6c8'`, function() {
        let r = oc.toHsvaString('#f0A0f6c8')
        let rr = 'hsva(296, 0.35, 0.965, 0.784)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff0000' when toHexString input 'rgb (255, 0, 0)'`, function() {
        let r = oc.toHexString('rgb (255, 0, 0)')
        let rr = '#ff0000'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ffc81e' when toHexString input 'rgb (255 200 30)'`, function() {
        let r = oc.toHexString('rgb (255 200 30)')
        let rr = '#ffc81e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgb (50% 12% 8%)'`, function() {
        let r = oc.toHexString('rgb (50% 12% 8%)')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff0000' when toHexString input 'rgb 255, 0, 0'`, function() {
        let r = oc.toHexString('rgb 255, 0, 0')
        let rr = '#ff0000'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ffc81e' when toHexString input 'rgb 255 200 30'`, function() {
        let r = oc.toHexString('rgb 255 200 30')
        let rr = '#ffc81e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgb 50%, 12%, 8%'`, function() {
        let r = oc.toHexString('rgb 50%, 12%, 8%')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgb 50% 12% 8%'`, function() {
        let r = oc.toHexString('rgb 50% 12% 8%')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff0000' when toHexString input 'rgba (255, 0, 0, 0.1)'`, function() {
        let r = oc.toHexString('rgba (255, 0, 0, 0.1)')
        let rr = '#ff0000'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ffc81e' when toHexString input 'rgba (255 200 30 0.1)'`, function() {
        let r = oc.toHexString('rgba (255 200 30 0.1)')
        let rr = '#ffc81e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgba (50%, 12%, 8%, 0.1)'`, function() {
        let r = oc.toHexString('rgba (50%, 12%, 8%, 0.1)')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgba (50% 12% 8% 0.1)'`, function() {
        let r = oc.toHexString('rgba (50% 12% 8% 0.1)')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff0000' when toHexString input 'rgba 255, 0, 0, 0.1'`, function() {
        let r = oc.toHexString('rgba 255, 0, 0, 0.1')
        let rr = '#ff0000'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ffc81e' when toHexString input 'rgba 255 200 30 0.1'`, function() {
        let r = oc.toHexString('rgba 255 200 30 0.1')
        let rr = '#ffc81e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgba 50%, 12%, 8%, 0.1'`, function() {
        let r = oc.toHexString('rgba 50%, 12%, 8%, 0.1')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input 'rgba 50% 12% 8% 0.123456'`, function() {
        let r = oc.toHexString('rgba 50% 12% 8% 0.123456')
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv (320, 100%, 50%)'`, function() {
        let r = oc.toHexString('hsv (320, 100%, 50%)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv (320 100% 50%)'`, function() {
        let r = oc.toHexString('hsv (320 100% 50%)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv (320, 1, 0.5)'`, function() {
        let r = oc.toHexString('hsv (320, 1, 0.5)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv (320 1 0.5)'`, function() {
        let r = oc.toHexString('hsv (320 1 0.5)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv 320, 100%, 50%'`, function() {
        let r = oc.toHexString('hsv 320, 100%, 50%')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv 320 100% 50%'`, function() {
        let r = oc.toHexString('hsv 320 100% 50%')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv 320, 1, 0.5'`, function() {
        let r = oc.toHexString('hsv 320, 1, 0.5')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsv 320 1 0.5'`, function() {
        let r = oc.toHexString('hsv 320 1 0.5')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva (320, 100%, 50%, 0.1)'`, function() {
        let r = oc.toHexString('hsva (320, 100%, 50%, 0.1)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva (320 100% 50% 0.1)'`, function() {
        let r = oc.toHexString('hsva (320 100% 50% 0.1)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva (320, 1, 0.5, 0.1)'`, function() {
        let r = oc.toHexString('hsva (320, 1, 0.5, 0.1)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva (320 1 0.5 0.1)'`, function() {
        let r = oc.toHexString('hsva (320 1 0.5 0.1)')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva 320, 100%, 50%, 0.1'`, function() {
        let r = oc.toHexString('hsva 320, 100%, 50%, 0.1')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva 320 100% 50% 0.1'`, function() {
        let r = oc.toHexString('hsva 320 100% 50% 0.1')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva 320, 1, 0.5, 0.1'`, function() {
        let r = oc.toHexString('hsva 320, 1, 0.5, 0.1')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#800055' when toHexString input 'hsva 320 1 0.5 0.1'`, function() {
        let r = oc.toHexString('hsva 320 1 0.5 0.1')
        let rr = '#800055'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010100' when toHexString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toHexString({ r: 255, g: 150, b: 50 })
        let rr = '#010100'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010100' when toHexString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toHexString({ R: 255, G: 150, B: 50 })
        let rr = '#010100'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010100' when toHexString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toHexString({ r: '50%', g: 150, b: 50 })
        let rr = '#010100'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010000' when toHexString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toHexString({ r: '50%', g: '12%', b: '8%' })
        let rr = '#010000'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010100' when toHexString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHexString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = '#010100'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010100' when toHexString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toHexString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = '#010100'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010100' when toHexString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHexString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = '#010100'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#010000' when toHexString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = '#010000'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2e1f1f' when toHexString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, l: 0.15 })
        let rr = '#2e1f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2e1f1f' when toHexString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, L: 0.15 })
        let rr = '#2e1f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#171212' when toHexString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', l: '8%' })
        let rr = '#171212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2e1f1f' when toHexString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = '#2e1f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#171212' when toHexString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', l: '8%' })
        let rr = '#171212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2e1f1f' when toHexString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = '#2e1f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2e1f1f' when toHexString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = '#2e1f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#171212' when toHexString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = '#171212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2e1f1f' when toHexString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = '#2e1f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#171212' when toHexString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = '#171212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#261f1f' when toHexString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, v: 0.15 })
        let rr = '#261f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#261f1f' when toHexString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, V: 0.15 })
        let rr = '#261f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#141212' when toHexString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', v: '8%' })
        let rr = '#141212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#261f1f' when toHexString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = '#261f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#141212' when toHexString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', v: '8%' })
        let rr = '#141212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#261f1f' when toHexString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = '#261f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#261f1f' when toHexString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = '#261f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#141212' when toHexString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = '#141212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#261f1f' when toHexString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = '#261f1f'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#141212' when toHexString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = '#141212'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#2d2d2d' when toHexString input '#2d'`, function() {
        let r = oc.toHexString('#2d')
        let rr = '#2d2d2d'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#aabbcc' when toHexString input '#abc'`, function() {
        let r = oc.toHexString('#abc')
        let rr = '#aabbcc'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#aabbcc' when toHexString input '#ABC'`, function() {
        let r = oc.toHexString('#ABC')
        let rr = '#aabbcc'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#f0a0f6' when toHexString input '#f0a0f6'`, function() {
        let r = oc.toHexString('#f0a0f6')
        let rr = '#f0a0f6'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#f0a0f6' when toHexString input '#F0a0f6'`, function() {
        let r = oc.toHexString('#F0a0f6')
        let rr = '#f0a0f6'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#f0a0f6' when toHexString input '#f0a0f6c8'`, function() {
        let r = oc.toHexString('#f0a0f6c8')
        let rr = '#f0a0f6'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#f0a0f6' when toHexString input '#f0A0f6c8'`, function() {
        let r = oc.toHexString('#f0A0f6c8')
        let rr = '#f0a0f6'
        assert.strict.deepStrictEqual(r, rr)
    })

})
