import assert from 'assert'
import domIsRendered from '../src/domIsRendered.mjs'


//假元素: nodeType、isConnected、display、parentElement由測試設定; getComputedStyle依瀏覽器, 未連接者display為空字串
//  checkVisibility於給cv時存在, 行為同瀏覽器(未連接或自身、祖先為display:none者為false), 另可指定skipped模擬content-visibility:hidden之子孫
class Ele {
    constructor(o = {}) {
        this.nodeType = 1
        this.isConnected = o.connected !== false
        this.display = o.display || 'block'
        this.parentElement = o.parent || null
        this.parentNode = o.parentNode || this.parentElement
        if (o.cv) {
            this.checkVisibility = () => {
                if (o.skipped) {
                    return false
                }
                let e = this
                while (e) {
                    if (!e.isConnected || e.display === 'none') {
                        return false
                    }
                    e = e.parentElement || (e.parentNode && e.parentNode.host) || null
                }
                return true
            }
        }
    }
}


describe(`domIsRendered`, function() {

    before(function() {
        globalThis.window = {
            getComputedStyle: (e) => ({ display: e.isConnected ? e.display : '' }),
        }
    })

    after(function() {
        delete globalThis.window
    })

    it(`should return false for non elements and disconnected elements`, function() {
        //null、非元素(含文字節點、document、自帶isConnected之一般物件)、未連接
        for (let v of [null, undefined, {}, 'div', 1, { isConnected: true }, { nodeType: 3, isConnected: true }, { nodeType: 9, isConnected: true }]) {
            assert.strict.deepStrictEqual(domIsRendered(v), false, JSON.stringify(v))
        }
        for (let cv of [false, true]) {
            assert.strict.deepStrictEqual(domIsRendered(new Ele({ connected: false, cv })), false, `cv=${cv}`)
        }
    })

    it(`should return false when the element or an ancestor is display none, with or without checkVisibility`, function() {
        for (let cv of [false, true]) {
            let root = new Ele({ cv })
            let mid = new Ele({ parent: root, cv })
            let el = new Ele({ parent: mid, cv })
            assert.strict.deepStrictEqual(domIsRendered(el), true, `visible cv=${cv}`)
            el.display = 'none'
            assert.strict.deepStrictEqual(domIsRendered(el), false, `self cv=${cv}`)
            el.display = 'block'
            root.display = 'none'
            assert.strict.deepStrictEqual(domIsRendered(el), false, `ancestor cv=${cv}`)
        }
    })

    it(`should walk from a shadow root to its host when checkVisibility is missing`, function() {
        let host = new Ele()
        let shadowRoot = { host }
        let el = new Ele({ parentNode: shadowRoot })
        assert.strict.deepStrictEqual(domIsRendered(el), true)
        host.display = 'none'
        assert.strict.deepStrictEqual(domIsRendered(el), false)
    })

    it(`should follow checkVisibility when present, which also covers content-visibility`, function() {
        //有checkVisibility時以其為準(display非none而checkVisibility為false者為false)
        assert.strict.deepStrictEqual(domIsRendered(new Ele({ cv: true, skipped: true })), false)
        assert.strict.deepStrictEqual(domIsRendered(new Ele({ cv: true })), true)
    })

    it(`should fall back to the display walk when checkVisibility throws`, function() {
        let root = new Ele()
        let el = new Ele({ parent: root })
        el.checkVisibility = () => {
            throw new Error('cv boom')
        }
        let visible = domIsRendered(el)
        root.display = 'none'
        assert.strict.deepStrictEqual([visible, domIsRendered(el)], [true, false])
    })

})
