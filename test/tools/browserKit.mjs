import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright-core'


//browserKit, 真瀏覽器測試之共用基建(測試工具, 不帶.test.中綴; 只供test/內之瀏覽器行為測試使用)
//  - 瀏覽器: 由playwright-core(devDependencies)驅動其受管之headless shell; 已安裝者不重新下載, 未安裝時才以其CLI安裝(installBrowser)
//  - 頁面載入wsemi原始碼: 以page.route供應虛擬主機http://wsemi.test/之/src/*與/node_modules/*(讀本庫實檔, 不連網、不開埠、不依賴./dist), 搭配import map解析裸模組名
//  - 全部不寫入本庫任何檔案(不產暫存檔)


let _require = createRequire(import.meta.url)

//ROOT, 本庫根(test/tools/之上兩層)
let ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

//HOST, 虛擬主機; CROSS_HOST, 與HOST不同源之虛擬主機
let HOST = 'http://wsemi.test'
let CROSS_HOST = 'http://cross.test'

//INSTALL_TIMEOUT, 首次取得瀏覽器之時限毫秒(含Playwright自己之安裝鎖等候; 逾時即結束安裝子行程樹並拋錯)
let INSTALL_TIMEOUT = 10 * 60 * 1000

//IMPORT_MAP, 裸模組名之解析(只列src所需者; 缺漏時頁面載入模組會失敗並由openPage拋出)
let IMPORT_MAP = {
    imports: {
        '@zumer/snapdom': '/node_modules/@zumer/snapdom/dist/snapdom.mjs',
        'lodash-es': '/node_modules/lodash-es/lodash.js',
        'lodash-es/': '/node_modules/lodash-es/',
    },
}

let MIME = {
    '.mjs': 'text/javascript; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
}


/**
 * 結束子行程樹並等待其完成(永不reject; Windows以taskkill /T /F, 其餘以行程群組SIGKILL)
 */
function killTree(cp) {
    return new Promise((resolve) => {
        let t = setTimeout(resolve, 10000)
        let end = () => {
            clearTimeout(t)
            resolve()
        }
        try {
            if (!cp || !cp.pid) {
                end()
                return
            }
            if (process.platform === 'win32') {
                let tk = process.env.SystemRoot ? path.join(process.env.SystemRoot, 'System32', 'taskkill.exe') : 'taskkill'
                let k = spawn(tk, ['/pid', String(cp.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
                k.on('error', end)
                k.on('close', end)
            }
            else {
                try {
                    process.kill(-cp.pid, 'SIGKILL')
                }
                catch (err) {
                    cp.kill('SIGKILL')
                }
                end()
            }
        }
        catch (err) {
            end()
        }
    })
}


/**
 * 以playwright-core之CLI安裝受管之headless shell(--no-remove: 不移除本機他版本之瀏覽器)
 * 跨行程並行之安裝由Playwright自身之目錄鎖(瀏覽器目錄內__dirlock)序列化, 已安裝者不重新下載
 * 子行程隱藏視窗; 逾時結束整個子行程樹並reject
 */
function installBrowser(timeout = INSTALL_TIMEOUT) {
    return new Promise((resolve, reject) => {
        let cli = path.join(path.dirname(_require.resolve('playwright-core/package.json')), 'cli.js')
        let tail = ''
        let done = false
        let timedOut = false
        let cp = spawn(process.execPath, [cli, 'install', '--no-remove', '--only-shell', 'chromium'], {
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: process.platform !== 'win32',
        })
        let timer = setTimeout(() => {
            timedOut = true
            killTree(cp).then(() => {
                finish(new Error(`browser installation timed out after ${timeout}ms`))
            })
        }, timeout)
        let finish = (err) => {
            if (done) {
                return
            }
            done = true
            clearTimeout(timer)
            if (err) {
                reject(err)
            }
            else {
                resolve()
            }
        }
        let onData = (d) => {
            tail = (tail + String(d)).slice(-1500)
        }
        cp.stdout.on('data', onData)
        cp.stderr.on('data', onData)
        cp.on('error', (err) => {
            if (!timedOut) {
                finish(new Error(`browser installation failed to start: ${err.message}`))
            }
        })
        cp.on('close', (code) => {
            if (timedOut) {
                return
            }
            if (code === 0) {
                finish(null)
            }
            else {
                finish(new Error(`browser installation failed with exit code ${code}: ${tail}`))
            }
        })
    })
}


/**
 * 啟動headless瀏覽器: 已安裝者直接啟動; 受管瀏覽器不存在時才安裝(installBrowser)後再啟動一次
 * 取不到瀏覽器(離線、安裝失敗)時拋錯(fail-closed, 不略過測試); 離線環境請預先安裝或設定PLAYWRIGHT_BROWSERS_PATH
 */
async function launchBrowser(opt = {}) {
    let timeout = opt.installTimeout || INSTALL_TIMEOUT
    try {
        return await chromium.launch({ headless: true })
    }
    catch (err) {
        if (!/Executable doesn't exist/i.test(String(err && err.message))) {
            throw err
        }
    }
    await installBrowser(timeout)
    return await chromium.launch({ headless: true })
}


//findPkgDir, 依Node之解析慣例由本庫根向上找node_modules/<套件名>之資料夾(發布包解開之目錄無node_modules, 相依在其上層); 找不到回null
let _pkgDirs = new Map()
function findPkgDir(name) {
    if (_pkgDirs.has(name)) {
        return _pkgDirs.get(name)
    }
    let found = null
    for (let dir = ROOT; ;) {
        let c = path.join(dir, 'node_modules', name)
        if (fs.existsSync(path.join(c, 'package.json'))) {
            found = c
            break
        }
        let up = path.dirname(dir)
        if (up === dir) {
            break
        }
        dir = up
    }
    _pkgDirs.set(name, found)
    return found
}


/**
 * 解析請求路徑對應之檔案(限/src/(本庫)與/node_modules/<套件>/(依Node解析慣例找套件資料夾)之下, 擋路徑跳脫); 不合回null
 */
function resolveFile(pathname, overrides) {
    let p = ''
    try {
        p = decodeURIComponent(pathname)
    }
    catch (err) {
        return null
    }
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, p)) {
        return overrides[p]
    }
    let base = null
    let rest = ''
    if (p.startsWith('/src/')) {
        base = path.join(ROOT, 'src')
        rest = './' + p.slice('/src/'.length)
    }
    else if (p.startsWith('/node_modules/')) {
        let segs = p.slice('/node_modules/'.length).split('/')
        let n = segs[0].startsWith('@') ? 2 : 1
        base = findPkgDir(segs.slice(0, n).join('/'))
        rest = './' + segs.slice(n).join('/')
    }
    if (base === null) {
        return null
    }
    let fp = path.resolve(base, rest)
    let rel = path.relative(base, fp)
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        return null
    }
    return fp
}


/**
 * 組頁面: fixture(body內html)＋import map＋載入模組之module script
 * mods: { 名稱: 模組路徑 }, 載入後以命名空間物件存於window.mods[名稱]; 全部載入完成才設window.__ready, 載入失敗設window.__error
 */
function buildHtml(body, mods, head) {
    let names = Object.keys(mods)
    let imports = names.map((k, i) => `import * as m${i} from '${mods[k]}'`).join('\n')
    let sets = names.map((k, i) => `window.mods['${k}'] = m${i}`).join('\n')
    let boot = `window.mods = {}\n${imports}\n${sets}\nwindow.__ready = true`
    return `<!doctype html><html><head><meta charset="utf-8">` +
        `<script type="importmap">${JSON.stringify(IMPORT_MAP)}</script>${head}</head>` +
        `<body style="margin:0">${body}` +
        `<script type="module">${boot}</script>` +
        `<script>window.addEventListener('error', (e)=>{ if(!window.__ready){ window.__error = String(e.message||e) } })</script>` +
        `</body></html>`
}


/**
 * 開新頁面(獨立context, 呼叫端負責close)
 *
 * @param {Object} browser 輸入launchBrowser回傳之瀏覽器
 * @param {Object} [opt] 輸入設定
 * @param {String} [opt.body=''] fixture之body內html(可含內嵌script)
 * @param {String} [opt.head=''] 額外之head內html(如style)
 * @param {Object} [opt.mods] 載入之模組, 預設{ domConvertToPic: '/src/domConvertToPic.mjs' }
 * @param {Object} [opt.routes] 額外虛擬資源, { 路徑: { status, contentType, body } 或 (route)=>Promise }
 * @param {Object} [opt.crossRoutes] 跨源虛擬主機(CROSS_HOST)之資源, 格式同routes
 * @param {Object} [opt.overrides] 以他檔取代某路徑之內容, { '/src/xxx.mjs': 絕對路徑 }(供修前紅驗證)
 * @param {Object} [opt.viewport] 預設{ width: 1000, height: 900 }
 * @param {Number} [opt.deviceScaleFactor=1]
 * @returns {Promise<Object>} { page, ctx, logs, close }
 */
async function openPage(browser, opt = {}) {
    let mods = opt.mods || { domConvertToPic: '/src/domConvertToPic.mjs' }
    let routes = opt.routes || {}
    let overrides = opt.overrides || null
    let html = buildHtml(opt.body || '', mods, opt.head || '')
    let ctx = await browser.newContext({
        viewport: opt.viewport || { width: 1000, height: 900 },
        deviceScaleFactor: opt.deviceScaleFactor || 1,
    })
    let page = await ctx.newPage()
    let logs = { console: [], pageerror: [], requestfailed: [] }
    page.on('console', (m) => {
        logs.console.push({ type: m.type(), text: m.text().slice(0, 300) })
    })
    page.on('pageerror', (e) => {
        logs.pageerror.push(String((e && e.message) || e).slice(0, 300))
    })
    page.on('requestfailed', (r) => {
        logs.requestfailed.push(r.url().slice(0, 200))
    })
    await page.route(`${HOST}/**`, async (route) => {
        let u = new URL(route.request().url())
        let r = Object.prototype.hasOwnProperty.call(routes, u.pathname) ? routes[u.pathname] : null
        if (typeof r === 'function') {
            await r(route)
            return
        }
        if (r) {
            await route.fulfill({ status: r.status || 200, contentType: r.contentType || 'application/octet-stream', body: r.body })
            return
        }
        if (u.pathname === '/index.html') {
            await route.fulfill({ status: 200, contentType: MIME['.html'], body: html })
            return
        }
        let fp = resolveFile(u.pathname, overrides)
        if (fp && fs.existsSync(fp) && fs.statSync(fp).isFile()) {
            await route.fulfill({ status: 200, contentType: MIME[path.extname(fp)] || 'application/octet-stream', body: fs.readFileSync(fp) })
            return
        }
        await route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' })
    })
    //跨源虛擬主機(與HOST不同源; 供測試跨源資源, 如使canvas被污染), 只供應opt.crossRoutes之路徑, 其餘404
    let crossRoutes = opt.crossRoutes || {}
    await page.route(`${CROSS_HOST}/**`, async (route) => {
        let u = new URL(route.request().url())
        let r = Object.prototype.hasOwnProperty.call(crossRoutes, u.pathname) ? crossRoutes[u.pathname] : null
        if (typeof r === 'function') {
            await r(route)
            return
        }
        if (r) {
            await route.fulfill({ status: r.status || 200, contentType: r.contentType || 'application/octet-stream', body: r.body })
            return
        }
        await route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' })
    })
    await page.goto(`${HOST}/index.html`, { waitUntil: 'load' })
    try {
        await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 })
    }
    catch (err) {
        throw new Error(`page modules not ready: ${JSON.stringify(logs.pageerror)}`)
    }
    let er = await page.evaluate(() => window.__error || '')
    if (er) {
        throw new Error(`page module error: ${er} ${JSON.stringify(logs.pageerror)}`)
    }
    return {
        page,
        ctx,
        logs,
        close: async () => {
            await ctx.close()
        },
    }
}


/**
 * 於頁面內解碼輸出圖(data URL或img元素之src), 回傳尺寸與像素量測
 *
 * @param {Object} page Playwright頁面
 * @param {String} src 輸入圖片之data URL
 * @param {Array} [regions=[]] 量測區塊 [{ x, y, w, h }], 座標為輸出圖之像素
 * @param {Array} [points=[]] 取原始RGBA(不先填白)之點 [{ x, y }]
 * @returns {Promise<Object>} { width, height, nonWhite, total, hash, regions: [{ x, y, w, h, nonWhite, total, avg:[r,g,b], colors }], points: [[r,g,b,a]], error }
 *   nonWhite: 非白像素數(任一通道<250或alpha<250之像素, 即與白底有明顯差異者); colors: 區塊內相異色數(量化為每通道16階)
 */
async function analyzePic(page, src, regions = [], points = []) {
    return page.evaluate(async ({ src, regions, points }) => {
        let img = await new Promise((resolve, reject) => {
            let i = new Image()
            i.onload = () => resolve(i)
            i.onerror = () => reject(new Error('pic decode failed'))
            i.src = src
        })
        let w = img.naturalWidth
        let h = img.naturalHeight
        let cv = document.createElement('canvas')
        cv.width = w
        cv.height = h
        let cx = cv.getContext('2d')
        cx.fillStyle = '#fff'
        cx.fillRect(0, 0, w, h)
        cx.drawImage(img, 0, 0)
        let data
        try {
            data = cx.getImageData(0, 0, w, h).data
        }
        catch (err) {
            return { width: w, height: h, error: 'tainted' }
        }
        let stat = (x0, y0, rw, rh) => {
            let nonWhite = 0
            let sr = 0
            let sg = 0
            let sb = 0
            let total = 0
            let set = new Set()
            for (let y = y0; y < Math.min(h, y0 + rh); y++) {
                for (let x = x0; x < Math.min(w, x0 + rw); x++) {
                    let k = (y * w + x) * 4
                    let r = data[k]
                    let g = data[k + 1]
                    let b = data[k + 2]
                    total++
                    sr += r
                    sg += g
                    sb += b
                    if (r < 250 || g < 250 || b < 250) {
                        nonWhite++
                    }
                    set.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4))
                }
            }
            return { x: x0, y: y0, w: rw, h: rh, nonWhite, total, avg: total ? [Math.round(sr / total), Math.round(sg / total), Math.round(sb / total)] : [0, 0, 0], colors: set.size }
        }
        let all = stat(0, 0, w, h)

        //hash, 全部像素(已填白合成後)之FNV-1a雜湊, 供比對兩張輸出之像素是否完全相同(同一次執行內比對, 不作標準圖)
        let hash = 2166136261
        for (let k = 0; k < data.length; k++) {
            hash = Math.imul(hash ^ data[k], 16777619) >>> 0
        }

        //points: 原始RGBA(不先填白), 供判斷透明度
        let cv2 = document.createElement('canvas')
        cv2.width = w
        cv2.height = h
        let cx2 = cv2.getContext('2d')
        cx2.drawImage(img, 0, 0)
        let pts = points.map((p) => Array.from(cx2.getImageData(p.x, p.y, 1, 1).data))

        return { width: w, height: h, nonWhite: all.nonWhite, total: all.total, hash, regions: regions.map((r) => stat(r.x, r.y, r.w, r.h)), points: pts }
    }, { src, regions, points })
}


export {
    ROOT,
    HOST,
    CROSS_HOST,
    INSTALL_TIMEOUT,
    launchBrowser,
    installBrowser,
    openPage,
    analyzePic
}
