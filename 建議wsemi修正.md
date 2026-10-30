# 建議 wsemi 修正(來源:w-orm-postgresql 之 mig-pg,2026-10-29)

依全域設定 §5.2 與遷移通則:發現 wsemi 函數之缺陷不在本套件繞道,交主控.以下 1 項.

## 1. `getDiagBriefErr` 之類別名規則使 `opt.types` 對 pg 之 `DatabaseError` 不生效

- **現象**:pg 之後端錯誤為 `pg.DatabaseError` 實例,建構時**自帶 `name = 'error'`**(`pg-protocol` 之 `DatabaseError` 建構子 `this.name = name`,後端 ErrorResponse 傳入 `'error'`).wsemi 之類別名規則(`_diagKit.mjs` `className`:原型鏈首個 `name` 字串資料屬性且非 `'Error'` 者即取之,否則取建構子名)取到 `'error'`,不在 `ERR_TYPES ∪ opt.types`,故一律列 `'Error'`;套件宣告 `types: ['DatabaseError']`(設計 §4.1 之 pg 列)對真驅動錯誤永遠不生效.舊自製 `getBriefErr` 取建構子名,為 `DatabaseError`.
- **最小重現**:`tmp/mig-pg/probe-types.mjs`(w-orm-postgresql 工作夾,已複製於本證據夾 `probe-types.mjs`),輸出:
  ```
  real driver class  : {"name":"error","ctor":"DatabaseError"} -> {"errType":"Error","errCode":"23505"}
  name not overridden: {"name":"Error","ctor":"DatabaseError"} -> {"errType":"DatabaseError","errCode":"23505"}
  own name deleted   : {"name":"Error","ctor":"DatabaseError"} -> {"errType":"DatabaseError","errCode":"23505"}
  ```
- **影響**:僅診斷輸出之摘要欄位 `errType`(listener 轉拋真後端錯誤時,`error handler threw { mode, errType: 'Error', errCode: '23505' }`,`errCode` 不受影響);不涉及遮罩與洩漏.屬宣告集合(`types`)名實不符:套件宣告了卻無法生效,語料 `C04` 只測 `codes`,未測 `types` 對「實例 name 被改寫」之類別.
- **建議**:`className` 取得之名稱不在允許集合時,若建構子之自有資料 `name` 在允許集合(`ERR_TYPES ∪ opt.types`)則取建構子名(兩者皆經現行之識別字樣式檢查);或改為「`opt.types` 比對建構子名優先於實例 `name`」.須注意現行保留之防線:實例自設 `name` 可夾帶識別字(外審 C-1),故仍只在**允許集合**內才照列,集合外一律 `Error`(不改變 B10 之行為).語料宜增一案:`class DatabaseError extends Error` 且實例自設 `name = 'error'`、`opt.types:['DatabaseError']` → `errType: 'DatabaseError'`.
- **本套件之處置**:不繞道(不自寫類別名判定);測試以「類別名為 `DatabaseError`、未改寫 `name`」之類別驗證 `types` 宣告有接上,對真驅動錯誤只斷言 `errCode`(`unit-diaglog` C01、`api-diaglog` 真後端案),README 載明「自設 `name` 者(如 pg 之 `DatabaseError`,其 `name` 為 `'error'`)亦列 `Error`」.wsemi 修正發布後,本套件之測試與 README 該句須同步(測試之 `['Error','DatabaseError'].includes(...)` 放寬斷言可收緊為 `DatabaseError`).
