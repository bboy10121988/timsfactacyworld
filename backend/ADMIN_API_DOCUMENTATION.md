# 聯盟營銷系統管理員 API 完整文檔

## 概述
本文檔詳細說明了為聯盟營銷系統創建的完整管理員 API 端點。所有端點都位於 `/admin/affiliate/` 路徑下，提供全面的管理功能。

## API 端點總覽

### 1. 合作夥伴管理 API

#### 1.1 合作夥伴列表
- **端點**: `GET /admin/affiliate/partners`
- **文件**: `src/api/admin/affiliate/partners/route.ts`
- **功能**: 獲取所有合作夥伴列表，支援分頁、狀態篩選
- **查詢參數**:
  - `page`: 頁碼 (默認: 1)
  - `limit`: 每頁數量 (默認: 20)
  - `status`: 狀態篩選 (pending/approved/rejected/suspended)
- **回應**: 分頁的合作夥伴列表和統計信息

#### 1.2 單一合作夥伴詳情與管理
- **端點**: `GET/POST /admin/affiliate/partners/[id]`
- **文件**: `src/api/admin/affiliate/partners/[id]/route.ts`
- **功能**: 
  - GET: 獲取特定合作夥伴詳情
  - POST: 批准/拒絕/暫停合作夥伴
- **POST 請求體**:
  ```json
  {
    "action": "approve|reject|suspend",
    "reason": "操作原因"
  }
  ```

### 2. 佣金管理 API

#### 2.1 佣金列表
- **端點**: `GET /admin/affiliate/commissions`
- **文件**: `src/api/admin/affiliate/commissions/route.ts`
- **功能**: 獲取所有佣金記錄，支援多種篩選條件
- **查詢參數**:
  - `page`: 頁碼
  - `limit`: 每頁數量
  - `status`: 狀態篩選 (pending/confirmed/paid/cancelled)
  - `partner_id`: 特定合作夥伴篩選

#### 2.2 佣金狀態更新
- **端點**: `POST /admin/affiliate/commissions/[id]/status`
- **文件**: `src/api/admin/affiliate/commissions/[id]/status/route.ts`
- **功能**: 手動更新佣金狀態（確認/支付/取消）
- **請求體**:
  ```json
  {
    "status": "confirmed|paid|cancelled",
    "reason": "狀態更新原因"
  }
  ```

### 3. 統計數據 API

#### 3.1 管理員統計儀表板
- **端點**: `GET /admin/affiliate/stats`
- **文件**: `src/api/admin/affiliate/stats/route.ts`
- **功能**: 獲取系統整體統計數據
- **回應數據**:
  - 總合作夥伴數量（各狀態分別計算）
  - 總佣金金額（各狀態分別計算）
  - 待處理項目數量
  - 系統績效指標

### 4. 批量操作 API

#### 4.1 批量處理
- **端點**: `POST /admin/affiliate/batch`
- **文件**: `src/api/admin/affiliate/batch/route.ts`
- **功能**: 批量處理合作夥伴或佣金
- **請求體**:
  ```json
  {
    "action": "approve|reject|suspend|pay|cancel",
    "target": "partners|commissions",
    "ids": ["id1", "id2", "id3"],
    "data": {
      "reason": "批量操作原因"
    }
  }
  ```
- **回應**: 每個項目的處理結果和成功/失敗統計

### 5. 數據導出 API

#### 5.1 數據導出
- **端點**: `GET /admin/affiliate/export`
- **文件**: `src/api/admin/affiliate/export/route.ts`
- **功能**: 導出各類數據為 JSON 或 CSV 格式
- **查詢參數**:
  - `type`: 數據類型 (partners/commissions/payments)
  - `format`: 格式 (json/csv)
  - `dateFrom`: 開始日期
  - `dateTo`: 結束日期
  - `status`: 狀態篩選
- **功能特點**:
  - 支援 JSON 和 CSV 兩種格式
  - CSV 格式自動設置下載標頭
  - 包含完整的篩選和日期範圍支援

## 服務層增強

### AffiliateMinimalService 新增方法
在 `src/modules/affiliate/services/affiliate-minimal.ts` 中新增了以下管理員專用方法：

1. **getAdminPartners()**: 獲取管理員合作夥伴列表
2. **getAdminStats()**: 獲取系統統計數據
3. **getAdminCommissions()**: 獲取管理員佣金列表
4. **getPartner()**: 獲取單一合作夥伴詳情
5. **approvePartner()**: 批准/拒絕/暫停合作夥伴
6. **updateCommissionStatus()**: 更新佣金狀態

## API 安全性與權限

所有管理員 API 端點都應該：
1. 實施管理員身份驗證
2. 記錄所有操作的審計日誌
3. 實施適當的權限檢查
4. 提供詳細的錯誤處理和回應

## 使用範例

### 批准合作夥伴
```javascript
POST /admin/affiliate/partners/123
{
  "action": "approve",
  "reason": "審核通過，資料完整"
}
```

### 批量支付佣金
```javascript
POST /admin/affiliate/batch
{
  "action": "pay",
  "target": "commissions",
  "ids": ["comm_1", "comm_2", "comm_3"],
  "data": {
    "reason": "2024年第一季度佣金發放"
  }
}
```

### 導出合作夥伴數據
```
GET /admin/affiliate/export?type=partners&format=csv&status=approved
```

## 下一步開發建議

1. **前端管理介面**: 創建對應的 React 管理介面
2. **身份驗證**: 實施管理員權限驗證
3. **審計日誌**: 記錄所有管理操作
4. **通知系統**: 自動通知合作夥伴狀態變更
5. **報表系統**: 更詳細的數據分析和報表功能

## 測試建議

建議創建以下測試：
1. 所有 API 端點的單元測試
2. 批量操作的整合測試
3. 數據導出功能的測試
4. 權限和安全性測試

這套完整的管理員 API 提供了聯盟營銷系統所需的所有核心管理功能，支援手動審核和支付流程。
