//實體檔案系統之連結沙盒(Windows建立junction, 其他平台建立符號連結), 供fsSync系之連結測試; 只用於test/_tmp之下
//  快照與清除一律以lstat走訪、不跟進連結; 清除時先逐一移除連結本身並回驗其指向仍在, 確認沙盒內無連結後才遞迴刪除
import fs from 'fs'
import path from 'path'


//makeLink, 建立指向資料夾to之目錄連結fp(Windows之junction不需權限; 其他平台忽略型別而建符號連結)
function makeLink(to, fp) {
    fs.symlinkSync(path.resolve(to), fp, 'junction')
}


//walk, 不跟進連結地走訪root之下全部項目, 依名稱排序, 對每項呼叫fn(路徑, lstat結果)
function walk(root, fn) {
    for (let n of fs.readdirSync(root).sort()) {
        let fp = path.join(root, n)
        let s = fs.lstatSync(fp)
        fn(fp, s)
        if (!s.isSymbolicLink() && s.isDirectory()) {
            walk(fp, fn)
        }
    }
}


//snapshot, root之下全部項目: 'd <相對路徑>'、'f <相對路徑>=<內容>'、'l <相對路徑>'
function snapshot(root) {
    let rs = []
    walk(root, (fp, s) => {
        let rel = path.relative(root, fp).replaceAll(path.sep, '/')
        if (s.isSymbolicLink()) {
            rs.push(`l ${rel}`)
        }
        else if (s.isDirectory()) {
            rs.push(`d ${rel}`)
        }
        else {
            rs.push(`f ${rel}=${fs.readFileSync(fp, 'utf8')}`)
        }
    })
    return rs
}


//listLinks, root之下全部連結之路徑
function listLinks(root) {
    let links = []
    walk(root, (fp, s) => {
        if (s.isSymbolicLink()) {
            links.push(fp)
        }
    })
    return links
}


//removeSandbox, 清除沙盒root; 不存在時不做事; 移除連結本身後其指向若原存在而消失即拋錯
function removeSandbox(root) {
    if (!fs.existsSync(root)) {
        return
    }
    for (let fp of listLinks(root)) {
        let to = path.resolve(path.dirname(fp), fs.readlinkSync(fp))
        let existed = fs.existsSync(to)
        try {
            fs.unlinkSync(fp)
        }
        catch (err) {
            fs.rmdirSync(fp)
        }
        if (existed && !fs.existsSync(to)) {
            throw new Error(`link target lost: ${to}`)
        }
    }
    if (listLinks(root).length > 0) {
        throw new Error(`links remain under sandbox`)
    }
    fs.rmSync(root, { recursive: true, force: true })
}


export { makeLink, snapshot, listLinks, removeSandbox }
