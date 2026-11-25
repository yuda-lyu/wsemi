import assert from 'assert'
import path from 'path'
import { launchBrowser, openPage, analyzePic, INSTALL_TIMEOUT, CROSS_HOST } from './tools/browserKit.mjs'


//domConvertToPic之行為測試(真瀏覽器: playwright-core驅動之headless Chromium, 頁面以ES module載入本庫src, 不依賴./dist, 不連外網)
//  不比對標準圖(snapdom升版之反鋸齒差異不應轉紅), 改以可解釋之量測: 輸出尺寸、指定區塊之顏色、非白像素、同次執行內兩輸出之像素雜湊是否相同
//  規格來源: src/domConvertToPic.mjs之JSDoc(opt.scale、opt.toBase64、opt.picType、回傳、DOM殘留)、第642項(canvas內容、壞圖尺寸穩定)
//  修前紅驗證: 環境變數WSEMI_DOMCONVERTTOPIC_SRC指向舊版檔案時, 頁面改載該檔(取代/src/domConvertToPic.mjs; 其餘模組仍用本庫src)


let SRC_OVERRIDE = null
if (process.env.WSEMI_DOMCONVERTTOPIC_SRC) {
    SRC_OVERRIDE = { '/src/domConvertToPic.mjs': path.resolve(process.env.WSEMI_DOMCONVERTTOPIC_SRC) }
}

let SNAPDOM_PATH = '/node_modules/@zumer/snapdom/dist/snapdom.mjs'
let STUB_FAIL = path.resolve(import.meta.dirname, 'tools', 'snapdomFailStub.mjs')

//near, 三通道平均色與預期色相差不超過tol
function near(avg, exp, tol, msg) {
    for (let i = 0; i < 3; i++) {
        assert.ok(Math.abs(avg[i] - exp[i]) <= tol, `${msg}: got rgb(${avg.join(',')}), expect rgb(${exp.join(',')}) tol ${tol}`)
    }
}


describe(`domConvertToPic (real browser)`, function() {

    let browser = null
    let opened = []

    before(async function() {
        this.timeout(INSTALL_TIMEOUT + 60 * 1000)
        browser = await launchBrowser()
    })

    after(async function() {
        if (browser) {
            await browser.close()
        }
    })

    afterEach(async function() {
        for (let o of opened.splice(0)) {
            try {
                await o.close()
            }
            catch (err) {}
        }
    })

    //open, 開頁(自動套用修前紅驗證之取代), 測試結束由afterEach關閉
    async function open(opt = {}) {
        let o = await openPage(browser, { ...opt, overrides: { ...SRC_OVERRIDE, ...opt.overrides } })
        opened.push(o)
        return o
    }

    //call, 於頁面內對指定id之元素呼叫domConvertToPic, 回傳其結果(字串或img元素之摘要)
    async function call(page, id, opt = {}) {
        return page.evaluate(async ({ id, opt }) => {
            return window.mods.domConvertToPic.default(document.getElementById(id), opt)
        }, { id, opt })
    }

    //analyze, 呼叫後解碼並量測
    async function shot(page, id, opt = {}, regions = [], points = []) {
        let src = await call(page, id, opt)
        assert.ok(typeof src === 'string' && src.startsWith('data:image/'), 'should resolve a data URL string')
        return { src, a: await analyzePic(page, src, regions, points) }
    }


    //--- 基本輸出: 尺寸、顏色、opt.scale、opt.picType、opt.toBase64 ---

    describe(`output (opt.scale, opt.picType, opt.toBase64)`, function() {

        //fixture: 100x40, 左半紅右半藍(絕對定位, 無外距, 輸出尺寸應等於元素尺寸)
        let FX = `<div id="a" data-probe="a" style="position:relative;width:100px;height:40px;background:#fff">` +
            `<div style="position:absolute;left:0;top:0;width:50px;height:40px;background:#f00"></div>` +
            `<div style="position:absolute;left:50px;top:0;width:50px;height:40px;background:#00f"></div></div>`

        it(`should output a PNG data URL as large as the element with its colors visible (default opt)`, async function() {
            let { page } = await open({ body: FX })
            let { src, a } = await shot(page, 'a', {}, [{ x: 5, y: 5, w: 40, h: 30 }, { x: 55, y: 5, w: 40, h: 30 }])
            assert.ok(src.startsWith('data:image/png;base64,'), 'default picType is image/png in base64')
            assert.strict.deepStrictEqual([a.width, a.height], [100, 40])
            near(a.regions[0].avg, [255, 0, 0], 2, 'left block')
            near(a.regions[1].avg, [0, 0, 255], 2, 'right block')
        })

        it(`should enlarge the output by opt.scale (2, 3, 1.5) and keep the colors`, async function() {
            let { page } = await open({ body: FX })
            for (let s of [2, 3, 1.5, '2']) {
                let k = Number(s)
                let { a } = await shot(page, 'a', { scale: s }, [{ x: Math.round(5 * k), y: Math.round(5 * k), w: Math.round(40 * k), h: Math.round(30 * k) }, { x: Math.round(55 * k), y: Math.round(5 * k), w: Math.round(40 * k), h: Math.round(30 * k) }])
                assert.strict.deepStrictEqual([a.width, a.height], [Math.round(100 * k), Math.round(40 * k)], `scale ${s}`)
                near(a.regions[0].avg, [255, 0, 0], 2, `scale ${s} left`)
                near(a.regions[1].avg, [0, 0, 255], 2, `scale ${s} right`)
            }
        })

        it(`should include the margin of the element in the output size (JSDoc: the output size is the layout size of the copy, margin counted)`, async function() {
            let body = `<div id="mg" style="width:100px;height:40px;margin:0 8px 14px 0;background:#00f"></div>`
            let { page } = await open({ body })
            let { a } = await shot(page, 'mg')
            assert.strict.deepStrictEqual([a.width, a.height], [108, 54])
        })

        it(`should use the default scale 1 (not reject) for unexpected opt.scale (below 1, non-number, Infinity, '0x10', null, object)`, async function() {
            let { page } = await open({ body: FX })
            let srcs = await page.evaluate(async () => {
                let out = []
                for (let v of [0.5, 0, -1, 'abc', Infinity, '0x10', null, {}]) {
                    out.push(await window.mods.domConvertToPic.default(document.getElementById('a'), { scale: v }))
                }
                return out
            })
            assert.strict.deepStrictEqual(srcs.length, 8)
            for (let i = 0; i < srcs.length; i++) {
                let a = await analyzePic(page, srcs[i])
                assert.strict.deepStrictEqual([a.width, a.height], [100, 40], `case ${i}`)
            }
        })

        //透明元素: 紅色小塊於(4,4)起20x10, 其餘透明
        let FX_T = `<div id="tp" style="position:relative;width:60px;height:30px"><div style="position:absolute;left:4px;top:4px;width:20px;height:10px;background:#f00"></div></div>`

        it(`should keep the transparent background in PNG and SVG, and fill it white in JPEG (picType image/png, svg, image/jpeg, image/jpg)`, async function() {
            let { page } = await open({ body: FX_T })
            let pts = [{ x: 0, y: 0 }, { x: 10, y: 8 }]
            let png = await shot(page, 'tp', { picType: 'image/png' }, [], pts)
            assert.ok(png.src.startsWith('data:image/png;base64,'))
            assert.strict.deepStrictEqual(png.a.points[0][3], 0, 'png transparent corner')
            near(png.a.points[1], [255, 0, 0], 2, 'png red block')

            for (let t of ['image/jpeg', 'image/jpg']) {
                let jpg = await shot(page, 'tp', { picType: t }, [], pts)
                assert.ok(jpg.src.startsWith('data:image/jpeg;base64,'), t)
                assert.strict.deepStrictEqual([jpg.a.width, jpg.a.height], [60, 30], t)
                assert.strict.deepStrictEqual(jpg.a.points[0][3], 255, `${t} corner is opaque`)
                near(jpg.a.points[0], [255, 255, 255], 4, `${t} corner filled white`)
                near(jpg.a.points[1], [255, 0, 0], 16, `${t} red block`)
            }

            let svg = await shot(page, 'tp', { picType: 'svg' }, [], pts)
            assert.ok(svg.src.startsWith('data:image/svg+xml'), 'svg data URL')
            assert.strict.deepStrictEqual([svg.a.width, svg.a.height], [60, 30])
            assert.strict.deepStrictEqual(svg.a.points[0][3], 0, 'svg transparent corner')
            near(svg.a.points[1], [255, 0, 0], 2, 'svg red block')
        })

        it(`should use image/png for an unsupported picType`, async function() {
            let { page } = await open({ body: FX_T })
            for (let t of ['image/webp', 'png', 123, null, '']) {
                let src = await page.evaluate(async (t) => window.mods.domConvertToPic.default(document.getElementById('tp'), { picType: t }), t)
                assert.ok(src.startsWith('data:image/png;base64,'), String(t))
            }
        })

        it(`should resolve an img element (HTMLImageElement) when opt.toBase64 is false, and a string for true or non-boolean values`, async function() {
            let { page } = await open({ body: FX })
            let r = await page.evaluate(async () => {
                let ele = document.getElementById('a')
                let f = await window.mods.domConvertToPic.default(ele, { toBase64: false })
                let out = { isImg: f instanceof HTMLImageElement, src: f.src.slice(0, 22), nw: f.naturalWidth, nh: f.naturalHeight }
                let types = []
                for (let v of [true, 'false', 0, null, undefined]) {
                    types.push(typeof (await window.mods.domConvertToPic.default(ele, { toBase64: v })))
                }
                out.types = types
                return out
            })
            assert.strict.deepStrictEqual(r.isImg, true)
            assert.strict.deepStrictEqual(r.src, 'data:image/png;base64,')
            assert.strict.deepStrictEqual([r.nw, r.nh], [100, 40])
            assert.strict.deepStrictEqual(r.types, ['string', 'string', 'string', 'string', 'string'])
        })

    })


    //--- DOM殘留與並行 ---

    describe(`leftover nodes and concurrent calls`, function() {

        let FX = `<div id="a" data-probe="a" style="position:relative;width:100px;height:40px;background:#fff"><div style="position:absolute;left:0;top:0;width:50px;height:40px;background:#f00"></div></div>`

        //leftovers, 回傳複本內容(data-probe)之份數與本函數之外層容器(opacity:0之div)之份數
        let leftovers = (page) => page.evaluate(() => ({
            probes: document.querySelectorAll('[data-probe]').length,
            wrappers: Array.from(document.body.children).filter((e) => e.tagName === 'DIV' && e.style.opacity === '0').length,
            parentKept: document.getElementById('a').parentNode === document.body,
        }))

        it(`should leave no node it inserted after one call, repeated calls, and concurrent calls (the original stays the only copy)`, async function() {
            let { page } = await open({ body: FX })
            await call(page, 'a')
            assert.strict.deepStrictEqual(await leftovers(page), { probes: 1, wrappers: 0, parentKept: true }, 'after one call')
            for (let k = 0; k < 3; k++) {
                await call(page, 'a', { scale: 2 })
            }
            assert.strict.deepStrictEqual(await leftovers(page), { probes: 1, wrappers: 0, parentKept: true }, 'after repeated calls')
            let all = await page.evaluate(() => Promise.all([1, 2, 3].map(() => window.mods.domConvertToPic.default(document.getElementById('a'), {}))))
            assert.strict.deepStrictEqual(all.length, 3)
            assert.strict.deepStrictEqual(await leftovers(page), { probes: 1, wrappers: 0, parentKept: true }, 'after concurrent calls')
            let hs = []
            for (let s of all) {
                hs.push((await analyzePic(page, s)).hash)
            }
            let seq = (await analyzePic(page, await call(page, 'a'))).hash
            assert.strict.deepStrictEqual(hs, [seq, seq, seq], 'concurrent outputs equal the sequential output')
        })

        it(`should reject with the capture error and still leave no node when the capture fails`, async function() {
            let { page } = await open({ body: FX, overrides: { [SNAPDOM_PATH]: STUB_FAIL } })
            let r = await page.evaluate(async () => {
                try {
                    await window.mods.domConvertToPic.default(document.getElementById('a'), {})
                    return { ok: true }
                }
                catch (err) {
                    return { ok: false, msg: String(err && err.message) }
                }
            })
            assert.strict.deepStrictEqual(r, { ok: false, msg: 'stub snapdom failure' })
            assert.strict.deepStrictEqual(await leftovers(page), { probes: 1, wrappers: 0, parentKept: true })
        })

        it(`should reject with fixed strings for an invalid element and leave no node`, async function() {
            let { page } = await open({ body: FX })
            let r = await page.evaluate(async () => {
                let out = []
                for (let v of [null, undefined, 'a', {}, document.createTextNode('x')]) {
                    try {
                        await window.mods.domConvertToPic.default(v, {})
                        out.push('resolved')
                    }
                    catch (err) {
                        out.push(err)
                    }
                }
                return out
            })
            assert.strict.deepStrictEqual(r, Array(5).fill('invalid ele: must be an element'))
            assert.strict.deepStrictEqual(await leftovers(page), { probes: 1, wrappers: 0, parentKept: true })
        })

    })


    //--- canvas(第642項缺陷1: 內容截不到) ---

    describe(`canvas content (cloneNode does not copy the bitmap)`, function() {

        //fixture: 位圖bw x bh, 左半紅右半藍, CSS尺寸cw x ch, 外層為block(fit-content, 免inline-block之行盒基線留白使高度多4px)白底padding 10
        let fxCanvas = (bw, bh, cw, ch) => `<div id="cb" data-probe="cb" style="display:block;width:fit-content;background:#fff;padding:10px">` +
            `<canvas id="cv" width="${bw}" height="${bh}" style="display:block;width:${cw}px;height:${ch}px"></canvas></div>` +
            `<script>var c=document.getElementById('cv').getContext('2d');c.fillStyle='#f00';c.fillRect(0,0,${bw}/2,${bh});c.fillStyle='#00f';c.fillRect(${bw}/2,0,${bw}/2,${bh})</script>`

        it(`should show the canvas drawing in the output (left half red, right half blue)`, async function() {
            let { page } = await open({ body: fxCanvas(200, 100, 200, 100) })
            let { a } = await shot(page, 'cb', {}, [{ x: 15, y: 15, w: 90, h: 90 }, { x: 115, y: 15, w: 90, h: 90 }])
            assert.strict.deepStrictEqual([a.width, a.height], [220, 120])
            assert.strict.deepStrictEqual(a.regions[0].nonWhite, 90 * 90, 'red region is entirely drawn')
            assert.strict.deepStrictEqual(a.nonWhite, 200 * 100, 'exactly the canvas area (200x100 inside the 10px padding) is drawn, at the right place')
            near(a.regions[0].avg, [255, 0, 0], 2, 'canvas left half')
            near(a.regions[1].avg, [0, 0, 255], 2, 'canvas right half')
        })

        it(`should show the canvas drawing at the displayed size when the bitmap size differs from the CSS size`, async function() {
            let { page } = await open({ body: fxCanvas(100, 50, 200, 100) })
            let { a } = await shot(page, 'cb', {}, [{ x: 15, y: 15, w: 90, h: 90 }, { x: 115, y: 15, w: 90, h: 90 }])
            assert.strict.deepStrictEqual([a.width, a.height], [220, 120])
            near(a.regions[0].avg, [255, 0, 0], 2, 'canvas left half')
            near(a.regions[1].avg, [0, 0, 255], 2, 'canvas right half')
        })

        it(`should show the canvas drawing with opt.scale`, async function() {
            let { page } = await open({ body: fxCanvas(200, 100, 200, 100) })
            let { a } = await shot(page, 'cb', { scale: 2 }, [{ x: 30, y: 30, w: 180, h: 180 }, { x: 230, y: 30, w: 180, h: 180 }])
            assert.strict.deepStrictEqual([a.width, a.height], [440, 240])
            near(a.regions[0].avg, [255, 0, 0], 2, 'canvas left half')
            near(a.regions[1].avg, [0, 0, 255], 2, 'canvas right half')
        })

        it(`should show the drawing when the element itself is a canvas`, async function() {
            let { page } = await open({ body: fxCanvas(200, 100, 200, 100) })
            let { a } = await shot(page, 'cv', {}, [{ x: 5, y: 5, w: 90, h: 90 }, { x: 105, y: 5, w: 90, h: 90 }])
            assert.strict.deepStrictEqual([a.width, a.height], [200, 100])
            near(a.regions[0].avg, [255, 0, 0], 2, 'canvas left half')
            near(a.regions[1].avg, [0, 0, 255], 2, 'canvas right half')
        })

        it(`should show every canvas (nested at different depths) with its own drawing`, async function() {
            let body = `<div id="mc" data-probe="mc" style="display:block;width:fit-content;background:#fff;padding:10px">` +
                `<canvas id="c1" width="50" height="30" style="display:block"></canvas>` +
                `<div><div><canvas id="c2" width="50" height="30" style="display:block"></canvas></div></div></div>` +
                `<script>var a=document.getElementById('c1').getContext('2d');a.fillStyle='#0a0';a.fillRect(0,0,50,30);var b=document.getElementById('c2').getContext('2d');b.fillStyle='#f0f';b.fillRect(0,0,50,30)</script>`
            let { page } = await open({ body })
            let { a } = await shot(page, 'mc', {}, [{ x: 10, y: 10, w: 50, h: 30 }, { x: 10, y: 40, w: 50, h: 30 }])
            assert.strict.deepStrictEqual([a.width, a.height], [70, 80])
            near(a.regions[0].avg, [0, 170, 0], 2, 'first canvas')
            near(a.regions[1].avg, [255, 0, 255], 2, 'second canvas')
        })

        it(`should not change the original canvas and should not leave a copy`, async function() {
            let { page } = await open({ body: fxCanvas(200, 100, 200, 100) })
            await call(page, 'cb')
            let r = await page.evaluate(() => {
                let d = document.getElementById('cv').getContext('2d').getImageData(0, 0, 200, 100).data
                return { red: Array.from(d.slice(0, 4)), blue: Array.from(d.slice((199) * 4, (199) * 4 + 4)), canvases: document.querySelectorAll('canvas').length }
            })
            assert.strict.deepStrictEqual(r, { red: [255, 0, 0, 255], blue: [0, 0, 255, 255], canvases: 1 })
        })

        it(`should resolve with the canvas region left blank (no reject) for a canvas tainted by a cross-origin image, other content kept`, async function() {
            let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><rect width="100" height="40" fill="#0a0"/></svg>'
            let body = `<div id="tt" data-probe="tt" style="display:block;width:fit-content;background:#fff;padding:10px">` +
                `<canvas id="ct" width="100" height="40" style="display:block"></canvas>` +
                `<div style="width:100px;height:20px;background:#f0f"></div></div>` +
                `<script>var im=new Image();im.onload=function(){document.getElementById('ct').getContext('2d').drawImage(im,0,0);window.__drawn=true};im.src='${CROSS_HOST}/p.svg'</script>`
            let { page } = await open({ body, crossRoutes: { '/p.svg': { contentType: 'image/svg+xml', body: svg } } })
            await page.waitForFunction(() => window.__drawn === true)
            let premise = await page.evaluate(() => {
                try {
                    document.getElementById('ct').getContext('2d').getImageData(0, 0, 1, 1)
                    return 'readable'
                }
                catch (err) {
                    return err.name
                }
            })
            assert.strict.deepStrictEqual(premise, 'SecurityError', 'premise: the canvas is tainted')
            //snapdom於被污染之canvas四周畫1px灰框作標示, 框內為空白: 量測區塊取框內(各邊內縮2px)
            let { a } = await shot(page, 'tt', {}, [{ x: 12, y: 12, w: 96, h: 36 }, { x: 10, y: 50, w: 100, h: 20 }])
            assert.strict.deepStrictEqual([a.width, a.height], [120, 80])
            assert.strict.deepStrictEqual(a.regions[0].nonWhite, 0, 'tainted canvas interior is blank (content is unreadable)')
            near(a.regions[1].avg, [255, 0, 255], 2, 'sibling block is kept')
        })

        it(`should resolve (no reject) for a canvas that cannot be copied (control transferred to an OffscreenCanvas), other content kept`, async function() {
            let body = `<div id="oc" data-probe="oc" style="display:block;width:fit-content;background:#fff;padding:10px">` +
                `<canvas id="co" width="60" height="40" style="display:block"></canvas>` +
                `<div style="width:60px;height:20px;background:#f80"></div></div>` +
                `<script>document.getElementById('co').transferControlToOffscreen()</script>`
            let { page } = await open({ body })
            let { a } = await shot(page, 'oc', {}, [{ x: 10, y: 10, w: 60, h: 40 }, { x: 10, y: 50, w: 60, h: 20 }])
            assert.strict.deepStrictEqual([a.width, a.height], [80, 80])
            assert.strict.deepStrictEqual(a.regions[0].nonWhite, 0, 'uncopyable canvas region is blank')
            near(a.regions[1].avg, [255, 136, 0], 2, 'sibling block is kept')
        })

    })


    //--- 表單現值(cloneNode複製input/textarea之現值與核取狀態, 不複製select之選取) ---

    describe(`form current values (set by property, same output as set by attribute)`, function() {

        //selHtml, 單選下拉; sel為以selected屬性預選之索引(-1為不預選)
        let selHtml = (id, sel) => `<div id="${id}" style="display:inline-block;background:#fff;padding:6px;font:14px Arial">` +
            `<select style="font:14px Arial"><option value="a">AAAAAA</option><option value="b"${sel === 1 ? ' selected' : ''}>BBBBBB</option><option value="c"${sel === 2 ? ' selected' : ''}>CCCCCC</option></select></div>`

        it(`should render the option selected by property (value, selectedIndex) like the one selected by attribute`, async function() {
            let body = selHtml('sa', 2) + selHtml('sb', -1) + selHtml('sc', -1) + selHtml('sd', 1) + selHtml('se', -1) +
                `<script>document.querySelector('#sb select').value='c';document.querySelector('#se select').selectedIndex=1</script>`
            let { page } = await open({ body })
            let h = {}
            for (let id of ['sa', 'sb', 'sc', 'sd', 'se']) {
                h[id] = (await analyzePic(page, await call(page, id))).hash
            }
            assert.notStrictEqual(h.sa, h.sc, 'premise: option CCCCCC and AAAAAA render differently')
            assert.notStrictEqual(h.sd, h.sc, 'premise: option BBBBBB and AAAAAA render differently')
            assert.strict.deepStrictEqual(h.sb, h.sa, 'value="c" set by property renders like the selected attribute on CCCCCC')
            assert.strict.deepStrictEqual(h.se, h.sd, 'selectedIndex=1 set by property renders like the selected attribute on BBBBBB')
        })

        //formHtml, 表單控制項; 屬性版(attr=true)以屬性預設, 否則留待script以屬性(property)設定
        let formHtml = (id, mode) => `<div id="${id}" style="display:inline-block;width:280px;background:#fff;padding:6px;font:14px Arial">` +
            `<input class="t" type="text" style="width:110px"${mode === 'attr' ? ' value="typed value"' : ''}> ` +
            `<input class="c" type="checkbox"${mode === 'attr' ? ' checked' : ''}> ` +
            `<input class="r1" type="radio" name="g${id}"><input class="r2" type="radio" name="g${id}"${mode === 'attr' ? ' checked' : ''}> ` +
            `<textarea class="a" style="width:110px;height:36px">${mode === 'attr' ? 'area value' : ''}</textarea> ` +
            `<input class="g" type="range" min="0" max="10"${mode === 'attr' ? ' value="9"' : ''}></div>`

        it(`should render input, checkbox, radio, textarea and range values set by property like the ones set by attribute`, async function() {
            let body = formHtml('fa', 'attr') + formHtml('fb', 'prop') + formHtml('fc', 'none') +
                `<script>var q=function(s){return document.querySelector(s)};q('#fb .t').value='typed value';q('#fb .c').checked=true;q('#fb .r2').checked=true;q('#fb .a').value='area value';q('#fb .g').value='9'</script>`
            let { page } = await open({ body })
            let h = {}
            for (let id of ['fa', 'fb', 'fc']) {
                h[id] = (await analyzePic(page, await call(page, id))).hash
            }
            assert.notStrictEqual(h.fa, h.fc, 'premise: the filled form renders differently from the empty one')
            assert.strict.deepStrictEqual(h.fb, h.fa, 'property-set values render like attribute-set values')
        })

        it(`should render the selected option when the element itself is a select`, async function() {
            let body = `<select id="ra" style="font:14px Arial"><option value="a">AAAAAA</option><option value="b">BBBBBB</option><option value="c" selected>CCCCCC</option></select>` +
                `<select id="rb" style="font:14px Arial"><option value="a">AAAAAA</option><option value="b">BBBBBB</option><option value="c">CCCCCC</option></select>` +
                `<select id="rc" style="font:14px Arial"><option value="a">AAAAAA</option><option value="b">BBBBBB</option><option value="c">CCCCCC</option></select>` +
                `<script>document.getElementById('rb').value='c'</script>`
            let { page } = await open({ body })
            let h = {}
            for (let id of ['ra', 'rb', 'rc']) {
                h[id] = (await analyzePic(page, await call(page, id))).hash
            }
            assert.notStrictEqual(h.ra, h.rc, 'premise: CCCCCC and AAAAAA render differently')
            assert.strict.deepStrictEqual(h.rb, h.ra, 'a root select set by property renders like the one set by attribute')
        })

        //radio: 同名(無表單)之單選鈕於複本放入頁面後會與原件同組, 原件之勾選被取消
        let radioStates = (page) => page.evaluate(() => Array.from(document.querySelectorAll('[data-rg] input, #fm input, #r4')).map((e) => `${e.id}:${e.checked}`).join(','))
        let RADIO_BODY = `<div id="rg" data-rg="1" style="width:120px;background:#fff"><input type="radio" name="g1" id="r1"><input type="radio" name="g1" id="r2" checked><input type="radio" name="g1" id="r3"></div>` +
            `<form id="fm" style="width:120px;background:#fff"><input type="radio" name="g2" id="q1"><input type="radio" name="g2" id="q2" checked></form>` +
            `<input type="radio" name="g1" id="r4">`

        it(`should not change the checked state of the radio buttons on the page (same-name radios without a form are one group with the copy)`, async function() {
            let { page } = await open({ body: RADIO_BODY })
            let before = await radioStates(page)
            assert.strict.deepStrictEqual(before, 'r1:false,r2:true,r3:false,q1:false,q2:true,r4:false', 'premise: r2 and q2 are checked')
            await call(page, 'rg')
            assert.strict.deepStrictEqual(await radioStates(page), before, 'after one call on the group')
            await call(page, 'fm')
            assert.strict.deepStrictEqual(await radioStates(page), before, 'after a call on the form')
            await page.evaluate(() => Promise.all([1, 2, 3].map(() => window.mods.domConvertToPic.default(document.getElementById('rg'), {}))))
            assert.strict.deepStrictEqual(await radioStates(page), before, 'after concurrent calls')
            await call(page, 'r4')
            assert.strict.deepStrictEqual(await radioStates(page), before, 'after a call on a radio button itself')
        })

        it(`should still render the checked radio button of a named group in the output`, async function() {
            let one = (id, checkedAttr) => `<div id="${id}" style="width:120px;background:#fff"><input type="radio" name="n${id}"><input type="radio" name="n${id}"${checkedAttr}></div>`
            let body = one('xa', ' checked') + one('xb', '') + `<script>document.querySelectorAll('#xb input')[1].checked=true</script>` + one('xc', '')
            let { page } = await open({ body })
            let h = {}
            for (let id of ['xa', 'xb', 'xc']) {
                h[id] = (await analyzePic(page, await call(page, id))).hash
            }
            assert.notStrictEqual(h.xa, h.xc, 'premise: a checked radio renders differently from an unchecked one')
            assert.strict.deepStrictEqual(h.xb, h.xa, 'the checked state survives the copy (name changed on the copy only)')
        })

    })


    //--- 壞圖與圖片載入(第642項缺陷2: 同頁第一次呼叫之輸出高度不穩) ---

    describe(`images (broken image output height, lazy-loading, load wait limit)`, function() {

        //fxBroken, 載入失敗(404)之<img>(width/height屬性60x40, 有alt)與文字; 無外距(輸出尺寸應等於元素尺寸)
        let FX_BROKEN = `<div id="bk" data-probe="bk" style="width:420px;box-sizing:border-box;padding:10px;background:#fff;border:1px solid #999;font:14px Arial">` +
            `<img id="bki" src="/missing.png" width="60" height="40" alt="alt" style="border:1px solid #c00"> <span>image failed to load (404)</span></div>`

        //MISSING, /missing.png皆回404
        let MISSING = { '/missing.png': { status: 404, contentType: 'text/plain', body: 'not found' } }

        //settledHeight, 原元素於其<img>載入失敗後之版面高度(輸出之高度應與之相同; 元素無外距)
        let settledHeight = async (page) => {
            await page.waitForFunction(() => document.getElementById('bki').complete === true)
            return page.evaluate(() => Math.round(document.getElementById('bk').getBoundingClientRect().height))
        }

        //成因: 複本之<img>放入頁面後重新載入, 失敗前以width/height屬性之盒(60x40)排版, 失敗後改為替代文字盒; 截圖時機落在其間則輸出高度為失敗前之版面

        it(`should output the settled layout height for a broken image on the first call of each fresh page (10 fresh pages)`, async function() {
            for (let k = 0; k < 10; k++) {
                let { page, close } = await open({ body: FX_BROKEN, routes: MISSING })
                let h = await settledHeight(page)
                let { a } = await shot(page, 'bk')
                assert.strict.deepStrictEqual([a.width, a.height], [420, h], `fresh page ${k}, first call`)
                await close()
            }
        })

        it(`should output the settled layout height for a broken image on the second and later calls of the same page`, async function() {
            let { page } = await open({ body: FX_BROKEN, routes: MISSING })
            let h = await settledHeight(page)
            for (let j = 1; j <= 4; j++) {
                let { a } = await shot(page, 'bk')
                assert.strict.deepStrictEqual([a.width, a.height], [420, h], `call ${j}`)
            }
        })

        it(`should capture an already loaded image with its content, without waiting for the load wait limit`, async function() {
            let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="30"><rect width="50" height="30" fill="#0a0"/></svg>'
            let body = `<div id="ok" data-probe="ok" style="width:200px;background:#fff"><img id="oki" src="/ok.svg" width="50" height="30" style="display:block"><div style="width:80px;height:10px;background:#f0f"></div></div>`
            let { page } = await open({ body, routes: { '/ok.svg': { contentType: 'image/svg+xml', body: svg } } })
            await page.waitForFunction(() => document.getElementById('oki').complete === true && document.getElementById('oki').naturalWidth > 0)
            let t0 = Date.now()
            let { a } = await shot(page, 'ok', {}, [{ x: 0, y: 0, w: 50, h: 30 }, { x: 0, y: 30, w: 80, h: 10 }])
            let dt = Date.now() - t0
            assert.ok(dt < 3000, `a loaded image must not make the call wait for the load wait limit (took ${dt}ms)`)
            assert.strict.deepStrictEqual([a.width, a.height], [200, 40])
            near(a.regions[0].avg, [0, 170, 0], 2, 'the image content')
            near(a.regions[1].avg, [255, 0, 255], 2, 'the block below the image')
        })

        it(`should not wait for the load wait limit for an img without a source (complete from the start, no load event will come)`, async function() {
            let body = `<div id="ns" data-probe="ns" style="width:200px;background:#fff"><img width="20" height="10" style="display:block"><img src="" width="20" height="10" style="display:block"><div style="width:80px;height:10px;background:#f0f"></div></div>`
            let { page } = await open({ body })
            let t0 = Date.now()
            let { a } = await shot(page, 'ns', {}, [{ x: 0, y: 20, w: 80, h: 10 }])
            let dt = Date.now() - t0
            assert.ok(dt < 3000, `an img without a source must not make the call wait for the load wait limit (took ${dt}ms)`)
            assert.strict.deepStrictEqual([a.width, a.height], [200, 30])
            near(a.regions[0].avg, [255, 0, 255], 2, 'the block below the images')
        })

        //lazy: 遠離視窗(y=20000)之loading="lazy"圖
        let FX_LAZY = `<div id="lz" data-probe="lz" style="width:200px;background:#fff"><div style="height:20000px"></div><img id="lzi" loading="lazy" width="50" height="30" src="/lz.svg" style="display:block"></div>`
        let SVG_G = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="30"><rect width="50" height="30" fill="#0a0"/></svg>'

        it(`should capture a far-away lazy-loading image without waiting for the load wait limit`, async function() {
            let routes = { '/lz.svg': { contentType: 'image/svg+xml', body: SVG_G } }
            let { page } = await open({ body: FX_LAZY, routes })
            let t0 = Date.now()
            let { a } = await shot(page, 'lz', {}, [{ x: 0, y: 20000, w: 50, h: 30 }])
            let dt = Date.now() - t0
            assert.ok(dt < 3500, `a lazy image must not make the call wait for the load wait limit (took ${dt}ms)`)
            assert.strict.deepStrictEqual([a.width, a.height], [200, 20030])
            near(a.regions[0].avg, [0, 170, 0], 2, 'the lazy image is captured')
        })

        it(`should stop waiting for an image that never loads (load wait limit) and still resolve the output`, async function() {
            //遠離視窗之lazy圖, 伺服端不回應: 複本之圖片無法完成載入
            let hang = async () => {
                await new Promise(() => {})
            }
            let routes = { '/lz.svg': hang }
            let { page } = await open({ body: FX_LAZY, routes })
            let t0 = Date.now()
            let { a } = await shot(page, 'lz')
            let dt = Date.now() - t0
            assert.ok(dt < 20000, `must resolve within a bounded time (took ${dt}ms)`)
            assert.strict.deepStrictEqual([a.width, a.height], [200, 20030])
        })

    })

})
