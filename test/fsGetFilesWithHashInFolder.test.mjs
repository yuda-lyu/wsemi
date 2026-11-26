import assert from 'assert'
import _ from 'lodash-es'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'
import { itFsHashFail, itOptUnreadable, rejected, RULE } from './tools/fsHashFailRunner.mjs'


describe(`fsGetFilesWithHashInFolder`, function() {

    let test = async () => {

        let ms = []

        let t = '_test_fsGetFilesWithHashInFolder'
        let fdt = './_test_fsGetFilesWithHashInFolder'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let ftpath = (v) => {
            // console.log(v, 'v.path', v.path)
            let ss = _.split(v.path, t)
            // console.log('ss', ss)
            let p = ss[1]
            p = p.replaceAll('\\', '/')
            p = `.${p}`
            // console.log('p', p)
            v.path = p
            return v
        }

        let ftpaths = (vs) => {
            return _.map(_.cloneDeep(vs), ftpath)
        }

        fsWriteText(`${fdt}/z1.txt`, 'z1')
        fsWriteText(`${fdt}/abc/z2.txt`, 'z2')
        fsWriteText(`${fdt}/def/ijk/z3.txt`, 'z3')
        fsCreateFolder(`${fdt}/mno/pqr`)

        let r1 = await fsGetFilesWithHashInFolder(fdt, { levelLimit: 1 })
        // console.log('fsGetFilesWithHashInFolder(levelLimit=1)', ftpaths(r1))
        ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=1)': ftpaths(r1) })

        let rall = await fsGetFilesWithHashInFolder(fdt)
        // console.log('fsGetFilesWithHashInFolder(levelLimit=unset)', ftpaths(rall))
        ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=unset)': ftpaths(rall) })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', JSON.stringify(ms))
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFilesWithHashInFolder(levelLimit=1) [
    //   {
    //     level: 1,
    //     path: './z1.txt',
    //     name: 'z1.txt',
    //     hashType: 'md5',
    //     hash: '3b770ebe9b04f171f0ead0e07d8e2882'
    //   }
    // ]
    // fsGetFilesWithHashInFolder(levelLimit=unset) [
    //   {
    //     level: 2,
    //     path: './abc/z2.txt',
    //     name: 'z2.txt',
    //     hashType: 'md5',
    //     hash: '5cb7e380d019de63c643aef55b8534d0'
    //   },
    //   {
    //     level: 3,
    //     path: './def/ijk/z3.txt',
    //     name: 'z3.txt',
    //     hashType: 'md5',
    //     hash: 'a61d1457beb4684e254ce60379c8ae7b'
    //   },
    //   {
    //     level: 1,
    //     path: './z1.txt',
    //     name: 'z1.txt',
    //     hashType: 'md5',
    //     hash: '3b770ebe9b04f171f0ead0e07d8e2882'
    //   }
    // ]
    let ms = [{ 'fsGetFilesWithHashInFolder(evelLimit=1)': [{ 'level': 1, 'path': './z1.txt', 'name': 'z1.txt', 'hashType': 'md5', 'hash': '3b770ebe9b04f171f0ead0e07d8e2882' }] }, { 'fsGetFilesWithHashInFolder(evelLimit=unset)': [{ 'level': 2, 'path': './abc/z2.txt', 'name': 'z2.txt', 'hashType': 'md5', 'hash': '5cb7e380d019de63c643aef55b8534d0' }, { 'level': 3, 'path': './def/ijk/z3.txt', 'name': 'z3.txt', 'hashType': 'md5', 'hash': 'a61d1457beb4684e254ce60379c8ae7b' }, { 'level': 1, 'path': './z1.txt', 'name': 'z1.txt', 'hashType': 'md5', 'hash': '3b770ebe9b04f171f0ead0e07d8e2882' }] }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsGetFilesWithHashInFolder 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsHashFailRunner.mjs), 夾具建於test/_tmp/fsHashFail-<案名>/並由執行器刪除(拒讀ACL先以icacls解除)
    //id為審計輸入空間表(tmp/run01-1016/fs/fs-reject-table.md)之列號(FW07為規則2之補列); want以子行程回報之事實組出期望; rule為期望所對應之規則句
    this.timeout(60000)

    itFsHashFail([
        //FW01、FW02: 不存在、不是資料夾/檔案之訊息固定且不帶路徑(V19、V20), 期望為固定字串(不含o.fd、o.fpDangling)
        { id: 'FW01', when: '真實fs: 資料夾不存在', want: () => rejected('invalid fd: must be an existing folder'), rule: RULE.r1pre },
        { id: 'FW02', when: '真實fs: 夾內含懸空junction', want: () => rejected('invalid fp: must be an existing file'), rule: RULE.r1pre },
        //FW03: type不支援('nope'不在'xxhash64'與crypto.getHashes())於入口以固定說明字串reject(允許集合含xxhash64, 故訊息與fsGetFolderBasicHash、fsTreeFolderWithHash不同; 舊為讀檔時createHash拋'Error: Digest method not supported')
        { id: 'FW03', when: '真實crypto: type不支援(不在xxhash64與crypto.getHashes())', want: () => rejected('invalid opt.type: must be \'xxhash64\' or one of crypto.getHashes()'), rule: RULE.rType },
        //FW04~FW06: 原生錯誤(EPERM)之拒絕值為固定詞彙加錯誤碼(o.errStr為子行程對同一真實錯誤依fsErrStr算出之字串)
        { id: 'FW04', when: '真實fs: 夾內檔案ACL拒讀, type=xxhash64', want: (o) => rejected(o.errStr), rule: RULE.r1native, win: true },
        { id: 'FW05', when: '真實fs: 夾內檔案ACL拒讀, type預設md5', want: (o) => rejected(o.errStr), rule: RULE.r1native, win: true },
        { id: 'FW06', when: '真實fs: 子資料夾ACL拒列(readdirSync EPERM)', want: (o) => rejected(o.errStr), rule: RULE.r2tree, win: true },
        { id: 'FW07', when: '對外函數+opt.fs: lstatSync拋null', want: () => rejected('null'), rule: RULE.r2 },
    ])

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: RULE.r2opt)
    //已撤銷之Proxy於第2參數(opt)之遷移期檢查即判為非物件(R-LEVEL-LIMIT-02), 以固定說明字串reject
    itOptUnreadable(['fsGetFilesWithHashInFolder', 'fsGetFilesWithHashInFolderCore'], { revokedMsg: 'invalid opt: must be an object' })

})
