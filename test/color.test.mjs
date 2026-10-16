import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import each from 'lodash-es/each.js'
import sortBy from 'lodash-es/sortBy.js'
import oc from '../src/color.mjs'
import iseobj from '../src/iseobj.mjs'
import cdbl from '../src/cdbl.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`color`, function() {

    it(`should return 'rgb(179, 128, 162)' when mix input '#cd', 0.5, 'hsl (320, 50%, 40%)', 0.5, 'toRgbString'`, function() {
        let r = oc.mix('#cd', 0.5, 'hsl (320, 50%, 40%)', 0.5, 'toRgbString')
        let rr = 'rgb(179, 128, 162)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgb(153, 51, 119)' when mix input '#cd', 0, 'hsl (320, 50%, 40%)', 1, 'toRgbString'`, function() {
        let r = oc.mix('#cd', 0, 'hsl (320, 50%, 40%)', 1, 'toRgbString')
        let rr = 'rgb(153, 51, 119)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'rgb(0, 0, 0)' when mix input '#cd', 0, 'hsl (320, 50%, 40%)', 0, 'toRgbString'`, function() {
        let r = oc.mix('#cd', 0, 'hsl (320, 50%, 40%)', 0, 'toRgbString')
        let rr = 'rgb(0, 0, 0)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { r: 189, g: 60, b: 68, a: 0.55 } when mix input 'rgb(250, 120, 50)', 0.5, 'hsva (320, 100%, 50%, 0.1)', 0.5, 'toRgba'`, function() {
        let r = oc.mix('rgb(250, 120, 50)', 0.5, 'hsva (320, 100%, 50%, 0.1)', 0.5, 'toRgba')
        let rr = { r: 189, g: 60, b: 68, a: 0.55 }
        assert.strict.deepStrictEqual(r, rr)
    })

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

    let gradient = {
        0: 'rgb(255, 255, 255)',
        0.2: 'rgb(254, 178, 76)',
        0.4: 'rgb(252, 78, 42)',
        0.6: 'rgb(220, 58, 38)',
        0.8: 'rgb(200, 40, 23)',
        1: 'rgba(180, 30, 60, 0.5)',
    }
    let fun = oc.interp(gradient)

    // console.log('fun(0)', fun(0))
    //fun(0) rgba(255, 255, 255, 1)
    it(`should return 'rgba(255, 255, 255, 1)' when interp(gradient) input 0`, function() {
        let r = fun(0)
        let rr = 'rgba(255, 255, 255, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(0.1)', fun(0.1))
    //fun(0.1) rgba(255, 217, 166, 1)
    it(`should return 'rgba(255, 217, 166, 1)' when interp(gradient) input 0.1`, function() {
        let r = fun(0.1)
        let rr = 'rgba(255, 217, 166, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(0.2)', fun(0.2))
    //fun(0.2) rgba(254, 178, 76, 1)
    it(`should return 'rgba(254, 178, 76, 1)' when interp(gradient) input 0.2`, function() {
        let r = fun(0.2)
        let rr = 'rgba(254, 178, 76, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(0.8)', fun(0.8))
    //fun(0.8) rgba(200, 40, 23, 1)
    it(`should return 'rgba(200, 40, 23, 1)' when interp(gradient) input 0.8`, function() {
        let r = fun(0.8)
        let rr = 'rgba(200, 40, 23, 1)'
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(0.9)', fun(0.9))
    //fun(0.9) rgba(190, 35, 42, 0.75)
    it(`should return 'rgba(190, 35, 42, 0.75)' when interp(gradient) input 0.9`, function() {
        let r = fun(0.9)
        let rr = 'rgba(190, 35, 42, 0.75)'
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(1)', fun(1))
    //fun(1) rgba(180, 30, 60, 0.5)
    it(`should return 'rgba(180, 30, 60, 0.5)' when interp(gradient) input 1`, function() {
        let r = fun(1)
        let rr = 'rgba(180, 30, 60, 0.5)'
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(2)', fun(2))
    //fun(2) null
    it(`should return null when interp(gradient) input 2`, function() {
        let r = fun(2)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    // console.log('fun(-1)', fun(-1))
    //fun(-1) null
    it(`should return null when interp(gradient) input -1`, function() {
        let r = fun(-1)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`color.interp 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

    //interp與parseColor於丟錯前會console.log, 測試中靜音
    let quiet = (f) => {
        let ol = console.log
        console.log = () => {}
        try {
            return f()
        }
        finally {
            console.log = ol
        }
    }

    //取丟出之錯誤訊息, 未丟錯回傳null
    let errMsg = (f) => {
        try {
            quiet(f)
        }
        catch (err) {
            return err.message
        }
        return null
    }

    //修前之演算法(lodash each迭代), 原樣複製(內部函數改以公開之toRgba、mix取代: toRgba(parseColor(v))同oc.toRgba(v)), 供差分
    let legacyInterp = (gradient) => {

        //check gradient
        if (!iseobj(gradient)) {
            console.log('gradient is not an effective object')
            return (r) => {
                r = Math.min(Math.max(r, 0), 1)
                return `rgb(${r * 255},${r * 255},${r * 255})`
            }
        }

        //gs
        let gs = []
        each(gradient, (v, k) => {
            gs.push([cdbl(k), oc.toRgba(v), v])
        })
        gs = sortBy(gs, 0)

        function getColor(r) {
            let color = null
            for (let i = 1; i < gs.length; i++) {
                let r0 = gs[i - 1][0]
                let c0 = gs[i - 1][1]
                let r1 = gs[i][0]
                let c1 = gs[i][1]
                if (r0 <= r && r1 >= r) {
                    let w0 = (r1 - r) / (r1 - r0)
                    let w1 = (r - r0) / (r1 - r0)
                    color = oc.mix(c0, w0, c1, w1, 'toRgbaString')
                    break
                }
            }
            return color
        }

        return getColor
    }

    //取樣點
    let rs = [-0.5, -0.1, 0, 0.05, 0.1, 0.25, 0.3333, 0.5, 0.6, 0.75, 0.9, 1, 1.5, 2]

    //以資料屬性設定自有鍵(一般賦值對__proto__會改原型)
    let setOwn = (o, k, v) => {
        Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
        return o
    }

    //改名length為foo(保持相對鍵序), 作為不含length之對照組
    let renameLength = (o) => {
        return Object.fromEntries(Object.entries(o).map(([k, v]) => [k === 'length' ? 'foo' : k, v]))
    }

    //'rgba(R, G, B, A)'解析為數字陣列
    let parseRgba = (s) => {
        let m = /^rgba\((-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\)$/.exec(s)
        return m ? m.slice(1).map(Number) : null
    }

    describe(`無陣列樣length鍵之漸層: 與修前演算法逐案相同(行為鎖定)`, function() {

        let seed = 20261017
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed / 2147483648
        }
        let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
        let poss = ['0', '0.1', '0.25', '0.5', '0.75', '0.9', '1', '2', '-1']
        let hexs = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#808080', '#123456', '#fedcba']
        let others = ['rgb(10, 20, 30)', 'rgba(180, 30, 60, 0.5)', 'hsl(120, 100%, 50%)', 'skyblue']
        //非數字鍵(皆非陣列樣length): 值為字串之length亦非陣列樣, 修前即以自有鍵迭代
        let oddKeys = ['length', 'foo', 'x y']

        let genStops = () => {
            let n = 2 + Math.floor(rnd() * 5)
            let ps = []
            while (ps.length < n) {
                let p = pick(poss)
                if (!ps.includes(p)) {
                    ps.push(p)
                }
            }
            return ps
        }

        //全為十六進位色之漸層, 供獨立期望值
        let hexCases = Array.from({ length: 200 }, () => {
            let g = {}
            for (let p of genStops()) {
                setOwn(g, p, pick(hexs))
            }
            return g
        })

        //混合色彩格式、並可含非數字鍵之漸層, 供與修前差分
        let mixCases = Array.from({ length: 200 }, () => {
            let g = {}
            for (let p of genStops()) {
                setOwn(g, p, pick([...hexs, ...others]))
            }
            if (rnd() < 0.3) {
                setOwn(g, pick(oddKeys), pick([...hexs, ...others]))
            }
            return g
        })

        it(`should equal the legacy algorithm at every sample point on 200 random mixed gradients (including non-numeric keys such as length with a color string)`, function() {
            let bad = []
            for (let i = 0; i < mixCases.length; i++) {
                let g = mixCases[i]
                let f = quiet(() => oc.interp(g))
                let fl = quiet(() => legacyInterp(g))
                for (let r of rs) {
                    if (f(r) !== fl(r)) {
                        bad.push({ i, r })
                    }
                }
            }
            assert.strict.deepStrictEqual(bad, [])
        })

        it(`should equal the independent piecewise-linear expectation (within 1 of rounding) on 200 random hex gradients`, function() {
            let bad = []
            let hit = 0
            let miss = 0
            for (let i = 0; i < hexCases.length; i++) {
                let g = hexCases[i]
                let f = oc.interp(g)
                //獨立期望: 依位置數值遞增排序, 取第一個涵蓋r之區間線性內插
                let stops = Object.keys(g).map((p) => ({ p: Number(p), c: [1, 3, 5].map((j) => parseInt(g[p].slice(j, j + 2), 16)) }))
                stops.sort((a, b) => a.p - b.p)
                for (let r of rs) {
                    let e = null
                    for (let j = 1; j < stops.length; j++) {
                        let a = stops[j - 1]
                        let b = stops[j]
                        if (a.p <= r && b.p >= r) {
                            let w = (r - a.p) / (b.p - a.p)
                            e = a.c.map((v, q) => v + (b.c[q] - v) * w)
                            break
                        }
                    }
                    let s = f(r)
                    if (e === null) {
                        miss++
                        if (s !== null) {
                            bad.push({ i, r, s })
                        }
                        continue
                    }
                    hit++
                    let t = parseRgba(s)
                    if (t === null || t[3] !== 1 || [0, 1, 2].some((q) => Math.abs(t[q] - e[q]) > 1)) {
                        bad.push({ i, r, s, e })
                    }
                }
            }
            assert.strict.deepStrictEqual(bad, [])
            assert.ok(hit > 500 && miss > 50, `hit=${hit} miss=${miss}`) //須含足夠之區間內與區間外取樣
        })

        it(`should return the known colors for a two-stop gradient`, function() {
            let f = oc.interp({ 0: '#000000', 1: '#ffffff' })
            assert.strict.strictEqual(f(0), 'rgba(0, 0, 0, 1)')
            assert.strict.strictEqual(f(0.5), 'rgba(128, 128, 128, 1)') //127.5捨入為128
            assert.strict.strictEqual(f(1), 'rgba(255, 255, 255, 1)')
            assert.strict.strictEqual(f(2), null)
            assert.strict.strictEqual(f(-1), null)
        })

        it(`should treat a string length value like any other non-numeric key (same as the control renamed to foo)`, function() {
            let g = { length: '#ff0000', 0: '#000000', 1: '#ffffff' }
            let f = oc.interp(g)
            let fc = oc.interp(renameLength(g))
            for (let r of rs) {
                assert.strict.strictEqual(f(r), fc(r))
            }
            assert.strict.strictEqual(f(1), 'rgba(255, 255, 255, 1)')
        })

        it(`should return the gray function for non-effective gradients`, function() {
            for (let g of [null, undefined, {}, [], 'abc', 123, [{ 0: '#000000' }]]) {
                let f = quiet(() => oc.interp(g))
                assert.strict.strictEqual(f(0.5), 'rgb(127.5,127.5,127.5)')
                assert.strict.strictEqual(f(2), 'rgb(255,255,255)')
                assert.strict.strictEqual(f(-1), 'rgb(0,0,0)')
            }
        })

    })

    describe(`漸層帶陣列樣length鍵(非負整數)時, 一律當一般鍵: length值為數字非合法顏色而丟錯`, function() {

        //[名稱, 漸層, 預期錯誤訊息]; 預期訊息為手算: 依鍵序第一個無法解析之值決定, 對照組為改名length為foo者
        let notColor = 'color is not a string or an object'
        let cases = [
            ['{length:2,0:#000000,1:#ffffff} (修前不丟錯並忽略length)', { length: 2, 0: '#000000', 1: '#ffffff' }, notColor],
            ['{length:0,0:#000000,1:#ffffff} (修前length為0而得空漸層)', { length: 0, 0: '#000000', 1: '#ffffff' }, notColor],
            ['{length:1,0:#000000,1:#ffffff}', { length: 1, 0: '#000000', 1: '#ffffff' }, notColor],
            ['{length:3,0,1,2} 三色皆在(修前依索引0~2走訪而不丟錯)', { length: 3, 0: '#000000', 1: '#808080', 2: '#ffffff' }, notColor],
            ['{length:5,0~4} 五色皆在', { length: 5, 0: '#000000', 1: '#111111', 2: '#222222', 3: '#333333', 4: '#444444' }, notColor],
            ['{length:1,a:x}', { length: 1, a: 'x' }, notColor],
            ['{a:x,length:1} 鍵序a在前: 先解析a而丟can not parse color: x(修前丟color is not a string or an object)', { a: 'x', length: 1 }, 'can not parse color: x'],
            ['{length:1}', { length: 1 }, notColor],
            ['{length:1000,0,1} 較大之length(行程內只用小值)', { length: 1000, 0: '#000000', 1: '#ffffff' }, notColor],
        ]
        for (let [name, g, msg] of cases) {
            it(`should throw '${msg}' for ${name}, same as the control renamed to foo`, function() {
                let ctrl = errMsg(() => oc.interp(renameLength(g)))
                assert.strict.strictEqual(ctrl, msg) //對照組(無length鍵)之訊息即手算值
                assert.strict.strictEqual(errMsg(() => oc.interp(g)), msg)
            })
        }

        it(`should throw for length -0 from JSON (isLength(-0) is true: array-like before the fix)`, function() {
            let t = JSON.parse('{"length":-0,"0":"#000000","1":"#ffffff"}')
            assert.ok(Object.is(t.length, -0))
            assert.strict.strictEqual(errMsg(() => oc.interp(t)), notColor)
        })

        it(`should interpolate by own keys when length is a getter on the prototype (class instance)`, function() {
            let plain = oc.interp({ 0: '#000000', 1: '#ffffff' })
            for (let n of [0, 1, 2, 5]) {
                class G {
                    get length() {
                        return n
                    }

                    constructor() {
                        this[0] = '#000000'
                        this[1] = '#ffffff'
                    }
                }
                let f = oc.interp(new G())
                for (let r of rs) {
                    assert.strict.strictEqual(f(r), plain(r), `n=${n} r=${r}`)
                }
                assert.strict.strictEqual(f(0.5), 'rgba(128, 128, 128, 1)')
            }
        })

        it(`should interpolate by own keys when the own length is not enumerable`, function() {
            let plain = oc.interp({ 0: '#000000', 1: '#ffffff' })
            for (let n of [0, 1, 5]) {
                let g = { 0: '#000000', 1: '#ffffff' }
                Object.defineProperty(g, 'length', { value: n, enumerable: false })
                let f = oc.interp(g)
                for (let r of rs) {
                    assert.strict.strictEqual(f(r), plain(r), `n=${n} r=${r}`)
                }
            }
        })

        it(`should ignore inherited keys and an inherited length: own keys only`, function() {
            let g = Object.create({ 9: '#ff0000', length: 1 })
            g[0] = '#000000'
            g[1] = '#ffffff'
            let f = oc.interp(g)
            let plain = oc.interp({ 0: '#000000', 1: '#ffffff' })
            for (let r of rs) {
                assert.strict.strictEqual(f(r), plain(r), `r=${r}`)
            }
            assert.strict.strictEqual(f(2), null) //繼承之鍵9若被走訪, f(2)將落在1與9之間而非null
        })

        it(`should ignore symbol keys and non-enumerable own keys other than length`, function() {
            let g = { 0: '#000000', 1: '#ffffff', [Symbol('s')]: 'x' }
            Object.defineProperty(g, 'hidden', { value: 'x', enumerable: false })
            let f = oc.interp(g)
            assert.strict.strictEqual(f(0.5), 'rgba(128, 128, 128, 1)')
        })

        it(`should not modify the input and accept a frozen input`, function() {
            let g = { 0: '#000000', 1: '#ffffff', foo: 'x' }
            let before = structuredClone(g)
            errMsg(() => oc.interp(g))
            assert.strict.deepStrictEqual(g, before)
            let gl = { length: 2, 0: '#000000', 1: '#ffffff' }
            let beforel = structuredClone(gl)
            errMsg(() => oc.interp(gl))
            assert.strict.deepStrictEqual(gl, beforel)
            assert.strict.deepStrictEqual(Object.keys(gl), ['0', '1', 'length'])
            let f = oc.interp(Object.freeze({ 0: '#000000', 1: '#ffffff' }))
            assert.strict.strictEqual(f(0.5), 'rgba(128, 128, 128, 1)')
        })

        it(`should treat an object that only pretends to be an Array (Symbol.toStringTag) as no effective gradient: gray function, by neither its length nor its keys`, function() {
            let g = { [Symbol.toStringTag]: 'Array', length: 2, 0: '#000000', 1: '#ffffff' }
            let f = quiet(() => oc.interp(g))
            let fl = quiet(() => legacyInterp(g))
            for (let r of rs) {
                assert.strict.strictEqual(f(r), fl(r))
            }
            assert.strict.strictEqual(f(0.5), 'rgb(127.5,127.5,127.5)')
            assert.strict.strictEqual(f(2), 'rgb(255,255,255)')
        })

    })

    describe(`極大length於限額子行程: 立即回應, 時間與記憶體只依實際鍵數`, function() {

        let runner = join(__dirname, 'tools', 'objIterG3Runner.mjs')
        let MAX = Number.MAX_SAFE_INTEGER
        //limit 64MB; 修前之實作於索引缺漏處即丟錯(索引2無值), 故不致耗盡資源, 但length被忽略或訊息不同
        let notColor = 'color is not a string or an object'
        let cases = [
            ['len', 1e8, { threw: true, msg: notColor }],
            ['len', MAX, { threw: true, msg: notColor }],
            ['len', 4294967295, { threw: true, msg: notColor }],
            ['len', 4294967296, { threw: true, msg: notColor }],
            ['len', 2 ** 53, { threw: true, msg: notColor }], //超過isLength上限, 修前即以自有鍵迭代, 對照
            ['msg', MAX, { threw: true, msg: 'can not parse color: x' }], //{a:'x', length}: 修前丟color is not a string or an object
            ['msg', 4294967295, { threw: true, msg: 'can not parse color: x' }],
            ['tag', MAX, { threw: false, v05: 'rgb(127.5,127.5,127.5)', v2: 'rgb(255,255,255)' }], //Symbol.toStringTag偽稱Array: iseobj為false, 對照
            ['proto', MAX, { threw: false, v05: 'rgba(128, 128, 128, 1)', v2: null }], //原型上之length getter
            ['proto', 4294967295, { threw: false, v05: 'rgba(128, 128, 128, 1)', v2: null }],
            ['hidden', MAX, { threw: false, v05: 'rgba(128, 128, 128, 1)', v2: null }], //不可列舉之自有length
            ['hidden', 1e8, { threw: false, v05: 'rgba(128, 128, 128, 1)', v2: null }],
        ]
        for (let [kind, len, exp] of cases) {
            it(`should finish ${kind}:${len} within 1000 ms and 4 MB of heap with threw=${exp.threw}`, function() {
                let rc = runChildCase(runner, `interp:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 20000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                assert.ok(rc.r !== null, 'no result line')
                let r = rc.r
                assert.strict.strictEqual(r.threw, exp.threw, `threw=${r.threw} msg=${r.msg}`)
                if (exp.threw) {
                    assert.strict.strictEqual(r.msg, exp.msg)
                }
                else {
                    assert.ok(r.isFun)
                    assert.strict.strictEqual(r.v05, exp.v05)
                    assert.strict.strictEqual(r.v2, exp.v2)
                }
                assert.ok(r.ms < 1000, `ms=${r.ms}`)
                assert.ok(r.heapMB < 4, `heapMB=${r.heapMB}`)
            })
        }

    })

})

describe(`color.interp 讀值與解析順序(R-OBJ-ITER-01 外審補測)`, function() {

    it(`should parse the colors in key order and read each value lazily: the first invalid color is reported before a later throwing getter`, function() {
        //外審 sol F11: 先取完 Object.entries 之變異會先讀到後面之 getter 而先拋 late getter
        let late = new Error('late getter')
        let g = {
            a: 'x',
            get b() {
                throw late
            },
        }
        assert.throws(() => oc.interp(g), (e) => e !== late && /can not parse color: x/.test(String(e.message)))
    })

})
