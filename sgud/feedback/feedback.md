# 回饋

任務中發現之自有套件、全域技能、全域設定之調整與抽提提案(全域設定 §12.2);只增不改,處置結果另記一列.提案不等於已修改,實際修改走各自之通報管道.

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-09 | 全域設定 | §8(Shell、工具與環境) | 建議補一條陷阱: 為建「基線副本」在子資料夾起 npm 專案時,`npm init -y --prefix <夾>` 會忽略 `--prefix` 而改寫**目前工作目錄**之 `package.json`(補預設欄位、加結尾換行、`repository.url`／`author` 被正規化,並可能加入 `"type": "commonjs"`);子資料夾之依賴改以 `npm --prefix <夾> install <套件>@<版>`(必要時先以 Write 寫該夾之 `package.json`),不用 `npm init`;動手後以 `git diff --stat -- package.json` 回驗. | 本輪(ws01)誤用後 repo `package.json` 多出 `description`／`directories`／`type`／`bugs`／`homepage` 等欄位,已還原並回驗(`git diff --stat -- package.json` 為 2 insertions、2 deletions);事件見 `sgud/exp/experience.md`〈外部依賴跨主版號升級〉第 1 條. |
