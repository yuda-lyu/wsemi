import assert from 'assert'
import path from 'path'
import { launchBrowser, openPage, INSTALL_TIMEOUT } from './tools/browserKit.mjs'


//domDragPreview之行為測試(真瀏覽器: playwright-core驅動之headless Chromium, 頁面以ES module載入本庫src, 不依賴./dist, 不連外網, 不比對標準圖)
//  規格來源: src/domDragPreview.mjs之JSDoc(預覽為來源元素之拷貝, 拷貝補回canvas位圖與單選select之選取, 原件之單選狀態不被改動)、排程第647項(同domConvertToPic之R-DOMPIC-01成因)
//  修前紅驗證: 環境變數WSEMI_DOMDRAGPREVIEW_SRC指向舊版檔案時, 頁面改載該檔(取代/src/domDragPreview.mjs; 其餘模組仍用本庫src)


let SRC_OVERRIDE = null
if (process.env.WSEMI_DOMDRAGPREVIEW_SRC) {
    SRC_OVERRIDE = { '/src/domDragPreview.mjs': path.resolve(process.env.WSEMI_DOMDRAGPREVIEW_SRC) }
}

//fixture: 來源元素內含canvas(畫上紅色)、單選select(以屬性selectedIndex改為第3項, 非預設)、同名無表單之radio(以屬性checked改勾第1個, 非預設)、複選select
let FX = `<div id="a" style="position:absolute;left:20px;top:30px;width:200px;height:80px;background:#fff">` +
    `<canvas id="cv" width="20" height="10" style="display:block"></canvas>` +
    `<select id="sel"><option>o0</option><option>o1</option><option>o2</option></select>` +
    `<select id="mul" multiple><option>m0</option><option>m1</option></select>` +
    `<input type="radio" name="g" id="r1"><input type="radio" name="g" id="r2" checked>` +
    `</div>` +
    `<script>` +
    `let c = document.getElementById('cv').getContext('2d'); c.fillStyle = 'rgb(255,0,0)'; c.fillRect(0, 0, 20, 10);` +
    `document.getElementById('sel').selectedIndex = 2;` +
    `document.getElementById('r1').checked = true;` +
    `</script>`


describe(`domDragPreview (real browser)`, function() {

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

    //preview, 開頁並對#a建立預覽, 回傳拷貝與原件之狀態
    async function preview() {
        let o = await openPage(browser, { body: FX, mods: { domDragPreview: '/src/domDragPreview.mjs' }, overrides: SRC_OVERRIDE })
        opened.push(o)
        return o.page.evaluate(() => {
            let a = document.getElementById('a')
            let before = {
                r1: document.getElementById('r1').checked,
                r2: document.getElementById('r2').checked,
                sel: document.getElementById('sel').selectedIndex,
            }
            let pv = window.mods.domDragPreview.default()
            pv.createPreview(a, 30, 40)
            let box = document.querySelector('[dragpreviewid]')
            let px = (cv) => {
                let d = cv.getContext('2d').getImageData(10, 5, 1, 1).data
                return [d[0], d[1], d[2], d[3]]
            }
            let copy = box ? box.querySelector('div > div > div') : null
            let r = {
                hasBox: !!box,
                nCopy: box ? box.querySelectorAll('canvas').length : -1,
                copyCanvas: box ? px(box.querySelector('canvas')) : null,
                srcCanvas: px(document.getElementById('cv')),
                copySel: box ? box.querySelectorAll('select')[0].selectedIndex : null,
                srcSel: document.getElementById('sel').selectedIndex,
                copyRadio: box ? [...box.querySelectorAll('input[type=radio]')].map((x) => x.checked) : null,
                srcR1: document.getElementById('r1').checked,
                srcR2: document.getElementById('r2').checked,
                before,
                copyIsClone: !!copy,
            }
            pv.clear()
            r.leftover = document.querySelectorAll('[dragpreviewid]').length
            return r
        })
    }

    it(`前提: the source state is set by properties (canvas drawn red, select index 2, first radio checked), not by the markup defaults`, async function() {
        let r = await preview()
        assert.strict.deepStrictEqual(r.before, { r1: true, r2: false, sel: 2 })
        assert.strict.deepStrictEqual(r.srcCanvas, [255, 0, 0, 255])
    })

    it(`the copy in the preview should carry the canvas bitmap of the source (cloneNode gives a blank canvas)`, async function() {
        let r = await preview()
        assert.strict.deepStrictEqual([r.hasBox, r.nCopy], [true, 1])
        assert.strict.deepStrictEqual(r.copyCanvas, [255, 0, 0, 255])
    })

    it(`the copy in the preview should carry the current selection of a single select (cloneNode falls back to the default option)`, async function() {
        let r = await preview()
        assert.strict.deepStrictEqual([r.copySel, r.srcSel], [2, 2])
    })

    it(`inserting the preview should not uncheck the checked radio of the source (same name, no form), and the copy keeps the checked state`, async function() {
        let r = await preview()
        assert.strict.deepStrictEqual([r.srcR1, r.srcR2], [true, false])
        assert.strict.deepStrictEqual(r.copyRadio, [true, false])
    })

    it(`clear() should remove the preview from the page`, async function() {
        let r = await preview()
        assert.strict.deepStrictEqual(r.leftover, 0)
    })

})
