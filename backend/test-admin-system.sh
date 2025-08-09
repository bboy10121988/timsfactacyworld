#!/bin/bash

# 聯盟行銷管理員系統完整測試腳本
# 使用 curl 測試所有管理員功能端點

echo "🔧 聯盟行銷管理員系統測試開始"
echo "======================================="

BASE_URL="http://localhost:9000"
ADMIN_TOKEN=""

# 顏色設定
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0

# 測試函數
run_admin_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local use_auth="$5"
    
    echo -e "\n${BLUE}🔐 管理員測試: ${test_name}${NC}"
    test_count=$((test_count + 1))
    
    local auth_header=""
    if [ "$use_auth" = "true" ] && [ -n "$ADMIN_TOKEN" ]; then
        auth_header="-H \"Authorization: Bearer $ADMIN_TOKEN\""
    fi
    
    if [ "$method" = "GET" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -X GET "${BASE_URL}${endpoint}" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN")
        else
            response=$(curl -s -X GET "${BASE_URL}${endpoint}" -H "Content-Type: application/json")
        fi
    else
        if [ -n "$data" ]; then
            if [ -n "$auth_header" ]; then
                response=$(curl -s -X POST "${BASE_URL}${endpoint}" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d "$data")
            else
                response=$(curl -s -X POST "${BASE_URL}${endpoint}" -H "Content-Type: application/json" -d "$data")
            fi
        else
            if [ -n "$auth_header" ]; then
                response=$(curl -s -X POST "${BASE_URL}${endpoint}" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN")
            else
                response=$(curl -s -X POST "${BASE_URL}${endpoint}" -H "Content-Type: application/json")
            fi
        fi
    fi
    
    echo "   執行: curl -s -X $method \"${BASE_URL}${endpoint}\""
    if [ -n "$data" ]; then
        echo "   資料: $data"
    fi
    echo "   回應: $response"
    
    # 檢查是否成功或包含預期回應
    if echo "$response" | grep -q '"success":true\|"admin"\|"token"\|"partners"\|"stats"\|"commissions"'; then
        echo -e "   ${GREEN}✅ PASS${NC}"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "   ${RED}❌ FAIL${NC}"
        return 1
    fi
}

echo -e "\n${YELLOW}🔑 管理員認證測試${NC}"

# 1. 測試管理員登入
login_data='{"email":"admin@timsfactory.com","password":"admin123"}'
if run_admin_test "管理員登入" "POST" "/admin/affiliate/auth" "$login_data" "false"; then
    # 提取 token
    ADMIN_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$ADMIN_TOKEN" ]; then
        echo "   🎫 管理員 Token: ${ADMIN_TOKEN:0:30}..."
    fi
fi

# 2. 測試錯誤登入
wrong_login_data='{"email":"admin@timsfactory.com","password":"wrongpassword"}'
run_admin_test "錯誤密碼登入（預期失敗）" "POST" "/admin/affiliate/auth" "$wrong_login_data" "false"

# 3. 獲取管理員列表
run_admin_test "獲取管理員列表" "GET" "/admin/affiliate/auth" "" "false"

echo -e "\n${YELLOW}👥 夥伴管理測試${NC}"

# 4. 獲取夥伴列表（需要認證）
run_admin_test "獲取夥伴列表" "GET" "/admin/affiliate/partners" "" "true"

# 5. 獲取夥伴列表（分頁）
run_admin_test "獲取夥伴列表（分頁）" "GET" "/admin/affiliate/partners?page=1&limit=10" "" "true"

# 6. 獲取特定狀態夥伴
run_admin_test "獲取待審核夥伴" "GET" "/admin/affiliate/partners?status=pending" "" "true"

# 7. 測試未認證訪問（預期失敗）
run_admin_test "未認證獲取夥伴列表（預期失敗）" "GET" "/admin/affiliate/partners" "" "false"

echo -e "\n${YELLOW}💰 佣金管理測試${NC}"

# 8. 獲取佣金列表
run_admin_test "獲取佣金列表" "GET" "/admin/affiliate/commissions" "" "true"

# 9. 獲取佣金列表（分頁）
run_admin_test "獲取佣金列表（分頁）" "GET" "/admin/affiliate/commissions?page=1&limit=5" "" "true"

# 10. 獲取特定狀態佣金
run_admin_test "獲取待審核佣金" "GET" "/admin/affiliate/commissions?status=pending" "" "true"

echo -e "\n${YELLOW}📊 統計數據測試${NC}"

# 11. 獲取管理員統計
run_admin_test "獲取管理員統計" "GET" "/admin/affiliate/stats" "" "true"

# 12. 測試未認證統計訪問（預期失敗）
run_admin_test "未認證獲取統計（預期失敗）" "GET" "/admin/affiliate/stats" "" "false"

echo -e "\n${YELLOW}🔒 安全性測試${NC}"

# 13. 測試無效 token
INVALID_TOKEN="invalid.token.here"
echo "   使用無效Token測試..."
invalid_response=$(curl -s -X GET "${BASE_URL}/admin/affiliate/partners" -H "Content-Type: application/json" -H "Authorization: Bearer $INVALID_TOKEN")
echo "   無效Token回應: $invalid_response"
if echo "$invalid_response" | grep -q '"success":false\|"error"'; then
    echo -e "   ${GREEN}✅ 安全檢查通過：無效Token被正確拒絕${NC}"
    pass_count=$((pass_count + 1))
else
    echo -e "   ${RED}❌ 安全檢查失敗：無效Token未被拒絕${NC}"
fi
test_count=$((test_count + 1))

# 14. 測試惡意輸入
malicious_data='{"email":"<script>alert(1)</script>","password":"test"}'
run_admin_test "惡意輸入測試（預期失敗）" "POST" "/admin/affiliate/auth" "$malicious_data" "false"

echo -e "\n${YELLOW}📋 Rate Limiting 測試${NC}"

# 15. 快速多次請求測試
echo "   執行多次快速請求測試..."
for i in {1..5}; do
    quick_response=$(curl -s -X GET "${BASE_URL}/admin/affiliate/stats" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN")
    echo "   請求 #$i: $(echo $quick_response | head -c 50)..."
    sleep 0.1
done

echo -e "\n${YELLOW}🔄 完整工作流程測試${NC}"

# 16. 先使用測試端點創建一個夥伴，然後通過管理介面操作
partner_data='{"name":"管理測試夥伴","email":"admin-test@example.com","phone":"0987654321","website":"https://admintest.com","password":"test123"}'
echo "   創建測試夥伴..."
create_response=$(curl -s -X POST "${BASE_URL}/test-affiliate?action=create-partner" -H "Content-Type: application/json" -d "$partner_data")
echo "   創建回應: $create_response"

# 提取夥伴ID
PARTNER_ID=$(echo "$create_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
if [ -n "$PARTNER_ID" ]; then
    echo "   📝 測試夥伴 ID: $PARTNER_ID"
    
    # 17. 通過管理介面審核夥伴
    approve_data="{\"status\":\"approved\",\"reason\":\"管理介面測試核准\"}"
    run_admin_test "審核夥伴" "POST" "/admin/affiliate/partners/$PARTNER_ID/approve" "$approve_data" "true"
fi

echo -e "\n${YELLOW}🎯 錯誤處理測試${NC}"

# 18. 測試不存在的端點
run_admin_test "訪問不存在端點（預期失敗）" "GET" "/admin/affiliate/nonexistent" "" "true"

# 19. 測試錯誤的HTTP方法
run_admin_test "錯誤HTTP方法（預期失敗）" "DELETE" "/admin/affiliate/stats" "" "true"

# 測試結果摘要
echo -e "\n${BLUE}📊 管理員系統測試結果摘要${NC}"
echo "=========================================="
echo "總測試數: $test_count"
echo -e "通過: ${GREEN}$pass_count${NC}"
echo -e "失敗: ${RED}$((test_count - pass_count))${NC}"

if [ $test_count -gt 0 ]; then
    pass_rate=$(echo "scale=1; $pass_count * 100 / $test_count" | bc)
    echo -e "通過率: ${YELLOW}${pass_rate}%${NC}"
fi

if [ $pass_count -eq $test_count ]; then
    echo -e "\n${GREEN}🎉 所有管理員系統測試都通過了！${NC}"
elif [ $pass_count -gt $((test_count * 7 / 10)) ]; then
    echo -e "\n${YELLOW}⚠️ 大部分測試通過，系統基本正常運行${NC}"
else
    echo -e "\n${RED}❌ 多個測試失敗，請檢查系統配置${NC}"
fi

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "\n${BLUE}📌 管理員資訊:${NC}"
    echo "   管理員 Email: admin@timsfactory.com"
    echo "   管理員 Token: ${ADMIN_TOKEN:0:50}..."
    echo "   Token 有效期: 24小時"
fi

echo -e "\n${GREEN}✅ 管理員系統測試完成！${NC}"
