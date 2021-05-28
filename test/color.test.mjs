import assert from 'assert'
import oc from '../src/color.mjs'


describe(`color`, function() {

    it(`should return 'rgba(205, 205, 205, 1)' when toRgbaString input '#cd'`, function() {
        let r = oc.toRgbaString('#cd')
        let rr = 'rgba(205, 205, 205, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(102, 170, 51, 1)' when toRgbaString input '#6a3'`, function() {
        let r = oc.toRgbaString('#6a3')
        let rr = 'rgba(102, 170, 51, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(107, 142, 35, 1)' when toRgbaString input '#6b8e23'`, function() {
        let r = oc.toRgbaString('#6b8e23')
        let rr = 'rgba(107, 142, 35, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

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

    it(`should return 'rgba(255, 150, 50, 1)' when toRgbaString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toRgbaString({ r: 255, g: 150, b: 50 })
        let rr = 'rgba(255, 150, 50, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 150, 50, 1)' when toRgbaString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toRgbaString({ R: 255, G: 150, B: 50 })
        let rr = 'rgba(255, 150, 50, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 150, 50, 1)' when toRgbaString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: 150, b: 50 })
        let rr = 'rgba(128, 150, 50, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 1)' when toRgbaString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: '12%', b: '8%' })
        let rr = 'rgba(128, 31, 20, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 150, 50, 0.1)' when toRgbaString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = 'rgba(255, 150, 50, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(255, 150, 50, 0.1)' when toRgbaString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toRgbaString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = 'rgba(255, 150, 50, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 150, 50, 0.1)' when toRgbaString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = 'rgba(128, 150, 50, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(128, 31, 20, 0.1)' when toRgbaString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = 'rgba(128, 31, 20, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(34, 31, 46, 1)' when toRgbaString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, l: 0.15 })
        let rr = 'rgba(34, 31, 46, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(34, 31, 46, 1)' when toRgbaString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, L: 0.15 })
        let rr = 'rgba(34, 31, 46, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(19, 18, 23, 1)' when toRgbaString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', l: '8%' })
        let rr = 'rgba(19, 18, 23, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(31, 46, 46, 1)' when toRgbaString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = 'rgba(31, 46, 46, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(18, 23, 23, 1)' when toRgbaString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', l: '8%' })
        let rr = 'rgba(18, 23, 23, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(34, 31, 46, 0.1)' when toRgbaString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'rgba(34, 31, 46, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(34, 31, 46, 0.1)' when toRgbaString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = 'rgba(34, 31, 46, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(19, 18, 23, 0.1)' when toRgbaString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = 'rgba(19, 18, 23, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(31, 46, 46, 0.1)' when toRgbaString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'rgba(31, 46, 46, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(18, 23, 23, 0.1)' when toRgbaString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = 'rgba(18, 23, 23, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(33, 31, 38, 1)' when toRgbaString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, v: 0.15 })
        let rr = 'rgba(33, 31, 38, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(33, 31, 38, 1)' when toRgbaString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, V: 0.15 })
        let rr = 'rgba(33, 31, 38, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(19, 18, 20, 1)' when toRgbaString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', v: '8%' })
        let rr = 'rgba(19, 18, 20, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(31, 38, 38, 1)' when toRgbaString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = 'rgba(31, 38, 38, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(18, 20, 20, 1)' when toRgbaString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', v: '8%' })
        let rr = 'rgba(18, 20, 20, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(33, 31, 38, 0.1)' when toRgbaString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'rgba(33, 31, 38, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(33, 31, 38, 0.1)' when toRgbaString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toRgbaString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = 'rgba(33, 31, 38, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(19, 18, 20, 0.1)' when toRgbaString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = 'rgba(19, 18, 20, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(31, 38, 38, 0.1)' when toRgbaString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'rgba(31, 38, 38, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgba(18, 20, 20, 0.1)' when toRgbaString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toRgbaString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = 'rgba(18, 20, 20, 0.1)'
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

    it(`should return 'hsla(29, 1, 0.598, 1)' when toHslaString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toHslaString({ r: 255, g: 150, b: 50 })
        let rr = 'hsla(29, 1, 0.598, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 1, 0.598, 1)' when toHslaString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toHslaString({ R: 255, G: 150, B: 50 })
        let rr = 'hsla(29, 1, 0.598, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(74, 0.5, 0.392, 1)' when toHslaString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toHslaString({ r: '50%', g: 150, b: 50 })
        let rr = 'hsla(74, 0.5, 0.392, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 1)' when toHslaString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toHslaString({ r: '50%', g: '12%', b: '8%' })
        let rr = 'hsla(6, 0.724, 0.29, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 1, 0.598, 0.1)' when toHslaString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHslaString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = 'hsla(29, 1, 0.598, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(29, 1, 0.598, 0.1)' when toHslaString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toHslaString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = 'hsla(29, 1, 0.598, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(74, 0.5, 0.392, 0.1)' when toHslaString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHslaString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = 'hsla(74, 0.5, 0.392, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(6, 0.724, 0.29, 0.1)' when toHslaString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = 'hsla(6, 0.724, 0.29, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.2, 0.15, 1)' when toHslaString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, l: 0.15 })
        let rr = 'hsla(255, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.2, 0.15, 1)' when toHslaString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, L: 0.15 })
        let rr = 'hsla(255, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.12, 0.08, 1)' when toHslaString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', l: '8%' })
        let rr = 'hsla(255, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.2, 0.15, 1)' when toHslaString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = 'hsla(180, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.12, 0.08, 1)' when toHslaString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', l: '8%' })
        let rr = 'hsla(180, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.2, 0.15, 0.1)' when toHslaString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsla(255, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.2, 0.15, 0.1)' when toHslaString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = 'hsla(255, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.12, 0.08, 0.1)' when toHslaString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsla(255, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.2, 0.15, 0.1)' when toHslaString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsla(180, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.12, 0.08, 0.1)' when toHslaString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsla(180, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.111, 0.135, 1)' when toHslaString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, v: 0.15 })
        let rr = 'hsla(255, 0.111, 0.135, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.111, 0.135, 1)' when toHslaString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, V: 0.15 })
        let rr = 'hsla(255, 0.111, 0.135, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.064, 0.075, 1)' when toHslaString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', v: '8%' })
        let rr = 'hsla(255, 0.064, 0.075, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.111, 0.135, 1)' when toHslaString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = 'hsla(180, 0.111, 0.135, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.064, 0.075, 1)' when toHslaString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', v: '8%' })
        let rr = 'hsla(180, 0.064, 0.075, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.111, 0.135, 0.1)' when toHslaString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsla(255, 0.111, 0.135, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.111, 0.135, 0.1)' when toHslaString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toHslaString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = 'hsla(255, 0.111, 0.135, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(255, 0.064, 0.075, 0.1)' when toHslaString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsla(255, 0.064, 0.075, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.111, 0.135, 0.1)' when toHslaString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsla(180, 0.111, 0.135, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsla(180, 0.064, 0.075, 0.1)' when toHslaString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHslaString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsla(180, 0.064, 0.075, 0.1)'
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

    it(`should return 'hsva(29, 0.804, 1, 1)' when toHsvaString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toHsvaString({ r: 255, g: 150, b: 50 })
        let rr = 'hsva(29, 0.804, 1, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 1, 1)' when toHsvaString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toHsvaString({ R: 255, G: 150, B: 50 })
        let rr = 'hsva(29, 0.804, 1, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(74, 0.667, 0.588, 1)' when toHsvaString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: 150, b: 50 })
        let rr = 'hsva(74, 0.667, 0.588, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 1)' when toHsvaString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: '12%', b: '8%' })
        let rr = 'hsva(6, 0.84, 0.5, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 1, 0.1)' when toHsvaString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = 'hsva(29, 0.804, 1, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(29, 0.804, 1, 0.1)' when toHsvaString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toHsvaString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = 'hsva(29, 0.804, 1, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(74, 0.667, 0.588, 0.1)' when toHsvaString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = 'hsva(74, 0.667, 0.588, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(6, 0.84, 0.5, 0.1)' when toHsvaString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = 'hsva(6, 0.84, 0.5, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.333, 0.18, 1)' when toHsvaString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, l: 0.15 })
        let rr = 'hsva(255, 0.333, 0.18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.333, 0.18, 1)' when toHsvaString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, L: 0.15 })
        let rr = 'hsva(255, 0.333, 0.18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.214, 0.09, 1)' when toHsvaString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', l: '8%' })
        let rr = 'hsva(255, 0.214, 0.09, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.333, 0.18, 1)' when toHsvaString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = 'hsva(180, 0.333, 0.18, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.214, 0.09, 1)' when toHsvaString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', l: '8%' })
        let rr = 'hsva(180, 0.214, 0.09, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.333, 0.18, 0.1)' when toHsvaString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsva(255, 0.333, 0.18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.333, 0.18, 0.1)' when toHsvaString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = 'hsva(255, 0.333, 0.18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.214, 0.09, 0.1)' when toHsvaString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsva(255, 0.214, 0.09, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.333, 0.18, 0.1)' when toHsvaString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = 'hsva(180, 0.333, 0.18, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.214, 0.09, 0.1)' when toHsvaString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = 'hsva(180, 0.214, 0.09, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.2, 0.15, 1)' when toHsvaString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, v: 0.15 })
        let rr = 'hsva(255, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.2, 0.15, 1)' when toHsvaString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, V: 0.15 })
        let rr = 'hsva(255, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.12, 0.08, 1)' when toHsvaString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', v: '8%' })
        let rr = 'hsva(255, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.2, 0.15, 1)' when toHsvaString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = 'hsva(180, 0.2, 0.15, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.12, 0.08, 1)' when toHsvaString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', v: '8%' })
        let rr = 'hsva(180, 0.12, 0.08, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.2, 0.15, 0.1)' when toHsvaString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsva(255, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.2, 0.15, 0.1)' when toHsvaString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toHsvaString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = 'hsva(255, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(255, 0.12, 0.08, 0.1)' when toHsvaString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsva(255, 0.12, 0.08, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.2, 0.15, 0.1)' when toHsvaString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = 'hsva(180, 0.2, 0.15, 0.1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'hsva(180, 0.12, 0.08, 0.1)' when toHsvaString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHsvaString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = 'hsva(180, 0.12, 0.08, 0.1)'
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

    it(`should return '#ff9632' when toHexString input { r: 255, g: 150, b: 50 }`, function() {
        let r = oc.toHexString({ r: 255, g: 150, b: 50 })
        let rr = '#ff9632'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff9632' when toHexString input { R: 255, G: 150, B: 50 }`, function() {
        let r = oc.toHexString({ R: 255, G: 150, B: 50 })
        let rr = '#ff9632'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#809632' when toHexString input { r: '50%', g: 150, b: 50 }`, function() {
        let r = oc.toHexString({ r: '50%', g: 150, b: 50 })
        let rr = '#809632'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input { r: '50%', g: '12%', b: '8%' }`, function() {
        let r = oc.toHexString({ r: '50%', g: '12%', b: '8%' })
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff9632' when toHexString input { r: 255, g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHexString({ r: 255, g: 150, b: 50, a: 0.1 })
        let rr = '#ff9632'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#ff9632' when toHexString input { R: 255, G: 150, B: 50, A: 0.1 }`, function() {
        let r = oc.toHexString({ R: 255, G: 150, B: 50, A: 0.1 })
        let rr = '#ff9632'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#809632' when toHexString input { r: '50%', g: 150, b: 50, a: 0.1 }`, function() {
        let r = oc.toHexString({ r: '50%', g: 150, b: 50, a: 0.1 })
        let rr = '#809632'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#801f14' when toHexString input { r: '50%', g: '12%', b: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ r: '50%', g: '12%', b: '8%', a: 0.1 })
        let rr = '#801f14'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#221f2e' when toHexString input { h: 255, s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, l: 0.15 })
        let rr = '#221f2e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#221f2e' when toHexString input { H: 255, S: 0.2, L: 0.15 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, L: 0.15 })
        let rr = '#221f2e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#131217' when toHexString input { h: 255, s: '12%', l: '8%' }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', l: '8%' })
        let rr = '#131217'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#1f2e2e' when toHexString input { h: '50%', s: 0.2, l: 0.15 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, l: 0.15 })
        let rr = '#1f2e2e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#121717' when toHexString input { h: '50%', s: '12%', l: '8%' }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', l: '8%' })
        let rr = '#121717'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#221f2e' when toHexString input { h: 255, s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, l: 0.15, a: 0.1 })
        let rr = '#221f2e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#221f2e' when toHexString input { H: 255, S: 0.2, L: 0.15, A: 0.1 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, L: 0.15, A: 0.1 })
        let rr = '#221f2e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#131217' when toHexString input { h: 255, s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', l: '8%', a: 0.1 })
        let rr = '#131217'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#1f2e2e' when toHexString input { h: '50%', s: 0.2, l: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, l: 0.15, a: 0.1 })
        let rr = '#1f2e2e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#121717' when toHexString input { h: '50%', s: '12%', l: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', l: '8%', a: 0.1 })
        let rr = '#121717'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#211f26' when toHexString input { h: 255, s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, v: 0.15 })
        let rr = '#211f26'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#211f26' when toHexString input { H: 255, S: 0.2, V: 0.15 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, V: 0.15 })
        let rr = '#211f26'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#131214' when toHexString input { h: 255, s: '12%', v: '8%' }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', v: '8%' })
        let rr = '#131214'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#1f2626' when toHexString input { h: '50%', s: 0.2, v: 0.15 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, v: 0.15 })
        let rr = '#1f2626'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#121414' when toHexString input { h: '50%', s: '12%', v: '8%' }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', v: '8%' })
        let rr = '#121414'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#211f26' when toHexString input { h: 255, s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: 0.2, v: 0.15, a: 0.1 })
        let rr = '#211f26'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#211f26' when toHexString input { H: 255, S: 0.2, V: 0.15, A: 0.1 }`, function() {
        let r = oc.toHexString({ H: 255, S: 0.2, V: 0.15, A: 0.1 })
        let rr = '#211f26'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#131214' when toHexString input { h: 255, s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: 255, s: '12%', v: '8%', a: 0.1 })
        let rr = '#131214'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#1f2626' when toHexString input { h: '50%', s: 0.2, v: 0.15, a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: 0.2, v: 0.15, a: 0.1 })
        let rr = '#1f2626'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '#121414' when toHexString input { h: '50%', s: '12%', v: '8%', a: 0.1 }`, function() {
        let r = oc.toHexString({ h: '50%', s: '12%', v: '8%', a: 0.1 })
        let rr = '#121414'
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
