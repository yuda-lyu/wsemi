//fsPathSites.mjs: src/fs*.mjs 路徑參數之站點全集(R-FS-INVALID-PATH-01), 由test/fsInvalidPath.test.mjs與子行程執行器fsInvalidPathRunner.mjs共用(單一出處)
//  站點 = 函數 × 路徑參數位置; kind為該函數之失敗通道, 無效路徑(非字串、空字串、含NUL字元)依通道回報, 不得被當成「不存在」而回成功, 訊息不帶輸入值:
//    bool: 判斷類, 回傳false(不拋錯)
//    env : 同步結果物件, 回傳{ error: 'invalid <名稱>: must be a non-empty string' }(NUL者為'invalid <名稱>: must not contain a NUL character')
//    rej : 回傳Promise, reject同上之說明字串
//    thr : 同步拋出Error, message同上(回傳陣列者與建構/監看類)
//    own : 既有專屬訊息(fsDownloadFile、fsDownloadFileVerify、fsGetBinManifestEntry), 以own.re比對, 僅補NUL
//  args(v, i): 傳入第i個路徑參數為v時之引數陣列(不含opt); Core之引數預設為args後接{ fs }, coreArgs可覆寫
//  ctl: 對照用「有效但不存在」之路徑('nope.txt'檔案或'nopedir'資料夾), 其結果(若為失敗)之訊息不得以'invalid '起頭; null者不對照(下載類之有效路徑會連線)
//  call(mod, args): 預設mod(...args), 特殊者覆寫(如fsBuildWriteStreamText().create)

//bads, 無效路徑值: 名稱與值(執行器與測試共用名稱, 值只在子行程使用)
let bads = [
    ['null', null],
    ['undefined', undefined],
    ['emptyStr', ''],
    ['zero', 0], //數字0於fs被當檔案描述子(fs.readFileSync(0)讀stdin)
    ['num123', 123],
    ['true', true],
    ['obj', {}],
    ['arr', []],
    ['fn', () => 'f'],
    ['nul', 'a\0b'], //含NUL字元之字串: Node拋ERR_INVALID_ARG_VALUE且訊息回顯輸入值
    ['symbol', Symbol('s')],
]

let F = 'a.txt' //夾具: 檔案(內容abc)
let J = 'j.json' //夾具: 檔案
let D = 'd' //夾具: 資料夾(含x.txt與sub/y.txt)
let T = 'tgt' //夾具: 空資料夾
let URL = 'http://127.0.0.1:9/x' //不通之本機埠, 無效路徑須先於連線被拒

let sites = []
let add = (o) => {
    sites.push({ core: true, ...o })
}

//判斷類
add({ fn: 'fsIsFile', kind: 'bool', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsIsFolder', kind: 'bool', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsExists', kind: 'bool', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nope.txt' })

//同步結果物件
add({ fn: 'fsReadText', kind: 'env', params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsReadJson', kind: 'env', core: false, params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.json' })
add({ fn: 'fsWriteText', kind: 'env', params: [{ i: 0, name: 'fp' }], args: (v) => [v, 'c'], ctl: 'nope.txt' })
add({ fn: 'fsWriteJson', kind: 'env', core: false, params: [{ i: 0, name: 'fp' }], args: (v) => [v, { a: 1 }], ctl: 'nope.json' })
add({ fn: 'fsWriteTextAtomic', kind: 'env', params: [{ i: 0, name: 'fp' }], args: (v) => [v, 'c'], ctl: 'nope.txt' })
add({ fn: 'fsCreateFile', kind: 'env', params: [{ i: 0, name: 'pah' }], args: (v) => [v, 'c'], ctl: 'nope.txt' })
add({ fn: 'fsCreateFolder', kind: 'env', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsDeleteFile', kind: 'env', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsDeleteFolder', kind: 'env', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsCleanFolder', kind: 'env', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsCopyFile', kind: 'env', params: [{ i: 0, name: 'fpSrc' }, { i: 1, name: 'fpTar' }], args: (v, i) => (i === 0 ? [v, 'b.txt'] : [F, v]), ctl: 'nope.txt' })
add({ fn: 'fsCopyFolder', kind: 'env', params: [{ i: 0, name: 'fpSrc' }, { i: 1, name: 'fpTar' }], args: (v, i) => (i === 0 ? [v, 'd2'] : [D, v]), ctl: 'nopedir' })
add({ fn: 'fsRenameFile', kind: 'env', params: [{ i: 0, name: 'pahOld' }, { i: 1, name: 'pahNew' }], args: (v, i) => (i === 0 ? [v, 'n.txt'] : [F, v]), ctl: 'nope.txt' })
add({ fn: 'fsRenameFolder', kind: 'env', params: [{ i: 0, name: 'pahOld' }, { i: 1, name: 'pahNew' }], args: (v, i) => (i === 0 ? [v, 'dn'] : [D, v]), ctl: 'nopedir' })

//Promise
add({ fn: 'fsDeleteFileSafe', kind: 'rej', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsDeleteFolderSafe', kind: 'rej', params: [{ i: 0, name: 'pah' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsSyncFolder', kind: 'rej', params: [{ i: 0, name: 'fdSrc' }, { i: 1, name: 'fdTar' }], args: (v, i) => (i === 0 ? [v, T] : [D, v]), ctl: 'nopedir' })
add({ fn: 'fsMergeFiles', kind: 'rej', params: [{ i: 1, name: 'fpOut' }], args: (v) => [[F, J], v], ctl: 'out.txt' })
add({ fn: 'fsMergeFiles', kind: 'rej', tag: 'fpsIn[0]', params: [{ i: 0, name: 'fpsIn[0]' }], args: (v) => [[v, J], 'out.txt'], ctl: F })
add({ fn: 'fsMergeFiles', kind: 'rej', tag: 'fpsIn[1]', params: [{ i: 0, name: 'fpsIn[1]' }], args: (v) => [[F, v], 'out.txt'], ctl: J })
add({ fn: 'fsGetFilesWithHashInFolder', kind: 'rej', params: [{ i: 0, name: 'fd' }], args: (v) => [v], coreArgs: (v) => [v, 1, { fs: null }], ctl: 'nopedir' })
add({ fn: 'fsTreeFolderWithHash', kind: 'rej', params: [{ i: 0, name: 'fd' }], args: (v) => [v], coreArgs: (v) => [v, 1, { fs: null }], ctl: 'nopedir' })
add({ fn: 'fsGetFileBasicHash', kind: 'rej', params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsGetFolderBasicHash', kind: 'rej', params: [{ i: 0, name: 'fd' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsGetFileHash', kind: 'rej', params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsGetFileXxHash', kind: 'rej', params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsBuildWriteStreamText', kind: 'rej', core: false, tag: 'create', params: [{ i: 0, name: 'fp' }], args: (v) => [v], call: (mod, args) => mod().create(...args), ctl: 'nopedir/w.txt' })

//同步拋出
add({ fn: 'fsGetFilesInFolder', kind: 'thr', params: [{ i: 0, name: 'fd' }], args: (v) => [v], coreArgs: (v) => [v, 1], ctl: 'nopedir' })
add({ fn: 'fsGetFoldersInFolder', kind: 'thr', params: [{ i: 0, name: 'fd' }], args: (v) => [v], coreArgs: (v) => [v, 1], ctl: 'nopedir' })
add({ fn: 'fsTreeFolder', kind: 'thr', params: [{ i: 0, name: 'fd' }], args: (v) => [v], coreArgs: (v) => [v, 1], ctl: 'nopedir' })
add({ fn: 'fsBuildReadStreamText', kind: 'thr', core: false, params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsWatchFolder', kind: 'thr', core: false, params: [{ i: 0, name: 'fd' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsWatchFile', kind: 'thr', core: false, params: [{ i: 0, name: 'fp' }], args: (v) => [v], ctl: 'nope.txt' })
add({ fn: 'fsTask', kind: 'thr', core: false, params: [{ i: 0, name: 'fd' }], args: (v) => [v], ctl: 'nopedir' })
add({ fn: 'fsTaskCp', kind: 'thr', core: false, params: [{ i: 0, name: 'fdSrc' }, { i: 1, name: 'fdTar' }], args: (v, i) => (i === 0 ? [v, T] : [D, v]), ctl: 'nopedir' })

//既有專屬訊息(僅補NUL)
add({ fn: 'fsDownloadFile', kind: 'own', params: [{ i: 1, name: 'fpOut' }], args: (v) => [URL, v], coreArgs: (v) => [URL, v], own: { re: /^fpOut is not an effective string$/ }, ctl: null })
add({ fn: 'fsDownloadFileVerify', kind: 'own', params: [{ i: 1, name: 'fpOut' }], args: (v) => [URL, v, { sha256: 'a'.repeat(64) }], coreArgs: (v) => [URL, v, { sha256: 'a'.repeat(64) }], own: { re: /^fpOut is not an effective file path$/ }, ctl: null })
add({ fn: 'fsGetBinManifestEntry', kind: 'own', core: false, params: [{ i: 0, name: 'fp' }], args: (v) => [v], own: { re: /fp is not an effective string$/ }, ctl: 'nope.exe' })


//expandCore, 各站點展開為(公開函數, Core)兩個站點; Core之引數預設為args後接{ fs }
let list = []
for (let s of sites) {
    list.push({ ...s, name: s.fn + (s.tag ? '#' + s.tag : ''), isCore: false })
    if (s.core) {
        let coreArgs = s.coreArgs || ((v, i) => [...s.args(v, i), { fs: null }])
        list.push({ ...s, fn: s.fn + 'Core', args: coreArgs, name: s.fn + 'Core' + (s.tag ? '#' + s.tag : ''), isCore: true })
    }
}


//expMsg, 無效路徑之固定訊息(env、rej、thr): 不帶輸入值
function expMsg(name, badName) {
    return badName === 'nul' ? `invalid ${name}: must not contain a NUL character` : `invalid ${name}: must be a non-empty string`
}


export { bads, list as sites, expMsg }
