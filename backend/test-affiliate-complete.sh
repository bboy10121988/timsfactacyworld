#!/bin/bash

# 聯盟行銷系統完整測試腳本
# 使用 curl 測試所有功能端點

echo "🚀 聯盟行銷系統完整測試開始"
echo "====================================="

BASE_URL="http://localhost:9000"
TEST_EMAIL="test-$(date +%s)@example.com"
PARTNER_ID=""
PARTNER_TOKEN=""
CONVERSION_ID=""

# 顏色設定
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0

# 測試函數
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    echo -e "\n${BLUE}🧪 測試: ${test_name}${NC}"
    test_count=$((test_count + 1))
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "${BASE_URL}${endpoint}" -H "Content-Type: application/json")
    else
        if [ -n "$data" ]; then
            response=$(curl -s -X POST "${BASE_URL}${endpoint}" -H "Content-Type: application/json" -d "$data")
        else
            response=$(curl -s -X POST "${BASE_URL}${endpoint}" -H "Content-Type: application/json")
        fi
    fi
    
    echo "   執行: curl -s -X $method \"${BASE_URL}${endpoint}\""
    echo "   回應: $response"
    
    # 檢查是否成功
    if echo "$response" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅ PASS${NC}"
        pass_count=$((pass_count + 1))
        echo "$response"
    else
        echo -e "   ${RED}❌ FAIL${NC}"
    fi
}

# 開始測試
echo -e "\n${YELLOW}📋 基礎測試${NC}"

# 1. 健康檢查
run_test "健康檢查" "GET" "/test-affiliate?action=health"

echo -e "\n${YELLOW}👥 夥伴管理測試${NC}"

# 2. 創建夥伴
partner_data="{\"name\":\"測試夥伴\",\"email\":\"$TEST_EMAIL\",\"phone\":\"0912345678\",\"website\":\"https://test.com\",\"password\":\"password123\"}"
result=$(run_test "創建夥伴" "POST" "/test-affiliate?action=create-partner" "$partner_data")
PARTNER_ID=$(echo "$result" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)

if [ -n "$PARTNER_ID" ]; then
    echo "   📝 夥伴 ID: $PARTNER_ID"
fi

# 3. 嘗試登入（未審核）
login_data="{\"email\":\"$TEST_EMAIL\",\"password\":\"password123\"}"
run_test "未審核夥伴登入（預期失敗）" "POST" "/test-affiliate?action=login" "$login_data"

# 4. 審核夥伴
if [ -n "$PARTNER_ID" ]; then
    approve_data="{\"partnerId\":\"$PARTNER_ID\",\"status\":\"approved\",\"reason\":\"測試核准\"}"
    run_test "審核夥伴" "POST" "/test-affiliate?action=approve-partner" "$approve_data"
fi

# 5. 審核後登入
result=$(run_test "審核後登入" "POST" "/test-affiliate?action=login" "$login_data")
PARTNER_TOKEN=$(echo "$result" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PARTNER_TOKEN" ]; then
    echo "   🔐 Token: ${PARTNER_TOKEN:0:30}..."
fi

# 6. 取得夥伴列表
run_test "取得夥伴列表" "GET" "/test-affiliate?action=partners"

echo -e "\n${YELLOW}👆 點擊追蹤測試${NC}"

# 7. 記錄點擊
if [ -n "$PARTNER_ID" ]; then
    click_data="{\"partnerId\":\"$PARTNER_ID\",\"productId\":\"test-product-1\",\"url\":\"https://shop.com/product/1\",\"userAgent\":\"Test Browser\",\"referrer\":\"https://test.com\"}"
    run_test "記錄點擊" "POST" "/test-affiliate?action=track-click" "$click_data"
    
    # 記錄更多點擊
    for i in {2..3}; do
        click_data="{\"partnerId\":\"$PARTNER_ID\",\"productId\":\"test-product-$i\",\"url\":\"https://shop.com/product/$i\",\"userAgent\":\"Test Browser\",\"referrer\":\"https://test.com\"}"
        run_test "記錄點擊 #$i" "POST" "/test-affiliate?action=track-click" "$click_data"
    done
fi

echo -e "\n${YELLOW}💰 轉換記錄測試${NC}"

# 8. 記錄轉換
if [ -n "$PARTNER_ID" ]; then
    conversion_data="{\"partnerId\":\"$PARTNER_ID\",\"orderId\":\"test-order-1\",\"productId\":\"test-product-1\",\"orderValue\":1000,\"commissionRate\":0.05}"
    result=$(run_test "記錄轉換" "POST" "/test-affiliate?action=record-conversion" "$conversion_data")
    CONVERSION_ID=$(echo "$result" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$CONVERSION_ID" ]; then
        echo "   📝 轉換 ID: $CONVERSION_ID"
    fi
    
    # 記錄更多轉換
    conversion_data2="{\"partnerId\":\"$PARTNER_ID\",\"orderId\":\"test-order-2\",\"productId\":\"test-product-2\",\"orderValue\":800,\"commissionRate\":0.04}"
    run_test "記錄轉換 #2" "POST" "/test-affiliate?action=record-conversion" "$conversion_data2"
fi

echo -e "\n${YELLOW}📊 統計資料測試${NC}"

# 9. 取得夥伴統計
if [ -n "$PARTNER_ID" ]; then
    stats_data="{\"partnerIdForStats\":\"$PARTNER_ID\"}"
    run_test "取得夥伴統計" "POST" "/test-affiliate?action=partner-stats" "$stats_data"
fi

# 10. 取得管理員統計
run_test "取得管理員統計" "GET" "/test-affiliate?action=stats"

echo -e "\n${YELLOW}💵 佣金管理測試${NC}"

# 11. 取得佣金列表
run_test "取得佣金列表" "GET" "/test-affiliate?action=commissions"

# 12. 更新佣金狀態
if [ -n "$CONVERSION_ID" ]; then
    update_data="{\"conversionId\":\"$CONVERSION_ID\",\"newStatus\":\"approved\",\"updateReason\":\"測試核准\"}"
    run_test "核准佣金" "POST" "/test-affiliate?action=update-commission" "$update_data"
    
    update_data2="{\"conversionId\":\"$CONVERSION_ID\",\"newStatus\":\"paid\",\"updateReason\":\"測試支付\"}"
    run_test "標記佣金已支付" "POST" "/test-affiliate?action=update-commission" "$update_data2"
fi

echo -e "\n${YELLOW}❌ 錯誤處理測試${NC}"

# 13. 無效密碼登入
invalid_login_data="{\"email\":\"$TEST_EMAIL\",\"password\":\"wrong-password\"}"
run_test "無效密碼登入（預期失敗）" "POST" "/test-affiliate?action=login" "$invalid_login_data"

# 14. 不存在的夥伴統計
invalid_stats_data="{\"partnerIdForStats\":\"non-existent-id\"}"
run_test "不存在的夥伴統計（預期失敗）" "POST" "/test-affiliate?action=partner-stats" "$invalid_stats_data"

echo -e "\n${YELLOW}📊 最終統計${NC}"

# 15. 最終管理員統計
run_test "最終管理員統計" "GET" "/test-affiliate?action=stats"

# 測試結果摘要
echo -e "\n${BLUE}📋 測試結果摘要${NC}"
echo "====================================="
echo "總測試數: $test_count"
echo -e "通過: ${GREEN}$pass_count${NC}"
echo -e "失敗: ${RED}$((test_count - pass_count))${NC}"

if [ $test_count -gt 0 ]; then
    pass_rate=$(echo "scale=1; $pass_count * 100 / $test_count" | bc)
    echo -e "通過率: ${YELLOW}${pass_rate}%${NC}"
fi

if [ $pass_count -eq $test_count ]; then
    echo -e "\n${GREEN}🎉 所有測試都通過了！聯盟行銷系統運作正常！${NC}"
else
    echo -e "\n${YELLOW}⚠️  有 $((test_count - pass_count)) 個測試失敗，請檢查相關功能。${NC}"
fi

if [ -n "$PARTNER_ID" ]; then
    echo -e "\n${BLUE}📌 測試資料:${NC}"
    echo "   夥伴 ID: $PARTNER_ID"
    echo "   測試 Email: $TEST_EMAIL"
    if [ -n "$PARTNER_TOKEN" ]; then
        echo "   Token: ${PARTNER_TOKEN:0:50}..."
    fi
fi

echo -e "\n${GREEN}✅ 測試完成！${NC}"
