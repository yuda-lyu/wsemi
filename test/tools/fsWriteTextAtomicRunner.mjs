//fsWriteTextAtomicRunner.mjs: fsWriteTextAtomicCore.test.mjs之子行程執行器, 模擬寫入暫存檔(或目標檔)寫到一半時行程被終止
//  node <runner> <caseName>; 目標檔路徑由環境變數WSEMI41_TARGET給定(測試檔建立與刪除); 寫一半後以離開碼7結束(process.exit模擬中止, 之後的清理與rename都不會執行)
//  案例: crashAtomic(原子寫入: 暫存檔寫一半即終止)、crashPlain(對照: 非原子之fsWriteTextCore直接寫目標檔寫一半即終止)、bareName(純檔名寫入子行程之工作目錄)
import fs from 'fs'
import fsWriteTextAtomic from '../../src/fsWriteTextAtomic.mjs'
import fsWriteTextAtomicCore from '../../src/fsWriteTextAtomicCore.mjs'
import fsWriteTextCore from '../../src/fsWriteTextCore.mjs'


let caseName = process.argv[2]
let fp = process.env.WSEMI41_TARGET

//寫入前半內容('NEW-'為新內容 'NEW-CONTENT-LONG' 之前4字)後立即終止
let fsx = {
    ...fs,
    writeFileSync: (p, c, enc) => {
        fs.writeFileSync(p, c.slice(0, 4), enc)
        process.exit(7)
    },
}

if (caseName === 'bareName') {
    //純檔名(無資料夾部分)寫入工作目錄(測試檔以夾具資料夾為子行程之cwd)
    let r = fsWriteTextAtomic('bare.txt', 'bare-content')
    process.stdout.write('@@R@@' + JSON.stringify({ r: r.error ? { error: String(r.error) } : r }) + '\n')
    process.exit(0)
}
else if (caseName === 'crashAtomic') {
    fsWriteTextAtomicCore(fp, 'NEW-CONTENT-LONG', { fs: fsx })
}
else if (caseName === 'crashPlain') {
    fsWriteTextCore(fp, 'NEW-CONTENT-LONG', { fs: fsx })
}
else {
    throw new Error(`unknown case: ${caseName}`)
}
process.exit(0) //不應到達
