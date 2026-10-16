import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import { itFsHashFail, itOptUnreadable, rejected, RULE } from './tools/fsHashFailRunner.mjs'


describe(`fsSyncFolder`, function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsSyncFolder'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fdSrc = `${fdt}/src`
        let fdTar = `${fdt}/tar`

        let fp
        let stage
        let b
        let bSync

        if (true) {

            fp = `${fdTar}/t0.txt`
            fsWriteText(fp, 't0')

            fp = `${fdTar}/abc/t1.txt`
            fsWriteText(fp, 'abc-t1')

            fp = `${fdTar}/abc/t2.txt`
            fsWriteText(fp, 'abc-t2')

            fp = `${fdTar}/def/xyz/t3.txt`
            fsWriteText(fp, 'def-xyz-t3')

        }

        if (true) {

            //檔案內容變更
            fp = `${fdSrc}/t0.txt`
            fsWriteText(fp, 't0-mod')

            //未變更
            fp = `${fdSrc}/abc/t1.txt`
            fsWriteText(fp, 'abc-t1')

            //檔案新增
            fp = `${fdSrc}/abc/t1-add.txt`
            fsWriteText(fp, 'abc-t1-add')

            //檔案刪除
            // fp = `${fdSrc}/abc/t2.txt`
            // fsWriteText(fp, 'abc-t2')

            //資料夾刪除, 檔案刪除
            // fp = `${fdSrc}/def/xyz/t3.txt`
            // fsWriteText(fp, 'def-xyz-t3')

            //資料夾新增, 檔案新增
            fp = `${fdSrc}/def/xyz-add/t3.txt`
            fsWriteText(fp, 'def-xyz-add-t3')

        }

        stage = 'before'

        fp = `${fdTar}/t0.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/abc`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b })

        fp = `${fdTar}/abc/t1.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/abc/t2.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/def`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b })

        fp = `${fdTar}/def/xyz`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b })

        fp = `${fdTar}/def/xyz/t3.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        stage = 'sync'

        bSync = await fsSyncFolder(fdSrc, fdTar)
        // console.log(stage, 'bSync', bSync)
        ms.push({ stage, bSync }) //bSync=true, 有差異故需同步

        stage = 'after'

        fp = `${fdTar}/t0.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/abc`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b })

        fp = `${fdTar}/abc/t1.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/abc/t1-add.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/abc/t2.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b) //b=false
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/def`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b })

        fp = `${fdTar}/def/xyz`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b }) //b=false

        fp = `${fdTar}/def/xyz-add`
        b = fsIsFolder(fp)
        // console.log(stage, fp, 'fsIsFolder', b)
        ms.push({ stage, fp, fsIsFolder: b })

        fp = `${fdTar}/def/xyz/t3.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b) //b=false
        ms.push({ stage, fp, fsIsFile: b })

        fp = `${fdTar}/def/xyz-add/t3.txt`
        b = fsIsFile(fp)
        // console.log(stage, fp, 'fsIsFile', b)
        ms.push({ stage, fp, fsIsFile: b })

        stage = 'sync-again'

        bSync = await fsSyncFolder(fdSrc, fdTar)
        // console.log(stage, 'bSync', bSync)
        ms.push({ stage, bSync }) //bSync=false, 已無差異故無須同步

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', JSON.stringify(ms, null, 2))
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // before ./_test_fsSyncFolder/tar/t0.txt fsIsFile true
    // before ./_test_fsSyncFolder/tar/abc fsIsFolder true
    // before ./_test_fsSyncFolder/tar/abc/t1.txt fsIsFile true
    // before ./_test_fsSyncFolder/tar/abc/t2.txt fsIsFile true
    // before ./_test_fsSyncFolder/tar/def fsIsFolder true
    // before ./_test_fsSyncFolder/tar/def/xyz fsIsFolder true
    // before ./_test_fsSyncFolder/tar/def/xyz/t3.txt fsIsFile true
    // sync bSync true
    // after ./_test_fsSyncFolder/tar/t0.txt fsIsFile true
    // after ./_test_fsSyncFolder/tar/abc fsIsFolder true
    // after ./_test_fsSyncFolder/tar/abc/t1.txt fsIsFile true
    // after ./_test_fsSyncFolder/tar/abc/t1-add.txt fsIsFile true
    // after ./_test_fsSyncFolder/tar/abc/t2.txt fsIsFile false
    // after ./_test_fsSyncFolder/tar/def fsIsFolder true
    // after ./_test_fsSyncFolder/tar/def/xyz fsIsFolder false
    // after ./_test_fsSyncFolder/tar/def/xyz-add fsIsFolder true
    // after ./_test_fsSyncFolder/tar/def/xyz/t3.txt fsIsFile false
    // after ./_test_fsSyncFolder/tar/def/xyz-add/t3.txt fsIsFile true
    // sync-again bSync false
    // ms [
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/t0.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/abc",
    //     "fsIsFolder": true
    //   },
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/abc/t1.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/abc/t2.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/def",
    //     "fsIsFolder": true
    //   },
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/def/xyz",
    //     "fsIsFolder": true
    //   },
    //   {
    //     "stage": "before",
    //     "fp": "./_test_fsSyncFolder/tar/def/xyz/t3.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "sync",
    //     "bSync": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/t0.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/abc",
    //     "fsIsFolder": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/abc/t1.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/abc/t1-add.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/abc/t2.txt",
    //     "fsIsFile": false
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/def",
    //     "fsIsFolder": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/def/xyz",
    //     "fsIsFolder": false
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/def/xyz-add",
    //     "fsIsFolder": true
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/def/xyz/t3.txt",
    //     "fsIsFile": false
    //   },
    //   {
    //     "stage": "after",
    //     "fp": "./_test_fsSyncFolder/tar/def/xyz-add/t3.txt",
    //     "fsIsFile": true
    //   },
    //   {
    //     "stage": "sync-again",
    //     "bSync": false
    //   }
    // ]
    let ms = [
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/t0.txt',
            'fsIsFile': true
        },
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/abc',
            'fsIsFolder': true
        },
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/abc/t1.txt',
            'fsIsFile': true
        },
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/abc/t2.txt',
            'fsIsFile': true
        },
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/def',
            'fsIsFolder': true
        },
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/def/xyz',
            'fsIsFolder': true
        },
        {
            'stage': 'before',
            'fp': './_test_fsSyncFolder/tar/def/xyz/t3.txt',
            'fsIsFile': true
        },
        {
            'stage': 'sync',
            'bSync': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/t0.txt',
            'fsIsFile': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/abc',
            'fsIsFolder': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/abc/t1.txt',
            'fsIsFile': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/abc/t1-add.txt',
            'fsIsFile': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/abc/t2.txt',
            'fsIsFile': false
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/def',
            'fsIsFolder': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/def/xyz',
            'fsIsFolder': false
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/def/xyz-add',
            'fsIsFolder': true
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/def/xyz/t3.txt',
            'fsIsFile': false
        },
        {
            'stage': 'after',
            'fp': './_test_fsSyncFolder/tar/def/xyz-add/t3.txt',
            'fsIsFile': true
        },
        {
            'stage': 'sync-again',
            'bSync': false
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsSyncFolder 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsHashFailRunner.mjs), 夾具建於test/_tmp/fsHashFail-<案名>/並由執行器刪除
    //id為審計輸入空間表(tmp/run01-1016/fs/fs-reject-table.md)之列號(SY06為規則2之補列); want以子行程回報之事實組出期望; rule為期望所對應之規則句
    //SY02、SY04之errStr為對外fsCopyFolder(async)對同一來源與目標回傳之error之字串, SY05之內部複製(fsCopyFileCore)之error為注入之createWriteStream拋出之Error('ws boom')
    this.timeout(60000)

    itFsHashFail([
        { id: 'SY01', when: '真實fs: 來源資料夾不存在', want: (o) => rejected(`fdSrc[${o.fdSrc}] is not a folder`), rule: RULE.r1pre },
        { id: 'SY02', when: '真實fs: 目標為既有檔案', want: (o) => rejected(o.errStr), rule: RULE.r4c },
        { id: 'SY03', when: '真實fs: 目標存在, 來源含懸空junction', want: (o) => rejected(`fp[${o.fpDangling}] is not a file`), rule: RULE.r1pre },
        { id: 'SY04', when: '真實fs: 目標之上層為檔案(ENOTDIR)', want: (o) => rejected(o.errStr), rule: RULE.r4c },
        { id: 'SY05', when: 'Core注入fs: 目標存在, 新增檔案複製時createWriteStream拋Error', want: () => rejected('Error: ws boom'), rule: RULE.r4c },
        { id: 'SY06', when: '對外函數+opt.fs: lstatSync拋null', want: () => rejected('null'), rule: RULE.r2 },
        //SY07、SY08(外審 opus F13): 刪除目標內多出之項目失敗, 拒絕值為fsDeleteFileCore/fsDeleteFolderCore之error(注入之Error原樣)經_errToStr之字串, 且該項目仍在(left須為true, 否則期望值即不成立)
        { id: 'SY07', when: 'Core注入fs: 目標內多出之檔案, unlinkSync拋EBUSY', want: (o) => rejected(o.left ? 'Error: busy' : '<old.txt應仍在>'), rule: RULE.r4cDel },
        { id: 'SY08', when: 'Core注入fs: 目標內多出之資料夾, rmSync拋EPERM', want: (o) => rejected(o.left ? 'Error: perm' : '<oldDir應仍在>'), rule: RULE.r4cDel },
    ])

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: RULE.r2opt); 來源與目標皆為夾具內不存在之路徑
    itOptUnreadable(['fsSyncFolder', 'fsSyncFolderCore'])

})
