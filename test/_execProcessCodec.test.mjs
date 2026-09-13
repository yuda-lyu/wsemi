import assert from 'assert'
import cp from 'child_process'
import codec from '../src/_execProcessCodec.mjs'


//consoleCodePage, 取本機主控台字碼頁編號, 僅win32, 供依環境決定是否跳過
function consoleCodePage() {
    if (process.platform !== 'win32') {
        return null
    }
    try {
        let s = cp.execSync('chcp', { encoding: 'latin1', windowsHide: true })
        let m = /(\d+)\s*$/.exec(s)
        return (m !== null) ? Number(m[1]) : null
    }
    catch (err) {
        return null
    }
}


//b, 以位元組陣列建立Buffer
let b = (arr) => {
    return Buffer.from(arr)
}


describe(`_execProcessCodec`, function() {

    describe(`normalizeCodeCmd`, function() {

        it(`should default to utf-8 when codeCmd is not an effective string`, function() {
            for (let v of [undefined, null, '', 123, {}, [], true]) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v), { mode: 'fixed', label: 'utf-8' })
            }
        })

        it(`should accept utf8 label variants`, function() {
            for (let v of ['utf8', 'utf-8', 'UTF-8', ' Utf8 ']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v), { mode: 'fixed', label: 'utf-8' })
            }
        })

        it(`should map big5 and its Windows code page aliases to big5`, function() {
            for (let v of ['big5', 'Big5', 'cp950', 'CP950', '950', 'windows-950']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v), { mode: 'fixed', label: 'big5' })
            }
        })

        it(`should map gbk, shift_jis and euc-kr aliases`, function() {
            for (let v of ['gbk', 'gb2312', 'cp936', '936']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v).label, 'gbk', v)
            }
            for (let v of ['shift_jis', 'shift-jis', 'sjis', 'cp932', '932']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v).label, 'shift_jis', v)
            }
            for (let v of ['euc-kr', 'euckr', 'cp949', '949']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v).label, 'euc-kr', v)
            }
        })

        it(`should map the latin1 family, 437 and 1252 to windows-1252`, function() {
            for (let v of ['latin1', 'iso-8859-1', 'ascii', 'cp1252', 'windows-1252', '1252', 'cp437', '437']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v).label, 'windows-1252', v)
            }
        })

        it(`should map utf16le and ucs2 to utf-16le`, function() {
            for (let v of ['utf16le', 'utf-16le', 'ucs2', 'ucs-2']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v).label, 'utf-16le', v)
            }
        })

        it(`should return mode auto and system`, function() {
            assert.strict.deepStrictEqual(codec.normalizeCodeCmd('auto'), { mode: 'auto', label: null })
            assert.strict.deepStrictEqual(codec.normalizeCodeCmd('AUTO'), { mode: 'auto', label: null })
            assert.strict.deepStrictEqual(codec.normalizeCodeCmd('system'), { mode: 'system', label: null })
        })

        it(`should return null for unsupported labels`, function() {
            for (let v of ['no-such-encoding', 'hex', 'base64', 'binary', 'buffer', 'cp99999', '99999']) {
                assert.strict.deepStrictEqual(codec.normalizeCodeCmd(v), null, v)
            }
        })

    })

    describe(`codePageToLabel`, function() {

        it(`should map known Windows code pages`, function() {
            let kp = {
                '65001': 'utf-8',
                '950': 'big5',
                '936': 'gbk',
                '932': 'shift_jis',
                '949': 'euc-kr',
                '437': 'windows-1252',
                '1252': 'windows-1252',
                '1250': 'windows-1250',
                '866': 'ibm866',
                '1200': 'utf-16le',
            }
            for (let k in kp) {
                assert.strict.deepStrictEqual(codec.codePageToLabel(k), kp[k], k)
            }
            assert.strict.deepStrictEqual(codec.codePageToLabel(950), 'big5')
        })

        it(`should return null for unknown code pages`, function() {
            assert.strict.deepStrictEqual(codec.codePageToLabel('99999'), null)
        })

    })

    describe(`utf8TailLen`, function() {

        it(`should measure an incomplete trailing utf-8 sequence`, function() {
            let cases = [
                [[], 0],
                [[0x41], 0],
                [[0xe7, 0x84, 0xa1], 0],
                [[0xe7, 0x84], 2],
                [[0x41, 0xe7], 1],
                [[0xf0, 0x9f, 0x98], 3],
                [[0xc2], 1],
                [[0x80, 0x80, 0x80, 0x80], 0],
                [[0xe7, 0x84, 0x41], 0],
                [[0xe0, 0x80], 0], //第2位元組低於E0之下界A0, 非法而非未完成
                [[0xed, 0xa0], 0], //surrogate, 非法
                [[0xf4, 0x90], 0], //超出U+10FFFF, 非法
                [[0xe0, 0xa0], 2],
                [[0xc0], 0],
                [[0xff], 0],
            ]
            for (let [arr, n] of cases) {
                assert.strict.deepStrictEqual(codec.utf8TailLen(b(arr)), n, JSON.stringify(arr))
            }
        })

    })

    describe(`createDecoder with a fixed label`, function() {

        it(`should decode a utf-8 character split across chunks`, function() {
            let d = codec.createDecoder('utf-8')
            assert.strict.deepStrictEqual(d.write(b([0xe7, 0x84])), '')
            assert.strict.deepStrictEqual(d.write(b([0xa1])), '無')
            assert.strict.deepStrictEqual(d.end(), '')
            assert.strict.deepStrictEqual(d.switched, false)
            assert.strict.deepStrictEqual(d.label, 'utf-8')
        })

        it(`should decode a big5 character split across chunks`, function() {
            let d = codec.createDecoder('big5')
            assert.strict.deepStrictEqual(d.write(b([0xb5])), '')
            assert.strict.deepStrictEqual(d.write(b([0x4c])), '無')
            assert.strict.deepStrictEqual(d.end(), '')
        })

        it(`should flush a dangling lead byte as U+FFFD`, function() {
            let d = codec.createDecoder('big5')
            assert.strict.deepStrictEqual(d.write(b([0xb5])), '')
            assert.strict.deepStrictEqual(d.end(), '�')
        })

        it(`should strip a leading utf-8 BOM`, function() {
            let d = codec.createDecoder('utf-8')
            assert.strict.deepStrictEqual(d.write(b([0xef, 0xbb, 0xbf, 0x41])), 'A')
        })

        it(`should report the canonical label`, function() {
            assert.strict.deepStrictEqual(codec.createDecoder('latin1').label, 'windows-1252')
            assert.strict.deepStrictEqual(codec.createDecoder('utf8').label, 'utf-8')
        })

    })

    describe(`createDecoder with auto`, function() {

        it(`should decode valid utf-8 exactly without switching`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0xe7, 0x84])), '')
            assert.strict.deepStrictEqual(d.write(b([0xa1, 0x41])), '無A')
            assert.strict.deepStrictEqual(d.end(), '')
            assert.strict.deepStrictEqual(d.switched, false)
            assert.strict.deepStrictEqual(d.label, 'utf-8')
        })

        it(`should keep ASCII as is`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0x6f, 0x6b])), 'ok')
            assert.strict.deepStrictEqual(d.end(), '')
            assert.strict.deepStrictEqual(d.switched, false)
        })

        it(`should switch to the system label on the first non-utf-8 chunk`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0xb8, 0xea, 0xb0, 0x54])), '資訊')
            assert.strict.deepStrictEqual(d.switched, true)
            assert.strict.deepStrictEqual(d.label, 'big5')
            assert.strict.deepStrictEqual(d.end(), '')
        })

        it(`should switch mid-stream after ASCII chunks`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0x6f, 0x6b])), 'ok')
            assert.strict.deepStrictEqual(d.switched, false)
            assert.strict.deepStrictEqual(d.write(b([0xb5, 0x4c])), '無')
            assert.strict.deepStrictEqual(d.switched, true)
        })

        it(`should not lose bytes carried from the previous chunk when switching`, function() {
            //0xb5同時是utf-8之lead範圍與big5之lead, 第1個chunk會被暫存, 第2個chunk判定非utf-8時須連同暫存一起改判
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0xb5])), '')
            assert.strict.deepStrictEqual(d.write(b([0x4c])), '無')
            assert.strict.deepStrictEqual(d.switched, true)
            assert.strict.deepStrictEqual(d.end(), '')
        })

        it(`should keep decoding across chunks after switching`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0xb8, 0xea, 0xb0, 0x54])), '資訊')
            assert.strict.deepStrictEqual(d.write(b([0xb5])), '')
            assert.strict.deepStrictEqual(d.write(b([0x4c])), '無')
            assert.strict.deepStrictEqual(d.end(), '')
        })

        it(`should treat a truncated utf-8 tail as U+FFFD instead of switching`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([0xe7, 0x84, 0xa1, 0xe7, 0x84])), '無')
            assert.strict.deepStrictEqual(d.end(), '�')
            assert.strict.deepStrictEqual(d.switched, false)
            assert.strict.deepStrictEqual(d.label, 'utf-8')
        })

        it(`should default the system label to utf-8`, function() {
            let d = codec.createDecoder('auto')
            assert.strict.deepStrictEqual(d.write(b([0xff, 0x41])), '�A')
            assert.strict.deepStrictEqual(d.switched, true)
            assert.strict.deepStrictEqual(d.label, 'utf-8')
        })

        it(`should return an empty string for an empty chunk`, function() {
            let d = codec.createDecoder('auto', { labelSystem: 'big5' })
            assert.strict.deepStrictEqual(d.write(b([])), '')
            assert.strict.deepStrictEqual(d.end(), '')
        })

    })

    describe(`getSystemCodePage`, function() {

        it(`should resolve a decoder label and cache the promise`, async function() {
            let p1 = codec.getSystemCodePage()
            let p2 = codec.getSystemCodePage()
            assert.strict.deepStrictEqual(p1 === p2, true)
            let label = await p1
            assert.strict.deepStrictEqual(typeof label === 'string' && label.length > 0, true)
            assert.doesNotThrow(() => {
                new TextDecoder(label) //eslint-disable-line no-new
            })
        })

        it(`should resolve big5 on win32 when the console code page is 950`, async function() {
            if (consoleCodePage() !== 950) {
                this.skip()
            }
            assert.strict.deepStrictEqual(await codec.getSystemCodePage(), 'big5')
        })

        it(`should resolve utf-8 on non-win32 platforms`, async function() {
            if (process.platform === 'win32') {
                this.skip()
            }
            assert.strict.deepStrictEqual(await codec.getSystemCodePage(), 'utf-8')
        })

    })

})
