import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsCreateFileCore from '../src/fsCreateFileCore.mjs'


//規格: 排程第492項第1批(盤點報告〈建議之處理批次〉批6, 文件修正不改行為); dspec〈輸入參數之檢測機制〉§8 V23(JSDoc須寫明種類與處置)
//  JSDoc之型別錯字Unit8Array、參數名/回傳型別/說明與程式不符者, 以本檔鎖定(JSDoc為文字, 以讀src檔斷言)


let __dirname = dirname(fileURLToPath(import.meta.url))
let fdSrc = join(__dirname, '..', 'src')

let readSrc = (name) => fs.readFileSync(join(fdSrc, `${name}.mjs`), 'utf8')

//getDoc, 取第一個JSDoc區塊(第一個/**至*/)
let getDoc = (name) => {
    let c = readSrc(name)
    let i = c.indexOf('/**')
    let j = c.indexOf('*/', i)
    return c.slice(i, j)
}

//getSigNames, 取函數簽名之參數名(依序), 不含預設值; 函數為名稱同檔名之function
let getSigNames = (name) => {
    let c = readSrc(name)
    let m = new RegExp(`function\\s+${name}\\s*\\(`).exec(c)
    assert.ok(m, `no function ${name}`)
    let i = m.index + m[0].length
    let depth = 1
    let j = i
    for (; j < c.length && depth > 0; j++) {
        let ch = c[j]
        if (ch === '(' || ch === '[' || ch === '{') {
            depth++
        }
        else if (ch === ')' || ch === ']' || ch === '}') {
            depth--
        }
    }
    let s = c.slice(i, j - 1)
    let names = []
    let d = 0
    let cur = ''
    for (let ch of s) {
        if (ch === '(' || ch === '[' || ch === '{') {
            d++
        }
        else if (ch === ')' || ch === ']' || ch === '}') {
            d--
        }
        if (ch === ',' && d === 0) {
            names.push(cur)
            cur = ''
        }
        else {
            cur += ch
        }
    }
    names.push(cur)
    return names.map((x) => x.split('=')[0].trim()).filter((x) => x !== '')
}

//getDocParamsAll, 取JSDoc之全部@param名稱(含巢狀, 如opt.xxx)
let getDocParamsAll = (name) => {
    let d = getDoc(name)
    let names = []
    for (let m of d.matchAll(/@param\s+\{[^}]*\}\s+\[?([A-Za-z_$][\w$.]*)/g)) {
        names.push(m[1])
    }
    return names
}

//getDocParams, 取JSDoc之頂層@param名稱(依序、去重), 巢狀名稱(如opt.xxx、data.binarys)取其根名稱
let getDocParams = (name) => {
    let names = []
    for (let n of getDocParamsAll(name)) {
        let root = n.split('.')[0]
        if (!names.includes(root)) {
            names.push(root)
        }
    }
    return names
}


describe(`JSDoc文字修正(排程第492項第1批, 不改行為)`, function() {

    describe(`型別錯字Unit8Array(應為Uint8Array)`, function() {

        it(`should not contain the misspelled type Unit8Array in any src file`, function() {
            let bad = []
            for (let f of fs.readdirSync(fdSrc)) {
                if (!f.endsWith('.mjs')) {
                    continue
                }
                if (readSrc(f.slice(0, -4)).indexOf('Unit8Array') >= 0) {
                    bad.push(f)
                }
            }
            assert.strict.deepStrictEqual(bad, [])
        })

        //[函數, 該JSDoc應含之正確寫法]
        let fixed = [
            ['ab2u8arr', '@returns {Uint8Array|Object}'],
            ['bs2u8arr', '@returns {Uint8Array|Object}'],
            ['getBufferSize', '@param {Uint8Array|Buffer} buf'],
            ['obj2stru8arr', '各Uint8Array數據'],
            ['stru8arr2obj', '@param {Array} data.binarys 輸入Uint8Array陣列'],
            ['u8arr2bs', '@param {Uint8Array} u8a'],
            ['u8arr2blob', '@param {Uint8Array} u8a'],
        ]
        for (let [name, s] of fixed) {
            it(`${name}: the JSDoc should state Uint8Array`, function() {
                assert.ok(getDoc(name).indexOf(s) >= 0, s)
            })
        }

    })

    describe(`@param名稱須與函數簽名一致(參數名不符之處)`, function() {

        //前13個為任務書所列之函數與本批改動之函數; 後7個為Uint8Array錯字所在之函數(外審terra #16 指出bs2u8arr之bs、obj2stru8arr之data與簽名不符)
        let names = ['domCancelEvent', 'domCompareText', 'domFinds', 'domElementsFromPoint', 'domDropFiles', 'fsCreateFile', 'fsCreateFileCore', 'fsTreeFolderWithHash', 'fsTreeFolderWithHashCore', 'treeToFilepath', 'objSortByKeys', 'arr2dt', 'pseudoRandomIntsNdpRange', 'ab2u8arr', 'bs2u8arr', 'getBufferSize', 'obj2stru8arr', 'stru8arr2obj', 'u8arr2bs', 'u8arr2blob']
        for (let name of names) {
            it(`${name}: the top-level @param names should equal the signature names`, function() {
                assert.strict.deepStrictEqual(getDocParams(name), getSigNames(name))
            })
        }

    })

    describe(`逐項`, function() {

        it(`domCancelEvent: the event parameter is e and its type is Event`, function() {
            let d = getDoc('domCancelEvent')
            assert.ok(d.indexOf('@param {Event} e ') >= 0)
            assert.ok(d.indexOf('HTMLEvent') < 0)
            assert.ok(d.indexOf('@param {HTMLEvent} event') < 0)
        })

        it(`domCompareText: the display mode key is opt.format (the code reads format), not opt.fmt`, function() {
            let d = getDoc('domCompareText')
            assert.ok(d.indexOf('opt.format') >= 0)
            assert.ok(d.indexOf('opt.fmt') < 0)
            //程式讀取之鍵名與JSDoc一致
            assert.ok(readSrc('domCompareText').indexOf(`get(opt, 'format')`) >= 0)
        })

        it(`domFinds: returns a NodeList (document.querySelectorAll), not an Array`, function() {
            let d = getDoc('domFinds')
            assert.ok(d.indexOf('@returns {NodeList|Array}') >= 0) //ws492e: 無效輸入時回空陣列[](查詢類), 有效時為NodeList
            assert.ok(d.indexOf('@returns {Array}') < 0)
            assert.ok(readSrc('domFinds').indexOf('document.querySelectorAll') >= 0)
        })

        it(`domElementsFromPoint: clientY is the y coordinate of the viewport`, function() {
            let d = getDoc('domElementsFromPoint')
            let line = d.split('\n').find((l) => l.indexOf('@param {Number|String} clientY') >= 0) //ws492e: 型別改為Number|String(有效數字, 數字字串亦可)
            assert.ok(line, 'no clientY line')
            assert.ok(line.indexOf('y座標') >= 0, line)
            assert.ok(line.indexOf('x座標') < 0, line)
            //clientX維持x座標
            let lineX = d.split('\n').find((l) => l.indexOf('@param {Number|String} clientX') >= 0)
            assert.ok(lineX.indexOf('x座標') >= 0)
        })

        for (let name of ['fsTreeFolderWithHash', 'fsTreeFolderWithHashCore']) {
            it(`${name}: opt.forFolder is whether to compute the hash for folders (not for files)`, function() {
                let d = getDoc(name)
                let line = d.split('\n').find((l) => l.indexOf('opt.forFolder') >= 0)
                assert.ok(line, 'no forFolder line')
                assert.ok(line.indexOf('針對資料夾計算HASH值') >= 0, line)
                assert.ok(line.indexOf('針對檔案') < 0, line)
                //forFile仍為檔案
                let lineFile = d.split('\n').find((l) => l.indexOf('opt.forFile') >= 0)
                assert.ok(lineFile.indexOf('針對檔案計算HASH值') >= 0)
            })
        }

        for (let name of ['fsCreateFile', 'fsCreateFileCore']) {
            it(`${name}: opt is an object only (a string such as an encoding is not accepted as opt)`, function() {
                let d = getDoc(name)
                let line = d.split('\n').find((l) => /@param \{[^}]*\} \[opt=\{\}\]/.test(l))
                assert.ok(line, 'no opt line')
                assert.ok(line.indexOf('Object|String') < 0, line)
                assert.ok(line.indexOf('或是編碼字串') < 0, line)
                assert.ok(line.indexOf('@param {Object} [opt={}]') >= 0, line)
                assert.ok(getDocParamsAll(name).includes('opt.encoding'))
            })
        }

        describe(`fsCreateFile: 實際行為與JSDoc一致(真檔案於test/_tmp/jsdocFixes/)`, function() {

            let fd = join(__dirname, '_tmp', 'jsdocFixes')

            before(function() {
                fs.rmSync(fd, { recursive: true, force: true })
                fs.mkdirSync(fd, { recursive: true })
            })

            after(function() {
                fs.rmSync(fd, { recursive: true, force: true })
            })

            it(`a string opt (an encoding shorthand) is not used: the data is written as utf8`, function() {
                let fp = join(fd, 'str-opt.txt')
                let r = fsCreateFile(fp, '€', 'latin1')
                assert.ok(typeof r.success === 'string', JSON.stringify(r))
                assert.strict.deepStrictEqual([...fs.readFileSync(fp)], [0xE2, 0x82, 0xAC]) //utf8之€; 若採latin1則為單一位元組0x3F
            })

            it(`an object opt.encoding is used`, function() {
                let fp = join(fd, 'obj-opt.txt')
                let r = fsCreateFile(fp, 'é', { encoding: 'latin1' })
                assert.ok(typeof r.success === 'string', JSON.stringify(r))
                assert.strict.deepStrictEqual([...fs.readFileSync(fp)], [0xE9])
            })

            it(`opt.mode and opt.flag are not passed to writeFileSync (the JSDoc says they are not implemented)`, function() {
                let fp = join(fd, 'mode-flag.txt')
                let captured = null
                let wrapped = {
                    ...fs,
                    writeFileSync: (p, d, o) => {
                        captured = o
                        return fs.writeFileSync(p, d, o)
                    },
                }
                let r = fsCreateFileCore(fp, 'x', { fs: wrapped, mode: 0o600, flag: 'wx' })
                assert.ok(typeof r.success === 'string', JSON.stringify(r))
                assert.strict.deepStrictEqual(captured, { encoding: 'utf8' })
                for (let name of ['fsCreateFile', 'fsCreateFileCore']) {
                    let d = getDoc(name)
                    for (let k of ['opt.mode', 'opt.flag']) {
                        let line = d.split('\n').find((l) => l.indexOf(k) >= 0)
                        assert.ok(line && line.indexOf('目前未實作') >= 0, `${name} ${k}`)
                    }
                }
            })

        })

        it(`domDropFiles: @returns describes the evem emitter (on/emit), the events dropIn, dropOut, getFiles, error and that off() removes the DOM listeners`, function() {
            let d = getDoc('domDropFiles')
            let i = d.indexOf('@returns')
            let line = d.slice(i, d.indexOf('\n', i))
            for (let s of ['dropIn', 'dropOut', 'getFiles', 'error', 'on', 'off', 'cb']) {
                assert.ok(line.indexOf(s) >= 0, s)
            }
            //修前寫「包含emit與off事件」, 而off為函數、不是事件, 且emit為EventEmitter之方法
            assert.ok(line.indexOf('包含emit與off事件') < 0, line)
            assert.ok(line.indexOf('移除') >= 0, line)
            //外審terra #12: off呼叫前已排定之100ms判定仍會派發dropOut, 故不得寫「不再觸發事件」
            assert.ok(line.indexOf('不再觸發事件') < 0, line)
            assert.ok(line.indexOf('呼叫前已排定之100ms判定與讀取中者，其對ev之派發維持原行為') >= 0, line)
            //程式: ev.off = off(覆寫EventEmitter.off, 無事件名參數)
            assert.ok(readSrc('domDropFiles').indexOf('ev.off = off') >= 0)
        })

        it(`domCompareText: opt is spread into Diff2Html after outputFormat (so an opt.outputFormat overrides what format gives), and the JSDoc says so (terra #15)`, function() {
            let c = readSrc('domCompareText')
            assert.ok(c.indexOf('outputFormat,\n        ...opt,') >= 0 || c.indexOf('outputFormat,\r\n        ...opt,') >= 0)
            assert.ok(getDoc('domCompareText').indexOf('outputFormat若有給則覆蓋由format換算之值') >= 0)
        })

    })

})
