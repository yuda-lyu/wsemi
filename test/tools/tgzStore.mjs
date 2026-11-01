import zlib from 'zlib'


//tarStore, 產生ustar格式之tar內容(未壓縮), 供測試以tar解出; 不依賴第三方套件
//entries為[{ name, data: Buffer, kind: 'file'|'dir'|'symlink'|'hardlink' }], 預設為file; symlink與hardlink者data為連結目標
function tarStore(entries) {
    let octal = (v, len) => {
        return Buffer.from(v.toString(8).padStart(len - 1, '0') + '\0', 'latin1')
    }
    let blocks = []
    for (let e of entries) {
        let kind = e.kind || 'file'
        let name = Buffer.from(e.name, 'utf8')
        if (name.length > 100) {
            throw new Error(`tarStore: name too long (max 100 bytes): ${e.name}`)
        }
        let data = kind === 'file' ? Buffer.from(e.data) : Buffer.alloc(0)
        let link = kind === 'symlink' || kind === 'hardlink' ? Buffer.from(e.data) : Buffer.alloc(0)
        let h = Buffer.alloc(512)
        name.copy(h, 0)
        octal(kind === 'dir' ? 0o755 : 0o644, 8).copy(h, 100) //mode
        octal(0, 8).copy(h, 108) //uid
        octal(0, 8).copy(h, 116) //gid
        octal(data.length, 12).copy(h, 124) //size
        octal(0, 12).copy(h, 136) //mtime
        h.fill(0x20, 148, 156) //chksum計算時為空白
        h.write({ file: '0', dir: '5', symlink: '2', hardlink: '1' }[kind], 156, 'latin1') //typeflag
        link.copy(h, 157)
        h.write('ustar\0', 257, 'latin1')
        h.write('00', 263, 'latin1')
        let sum = 0
        for (let i = 0; i < 512; i++) {
            sum += h[i]
        }
        h.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 'latin1')
        blocks.push(h)
        if (data.length > 0) {
            blocks.push(data)
            let pad = (512 - (data.length % 512)) % 512
            if (pad > 0) {
                blocks.push(Buffer.alloc(pad))
            }
        }
    }
    blocks.push(Buffer.alloc(1024)) //結尾兩個全零區塊
    return Buffer.concat(blocks)
}


//tgzStore, 產生tar＋gzip(.tar.gz)內容; entries同tarStore
function tgzStore(entries) {
    return zlib.gzipSync(tarStore(entries))
}


export { tarStore }
export default tgzStore
