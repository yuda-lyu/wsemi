# 規則帳本(資料夾同步之路徑處理)

本檔收排程第 719 項(ws719、ws719b,2026-11-29)之處置規則.索引見 `sgud/rule/rulebook.md`〈索引〉.依據: 專案原則 1(預設拒絕)、4(所有入口一致)、14(自有套件不做舊版相容),R-FS-DEPS-01(破壞性 Core 之相依先於第一個破壞性動作齊備),dspec〈診斷輸出與遮罩〉(套件自組之固定詞彙訊息不帶輸入值).

## R-FS-SYNC-PATH-01 差異同步: 反斜線只在以其為分隔字元之平台換成 `/`;刪除與寫入之目標須嚴格位於目標資料夾內

- **規則**:
  1. 由列舉得到之名稱組成相對路徑時,**只在 `path.sep` 為反斜線(Windows)時把反斜線換成 `/`**;其他平台之反斜線是合法之檔名字元,原樣比對、刪除與寫入.用於決定刪除、寫入目標之路徑,不得做不分平台之分隔字元替換.
  2. **落點核對**: 差異同步之刪除與寫入目標,以注入之 `path.relative` 自目標資料夾之絕對路徑起算;結果為空字串(目標資料夾本身)、`'..'`、以 `'..'` 加 `path.sep` 起首,或為絕對路徑(另一磁碟機、UNC)者一律拒收;只有名稱以 `..` 起首者(`..a`、`...`)仍在其內,不得以「字串以 `..` 起首」判定.`relative` 回傳非字串、`isAbsolute` 回傳非 `false` 者拒收(預設拒絕).不得以字串前綴比對代替.單一擁有者 `src/_isPathInside.mjs`(內部,不進 index).
  3. **順序與訊息**: 全部刪除與寫入之目標先算出並核對,任一不合即 reject 固定訊息 `invalid sync target: must be strictly inside fdTar`(不帶路徑),此次不做任何刪除與寫入;其後以核對過之同一字串操作.
  4. 注入之 `path` 須另提供 `relative`、`isAbsolute`(併入 R-FS-DEPS-01,缺漏於任何刪除與寫入之前 reject).
  5. 本條所核對者為由 `path.resolve` 組出之路徑字串;實際落點另依 R-FS-SYNC-LINK-01 以檔案系統判定.
- **適用範圍(判準)**: 以另一側之列舉決定刪除或寫入目標、且在其間對路徑做轉換之函數.同一資料夾內以 `path.join(<夾>, <列舉名>)` 直接組目標而不做字元替換者(複製、清空)刻意不套: 名稱未經轉換,內建 fs 之列舉名不含該平台之分隔字元,亦不含 `.`、`..`.
- **盤點指令**(Grep 工具,範圍 `src/`): `replaceAll\('\\\\'|replace\(/\\\\/g|replace\(/\\\\\\\\/g|split\('\\\\'\)|replace\('\\\\\\\\'`;另查以兩種分隔字元為準之判定 `\[\\\\/\]|\[/\\\\\]`.
- **站點全集與判準**(2026-11-29):

| 站點 | 判定 |
|---|---|
| `fsSyncFolderCore` 之相對路徑組成 | 已套(規則 1) |
| `fsSyncFolderCore` 差異同步之刪除、寫入目標 | 已套(規則 2、3) |
| `fsSyncFolderCore` 目標不是資料夾時之整份複製(`fsCopyFolderCore`) | 刻意不套(名稱未經轉換,`path.join(目標, 列舉名)`);連結核對另套 R-FS-SYNC-LINK-01 |
| `fsSrlog` 之工作目錄字串 `replaceAll` | 刻意不套(只用於記錄文字中之位置顯示,不作檔案操作) |
| `fsDownloadFileVerifyCore` 之 `fpOut` 尾端分隔判定與拼接 | 已依平台(`win32` 旗標) |
| `filepathToTree` 之分段 | 刻意不套(純字串函數,不做檔案操作,兩種分隔皆認) |
| `getDiagSecrets`、`_diagCases` | 刻意不套(遮罩之變體,不作檔案操作) |
| `_binRules`、`fsEnsureBinsCore` 之清單相對路徑 | 刻意不套(先經 `isBinRel` 拒收反斜線) |
| `fsTreeFolder`、`fsGetFilesInFolder`、`fsGetFoldersInFolder`、`fsGetFilesWithHashInFolder` 之 JSDoc 範例 | 刻意不套(範例輸出之顯示) |
| `getClearPathName`、`getFileName`、`getPathParent`(純字串函數)及以之推上層資料夾之 fs 寫入函數 | 未套: 另案評估(交主控) |

- **行為改變**(見破壞性變更紀錄第 87 項): 非 Windows 上含反斜線之名稱照原樣同步;落點不合者由原結果改為 reject;自給 `opt.path` 缺 `relative`、`isAbsolute` 者改 reject.Windows 上經內建 fs 之結果不變.
- **測試**: `test/fsSyncFolderPath.test.mjs`(記憶體 fs `test/tools/memPathFs.mjs`,以 `path.posix`／`path.win32` 驗兩平台語意,與執行測試之平台無關;含 `_isPathInside` 之表列案與一組真實 fs 案)、`test/fsSyncFolder.test.mjs`、`test/fsDepsFailClosed.test.mjs`(相依訊息).指令: `npx mocha --no-parallel test/fsSyncFolderPath.test.mjs test/fsSyncFolder.test.mjs test/fsDepsFailClosed.test.mjs --timeout 180000`.
- **改此邏輯時**: 另跑新舊對拍(記憶體 fs 隨機樹: Windows 語意與不含反斜線之 posix 語意須與前版完全相同;含反斜線之 posix 語意須「目標資料夾外不變、成功時目標檔案集合等於來源」),並先以「多寫一檔、少刪一項、改一個來源路徑」三種變體確認對拍工具抓得到.

## R-FS-SYNC-LINK-01 資料夾同步之刪除與寫入不經過目標資料夾內之連結

- **規則**:
  1. **判定方式**: 以注入之 `fs.lstatSync`(不跟進連結)之 `isSymbolicLink()` 判定(Windows 之 junction 亦回 `true`).自目標資料夾之下一段起逐段判定至目標本身;遇不存在(`ENOENT`)或上層非資料夾(`ENOTDIR`)即止(其下沒有項目);其他錯誤 reject(預設拒絕).目標資料夾本身是呼叫端給定之路徑,不在判定範圍.
  2. **差異同步**: 本次要刪除與寫入之全部目標路徑,先於任何刪除與寫入判定;任一段為連結即整批 reject `invalid sync target: must not be or cross a link inside fdTar`(不帶路徑).
  3. **整份複製**(目標不是資料夾: 不存在、為檔案或本身為連結): 寫入前走訪全部來源(組路徑與遞迴之判定與實際複製相同);來源任一層為連結即 reject `invalid fdSrc: must not contain a link`;寫入目標之對應路徑為連結依第 2 點之訊息 reject;皆先於任何寫入.複製期間另經包裝之 `fs`,於每次建資料夾與寫檔前以同一判定再核對該目標路徑(檢查之值即使用之值: 來源與目標重疊時,複製途中會列舉出事前走訪所沒有之路徑),且任何建立連結之呼叫一律拒收——同步不把來源之連結建到目標.
  4. 判定所需之 `lstatSync`、`readdirSync` 與 `path.join`、`relative`、`sep` 列入必要相依(R-FS-DEPS-01),缺漏於任何刪除與寫入之前 reject.
  5. **不在本條**: 差異同步之來源側連結沿列舉之既有行為(目錄連結不進入列舉、檔案連結於雜湊時 reject);目標內未被任何刪除或寫入經過之連結不使呼叫失敗.
- **適用範圍(判準)**: 同步類函數中,以列舉另一側決定刪除或寫入目標者.單一擁有者 `src/fsSyncFolderCore.mjs` 之 `crossesLink`(差異同步)、`chkCopyLinks`(整份複製之事前走訪)與 `guardCopyFs`(整份複製期間),共用 `kindByLstat`.
- **站點全集與判準**(2026-11-29):

| 站點 | 判定 |
|---|---|
| `fsSyncFolderCore` 差異同步之刪除、寫入目標 | 已套(規則 2) |
| `fsSyncFolderCore` 整份複製分支 | 已套(規則 3) |
| `fsSyncFolder`(經 Core) | 已套 |
| 其他寫入、刪除類函數 | 另案評估(交主控) |

- **測試**: `test/fsSyncFolderLink.test.mjs`(實體檔案系統以 junction、非 Windows 為符號連結,工具 `test/tools/linkSandbox.mjs`;符號連結之情形以記憶體 fs `test/tools/memPathFs.mjs` 驗,與執行平台無關).指令: `npx mocha --no-parallel test/fsSyncFolderLink.test.mjs test/fsSyncFolderPath.test.mjs test/fsSyncFolder.test.mjs --timeout 180000`.
- **行為改變**: 見破壞性變更紀錄第 88 項.
