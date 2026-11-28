# 狀態(資料夾差異同步)

本檔記 `fsSyncFolder`／`fsSyncFolderCore` 之現況;規則見 `sgud/rule/rulebook_fssync.md`.索引見 `sgud/state/state.md`.

## 目標內之連結與整份複製之來源連結(排程第 719 項接續;ws719b,2026-11-29;與下節同一版發布;工作樹,未提交未發布)

- 現況: R-FS-SYNC-LINK-01 全套——差異同步之刪除與寫入目標、整份複製分支之寫入目標,自目標資料夾之下一段起逐段 `lstatSync`,任一段為連結即於任何刪寫前 reject `invalid sync target: must not be or cross a link inside fdTar`;整份複製分支之來源含連結即 reject `invalid fdSrc: must not contain a link`;目標資料夾本身為連結者允許.必要相依方法不增.
- 測試: `test/fsSyncFolderLink.test.mjs`(實體檔案系統以 junction、記憶體 fs 驗符號連結);工具 `test/tools/linkSandbox.mjs`(沙盒清除先移除連結本身並回驗指向仍在)、`test/tools/memPathFs.mjs`(增符號連結).
- 驗證(2026-11-29): 新測試 36 案(對本輪動工前之原始碼 11 passing／25 failing,綠者皆行為保持);變異 28 項皆被抓(同批變異改用本輪之前之測試 0／28);記憶體 fs 隨機樹新舊對拍 12000 組(無連結 6000 組 0 差異;含連結者凡不同皆為連結拒收且無任何操作,新版目標外 0 變動);全套 34543 passing／8 pending／0 failing;唯讀獨立複審 1 次(指出之來源與目標重疊情形與 4 項測試缺口已補).下游盤點與沙盒實測見本輪報告.
- 已知缺口: 差異同步分支對來源連結之處置沿既有行為(目錄連結不進入列舉、檔案連結於雜湊時 reject),是否改為 reject 交主控裁定.

## 路徑處理與落點核對(排程第 719 項;ws719,2026-11-29;package.json version 1.9.83 之工作樹,未提交未發布)

- 現況: R-FS-SYNC-PATH-01 全套——反斜線只在 `path.sep` 為反斜線時換成 `/`;差異同步之刪除與寫入目標先全部核對須嚴格位於目標資料夾內(內部檔 `src/_isPathInside.mjs`),不合即 reject `invalid sync target: must be strictly inside fdTar` 且不動任何檔;自給 `opt.path` 須另提供 `relative`、`isAbsolute`.README 新增〈Changelog〉一節.
- 測試: `test/fsSyncFolderPath.test.mjs`(49 案,記憶體 fs `test/tools/memPathFs.mjs`)、`test/fsSyncFolder.test.mjs`、`test/fsDepsFailClosed.test.mjs`.修前紅: 新測試檔對修改前原始碼 6 passing／19 failing(`_isPathInside` 之表列案因模組不存在而整組以 hook 失敗呈現).
- 驗證: 新舊隨機對拍(Windows 語意與不含反斜線之 posix 語意各 1500 組,0 差異;含反斜線之 posix 語意 1500 組全部符合性質);變異 27 項抓 26,存活 1 項為「永不換反斜線」(對拍 1500 組 0 差異,等價);唯讀獨立複審 1 次(指出 3 項測試鑑別力缺口,已補);全套結果見本輪報告.
- 已知缺口:
  - ① 目標資料夾不存在時之整份複製分支不另做落點核對(名稱未經轉換).
  - ② 同步以外之寫入、刪除類函數之路徑觀察,另案(交主控).
  - ③ 來源內含無任何檔案之資料夾,或來源為空資料夾而目標原不存在時,再次同步仍回 `true`(本輪之前即如此,對拍時所見;未改).
  - ④ 純字串函數 `getPathParent` 系供 fs 寫入類推上層資料夾之站點,另案評估(交主控).
