//測試用xlsx產生器: 以OOXML原文組出仿Excel存檔之xlsx, 不經任何xlsx套件寫出, 供讀取測試使用(避免以同一套件自寫自讀)
//同Excel存檔: 內建格式只給numFmtId、自訂格式由164起、文字走sharedStrings、數值原文照給(可給Excel寫出之17位有效數字字串)
//rows為二維陣列, 各元素為儲存格規格, null為無cell:
//  { s: '文字' }                共用字串
//  { inline: '文字' }           inlineStr
//  { rich: ['a', 'b'] }        rich text(第二段粗體)
//  { n: 數值或數值字串, fmt }     數值, fmt為內建numFmtId(數字)或自訂格式碼(字串), 不給為通用格式
//  { b: true }                 布林
//  { e: '#N/A' }               錯誤
//  { f: '公式', n|str|b|e }      公式與快取值(str為字串結果t="str", 皆不給為無快取值)
//  { d: 'ISO字串', fmt }        日期型儲存格t="d"
//  { fmt }                     有格式之空格
//opt.date1904為true時為1904日期系統


//crc32, zip所需之校驗碼
let crcTable = []
for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    crcTable.push(c >>> 0)
}
function crc32(u8) {
    let c = 0xFFFFFFFF
    for (let i = 0; i < u8.length; i++) {
        c = crcTable[(c ^ u8[i]) & 0xFF] ^ (c >>> 8)
    }
    return (c ^ 0xFFFFFFFF) >>> 0
}


//zipStore, 以不壓縮(stored)方式組zip
function zipStore(files) {
    let enc = new TextEncoder()
    let locals = []
    let centrals = []
    let offset = 0
    for (let [name, text] of files) {
        let nm = enc.encode(name)
        let data = enc.encode(text)
        let crc = crc32(data)
        let lh = new DataView(new ArrayBuffer(30))
        lh.setUint32(0, 0x04034b50, true)
        lh.setUint16(4, 20, true)
        lh.setUint16(6, 0x0800, true) //檔名為UTF-8
        lh.setUint16(8, 0, true) //stored
        lh.setUint16(12, 0x21, true) //1980-01-01
        lh.setUint32(14, crc, true)
        lh.setUint32(18, data.length, true)
        lh.setUint32(22, data.length, true)
        lh.setUint16(26, nm.length, true)
        locals.push(new Uint8Array(lh.buffer), nm, data)
        let ch = new DataView(new ArrayBuffer(46))
        ch.setUint32(0, 0x02014b50, true)
        ch.setUint16(4, 20, true)
        ch.setUint16(6, 20, true)
        ch.setUint16(8, 0x0800, true)
        ch.setUint16(14, 0x21, true)
        ch.setUint32(16, crc, true)
        ch.setUint32(20, data.length, true)
        ch.setUint32(24, data.length, true)
        ch.setUint16(28, nm.length, true)
        ch.setUint32(42, offset, true)
        centrals.push(new Uint8Array(ch.buffer), nm)
        offset += 30 + nm.length + data.length
    }
    let sizeCentral = centrals.reduce((s, u) => s + u.length, 0)
    let eh = new DataView(new ArrayBuffer(22))
    eh.setUint32(0, 0x06054b50, true)
    eh.setUint16(8, files.length, true)
    eh.setUint16(10, files.length, true)
    eh.setUint32(12, sizeCentral, true)
    eh.setUint32(16, offset, true)
    let parts = [...locals, ...centrals, new Uint8Array(eh.buffer)]
    let u8 = new Uint8Array(parts.reduce((s, u) => s + u.length, 0))
    let p = 0
    for (let u of parts) {
        u8.set(u, p)
        p += u.length
    }
    return u8
}


function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}


function colName(c) {
    let s = ''
    c += 1
    while (c > 0) {
        let m = (c - 1) % 26
        s = String.fromCharCode(65 + m) + s
        c = Math.floor((c - 1) / 26)
    }
    return s
}


function buildXlsx(rows, opt = {}) {
    let date1904 = opt.date1904 === true

    //sst, 共用字串(以xml去重)
    let sst = []
    let sstIndex = (xml) => {
        let i = sst.indexOf(xml)
        if (i < 0) {
            sst.push(xml)
            i = sst.length - 1
        }
        return i
    }

    //xfs, 儲存格樣式之numFmtId清單, 自訂格式由164起
    let xfs = [0]
    let customs = []
    let xfOf = (fmt) => {
        let id = fmt
        if (typeof fmt === 'string') {
            let k = customs.findIndex((c) => c[1] === fmt)
            if (k < 0) {
                customs.push([164 + customs.length, fmt])
                k = customs.length - 1
            }
            id = customs[k][0]
        }
        let i = xfs.indexOf(id)
        if (i < 0) {
            xfs.push(id)
            i = xfs.length - 1
        }
        return i
    }

    //cellXml
    let cellXml = (cell, ref) => {
        let s = cell.fmt !== undefined ? ` s="${xfOf(cell.fmt)}"` : ''
        if (cell.s !== undefined) {
            return `<c r="${ref}" t="s"${s}><v>${sstIndex(`<si><t xml:space="preserve">${esc(cell.s)}</t></si>`)}</v></c>`
        }
        if (cell.inline !== undefined) {
            return `<c r="${ref}" t="inlineStr"${s}><is><t>${esc(cell.inline)}</t></is></c>`
        }
        if (cell.rich !== undefined) {
            return `<c r="${ref}" t="s"${s}><v>${sstIndex(`<si><r><t>${esc(cell.rich[0])}</t></r><r><rPr><b/></rPr><t>${esc(cell.rich[1])}</t></r></si>`)}</v></c>`
        }
        if (cell.d !== undefined) {
            return `<c r="${ref}" t="d"${s}><v>${esc(cell.d)}</v></c>`
        }
        let f = cell.f !== undefined ? `<f>${esc(cell.f)}</f>` : ''
        if (cell.b !== undefined) {
            return `<c r="${ref}" t="b"${s}>${f}<v>${cell.b ? 1 : 0}</v></c>`
        }
        if (cell.e !== undefined) {
            return `<c r="${ref}" t="e"${s}>${f}<v>${esc(cell.e)}</v></c>`
        }
        if (cell.str !== undefined) {
            return `<c r="${ref}" t="str"${s}>${f}<v>${esc(cell.str)}</v></c>`
        }
        if (cell.n !== undefined) {
            return `<c r="${ref}"${s}>${f}<v>${cell.n}</v></c>`
        }
        if (f) {
            return `<c r="${ref}"${s}>${f}</c>`
        }
        return `<c r="${ref}"${s}/>`
    }

    //sheetData
    let nc = 0
    let rowsXml = rows.map((row, r) => {
        nc = Math.max(nc, row.length)
        let cs = row.map((cell, c) => (cell ? cellXml(cell, `${colName(c)}${r + 1}`) : '')).join('')
        return `<row r="${r + 1}">${cs}</row>`
    }).join('')

    let ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    let nsr = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    let nsp = 'http://schemas.openxmlformats.org/package/2006/relationships'
    let head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    let sheet = `${head}<worksheet xmlns="${ns}" xmlns:r="${nsr}"><dimension ref="A1:${colName(Math.max(nc - 1, 0))}${Math.max(rows.length, 1)}"/><sheetData>${rowsXml}</sheetData></worksheet>`
    let sstXml = `${head}<sst xmlns="${ns}" count="${sst.length}" uniqueCount="${sst.length}">${sst.join('')}</sst>`
    let styles = `${head}<styleSheet xmlns="${ns}">${customs.length > 0 ? `<numFmts count="${customs.length}">${customs.map(([id, code]) => `<numFmt numFmtId="${id}" formatCode="${esc(code)}"/>`).join('')}</numFmts>` : ''}<fonts count="1"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.map((id) => `<xf numFmtId="${id}" fontId="0" fillId="0" borderId="0" xfId="0"${id ? ' applyNumberFormat="1"' : ''}/>`).join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
    let workbook = `${head}<workbook xmlns="${ns}" xmlns:r="${nsr}"><workbookPr${date1904 ? ' date1904="1"' : ''}/><sheets><sheet name="data" sheetId="1" r:id="rId1"/></sheets></workbook>`
    let ct = `${head}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`
    let rels = `${head}<Relationships xmlns="${nsp}"><Relationship Id="rId1" Type="${nsr}/officeDocument" Target="xl/workbook.xml"/></Relationships>`
    let wbRels = `${head}<Relationships xmlns="${nsp}"><Relationship Id="rId1" Type="${nsr}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${nsr}/styles" Target="styles.xml"/><Relationship Id="rId3" Type="${nsr}/sharedStrings" Target="sharedStrings.xml"/></Relationships>`

    return zipStore([
        ['[Content_Types].xml', ct],
        ['_rels/.rels', rels],
        ['xl/workbook.xml', workbook],
        ['xl/_rels/workbook.xml.rels', wbRels],
        ['xl/styles.xml', styles],
        ['xl/sharedStrings.xml', sstXml],
        ['xl/worksheets/sheet1.xml', sheet],
    ])
}


export default buildXlsx
