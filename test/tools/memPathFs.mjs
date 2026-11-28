//記憶體fs: 以注入之path實作(path.posix或path.win32)解析路徑, 供fsSync系之落點與連結測試; 只在記憶體內操作, 不碰實體檔案系統
//  可依指定平台之路徑語意驗證寫入與刪除之落點(與執行測試之平台無關); 記錄每一次寫入與刪除之絕對路徑(ops, 經連結者記解析後之實際位置)
//  支援符號連結: lstat不跟進最後一段, stat與讀寫跟進, 中間各段之連結一律跟進; 刪除最後一段為連結者只移除連結本身
import { Readable, Writable } from 'stream'


/**
 * 建立記憶體fs
 *
 * @param {Object} p 輸入path實作(path.posix或path.win32)
 * @param {Object} [init={}] 輸入初始內容
 * @param {Object} [init.files={}] 輸入初始檔案, 鍵為絕對路徑, 值為內容字串
 * @param {Array} [init.dirs=[]] 輸入初始資料夾絕對路徑
 * @param {Object} [init.links={}] 輸入初始符號連結, 鍵為連結絕對路徑, 值為指向之路徑(相對者以連結所在資料夾解析)
 * @param {Object} [init.listExtra={}] 輸入列舉時額外回傳之名稱, 鍵為資料夾絕對路徑, 值為名稱陣列; 只於該資料夾第一次列舉時回傳(模擬自訂fs回傳不合平台檔名規則之名稱, 如解析回自身時不致無窮遞迴)
 * @returns {Object} 回傳{ fs, ops, snapshot, outsideOf, has, read, isLink, setLink }
 */
function makeMemFs(p, init = {}) {
    let files = new Map()
    let dirs = new Set()
    let links = new Map()
    let ops = []
    let listExtra = new Map(Object.entries(init.listExtra || {}).map(([fd, ns]) => [p.resolve(fd), ns]))
    let key = (fp) => p.resolve(fp)
    let addDir = (fd) => {
        let k = key(fd)
        while (!dirs.has(k)) {
            dirs.add(k)
            let up = p.dirname(k)
            if (up === k) {
                break
            }
            k = up
        }
    }
    let addFile = (fp, c) => {
        let k = key(fp)
        addDir(p.dirname(k))
        files.set(k, Buffer.from(c))
    }
    let addLink = (fp, to) => {
        let k = key(fp)
        addDir(p.dirname(k))
        links.set(k, to)
    }
    for (let fd of init.dirs || []) {
        addDir(fd)
    }
    for (let [fp, c] of Object.entries(init.files || {})) {
        addFile(fp, c)
    }
    for (let [fp, to] of Object.entries(init.links || {})) {
        addLink(fp, to)
    }

    let err = (code) => Object.assign(new Error(code), { code })

    //real, 解析路徑中之連結後之實際位置; followLast為false時最後一段為連結者不跟進; 超過40層回ELOOP
    let real = (fp, followLast = true, depth = 0) => {
        let k = key(fp)
        let root = p.parse(k).root
        let segs = k.slice(root.length).split(p.sep).filter(Boolean)
        let cur = root
        for (let i = 0; i < segs.length; i++) {
            let cand = p.join(cur, segs[i])
            if (links.has(cand) && (followLast || i < segs.length - 1)) {
                if (depth > 40) {
                    throw err('ELOOP')
                }
                cand = real(p.resolve(cur, links.get(cand)), true, depth + 1)
            }
            cur = cand
        }
        return cur
    }

    //missing, 不存在時之錯誤碼: posix語意下上層為檔案者回ENOTDIR, 其餘(含Windows語意)回ENOENT
    let missing = (k) => {
        let up = p.dirname(k)
        while (p.dirname(up) !== up) {
            if (files.has(up)) {
                return err(p.sep === '/' ? 'ENOTDIR' : 'ENOENT')
            }
            up = p.dirname(up)
        }
        return err('ENOENT')
    }

    let statOf = (k, followed) => {
        let isLink = !followed && links.has(k)
        let isDir = !isLink && dirs.has(k)
        if (!isLink && !isDir && !files.has(k)) {
            throw missing(k)
        }
        return {
            isDirectory: () => isDir,
            isFile: () => !isDir && !isLink,
            isSymbolicLink: () => isLink,
            size: (isDir || isLink) ? 0 : files.get(k).length,
            mtime: new Date(0),
            mtimeMs: 0,
        }
    }

    //under, k是否為fd之下層(不含fd本身)
    let under = (k, fd) => k !== fd && k.startsWith(fd.endsWith(p.sep) ? fd : fd + p.sep)

    //removeTree, 移除k及其下全部項目(不跟進其下之連結)
    let removeTree = (k) => {
        for (let f of [...files.keys()]) {
            if (f === k || under(f, k)) {
                files.delete(f)
            }
        }
        for (let d of [...dirs]) {
            if (d === k || under(d, k)) {
                dirs.delete(d)
            }
        }
        for (let l of [...links.keys()]) {
            if (l === k || under(l, k)) {
                links.delete(l)
            }
        }
    }

    //lstat, posix語意下路徑以分隔字元結尾者跟進最後一段之連結(同POSIX路徑解析)
    let lstat = (fp) => {
        let follow = p.sep === '/' && fp.length > 1 && fp.endsWith('/')
        return statOf(real(fp, follow), follow)
    }

    let fs = {
        statSync: (fp) => statOf(real(fp, true), true),
        lstatSync: lstat,
        readdirSync: (fd) => {
            let r = real(fd)
            if (!dirs.has(r)) {
                throw err('ENOTDIR')
            }
            let ns = [...files.keys(), ...dirs, ...links.keys()].filter((k) => k !== r && p.dirname(k) === r).map((k) => p.basename(k)).sort() //實體檔案系統(libuv)之列舉依名稱排序
            if (listExtra.has(r)) {
                ns = ns.concat(listExtra.get(r))
                listExtra.delete(r)
            }
            return ns
        },
        mkdirSync: (fd) => {
            let k = real(fd)
            if (files.has(k)) {
                throw err('EEXIST')
            }
            if (!dirs.has(k)) {
                ops.push(`mkdir ${k}`)
                addDir(k)
            }
        },
        createReadStream: (fp) => {
            let buf = files.get(real(fp))
            if (buf === undefined) {
                let s = new Readable({ read() {} })
                process.nextTick(() => s.destroy(err('ENOENT')))
                return s
            }
            return Readable.from([Buffer.from(buf)]) //資料與結束分兩次送出(fsGetFileBasicHashCore於第2次readable取得null後結算)
        },
        createWriteStream: (fp) => {
            let k = real(fp)
            ops.push(`write ${k}`)
            let chunks = []
            let s = new Writable({
                write(c, enc, cb) {
                    chunks.push(Buffer.from(c))
                    cb()
                },
                final(cb) {
                    files.set(k, Buffer.concat(chunks))
                    cb()
                },
            })
            if (!dirs.has(p.dirname(k))) {
                process.nextTick(() => s.destroy(err('ENOENT')))
            }
            return s
        },
        unlinkSync: (fp) => {
            let k = real(fp, false)
            ops.push(`unlink ${k}`)
            if (!files.delete(k) && !links.delete(k)) {
                throw err('ENOENT')
            }
        },
        rmSync: (fp) => {
            let k = real(fp, false)
            ops.push(`rm ${k}`)
            if (links.delete(k)) {
                return
            }
            removeTree(k)
        },
        readlinkSync: (fp) => {
            let k = real(fp, false)
            if (!links.has(k)) {
                throw err('EINVAL')
            }
            return links.get(k)
        },
        symlinkSync: (to, fp) => {
            let k = real(fp, false)
            if (links.has(k) || files.has(k) || dirs.has(k)) {
                throw err('EEXIST')
            }
            if (!dirs.has(p.dirname(k))) {
                throw err('ENOENT')
            }
            ops.push(`symlink ${k}`)
            links.set(k, to)
        },
    }

    //snapshot, 全部內容(資料夾'd <路徑>'、檔案'f <路徑>=<內容>'、連結'l <路徑>=<指向>'), 排序後比對
    let snapshot = () => {
        let rs = [...dirs].map((d) => `d ${d}`)
        for (let [f, c] of files) {
            rs.push(`f ${f}=${c.toString()}`)
        }
        for (let [l, to] of links) {
            rs.push(`l ${l}=${to}`)
        }
        return rs.sort()
    }

    //outsideOf, 指定資料夾(含其本身)以外之內容
    let outsideOf = (fd) => {
        let r = key(fd)
        return snapshot().filter((s) => {
            let k = s.slice(2).split('=')[0]
            return k !== r && !under(k, r)
        })
    }

    return {
        fs,
        ops,
        snapshot,
        outsideOf,
        has: (fp) => files.has(key(fp)) || dirs.has(key(fp)) || links.has(key(fp)),
        read: (fp) => (files.has(key(fp)) ? files.get(key(fp)).toString() : null),
        isLink: (fp) => links.has(key(fp)),
        setLink: (fp, to) => { //將fp(含其下)換成指向to之連結, 模擬列舉後被置換
            removeTree(key(fp))
            addLink(fp, to)
        },
    }
}


export default makeMemFs
