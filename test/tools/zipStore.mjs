import zlib from 'zlib'


//zipStore, 產生不壓縮(stored)之zip內容, 供測試以tar解出; 不依賴第三方套件
//entries為[{ name, data: Buffer, symlink: Boolean }], symlink為true者data為連結目標(以unix模式標為符號連結)
function zipStore(entries) {
    let locals = []
    let centrals = []
    let offset = 0
    for (let e of entries) {
        let name = Buffer.from(e.name, 'utf8')
        let data = Buffer.from(e.data)
        let crc = zlib.crc32(data)
        let lh = Buffer.alloc(30)
        lh.writeUInt32LE(0x04034b50, 0)
        lh.writeUInt16LE(20, 4) //version needed
        lh.writeUInt16LE(0x0800, 6) //flags: utf-8 name
        lh.writeUInt16LE(0, 8) //method: stored
        lh.writeUInt16LE(0, 10) //time
        lh.writeUInt16LE(0x21, 12) //date: 1980-01-01
        lh.writeUInt32LE(crc, 14)
        lh.writeUInt32LE(data.length, 18)
        lh.writeUInt32LE(data.length, 22)
        lh.writeUInt16LE(name.length, 26)
        lh.writeUInt16LE(0, 28)
        let ch = Buffer.alloc(46)
        ch.writeUInt32LE(0x02014b50, 0)
        ch.writeUInt16LE(e.symlink ? (3 << 8) | 20 : 20, 4) //version made by: unix(3)者external attr之高16位元為mode
        ch.writeUInt16LE(20, 6)
        ch.writeUInt16LE(0x0800, 8)
        ch.writeUInt16LE(0, 10)
        ch.writeUInt16LE(0, 12)
        ch.writeUInt16LE(0x21, 14)
        ch.writeUInt32LE(crc, 16)
        ch.writeUInt32LE(data.length, 20)
        ch.writeUInt32LE(data.length, 24)
        ch.writeUInt16LE(name.length, 28)
        ch.writeUInt16LE(0, 30)
        ch.writeUInt16LE(0, 32)
        ch.writeUInt16LE(0, 34)
        ch.writeUInt16LE(0, 36)
        ch.writeUInt32LE(e.symlink ? ((0o120777 << 16) >>> 0) : 0, 38)
        ch.writeUInt32LE(offset, 42)
        locals.push(lh, name, data)
        centrals.push(ch, name)
        offset += lh.length + name.length + data.length
    }
    let cd = Buffer.concat(centrals)
    let end = Buffer.alloc(22)
    end.writeUInt32LE(0x06054b50, 0)
    end.writeUInt16LE(0, 4)
    end.writeUInt16LE(0, 6)
    end.writeUInt16LE(entries.length, 8)
    end.writeUInt16LE(entries.length, 10)
    end.writeUInt32LE(cd.length, 12)
    end.writeUInt32LE(offset, 16)
    end.writeUInt16LE(0, 20)
    return Buffer.concat([...locals, cd, end])
}


export default zipStore
