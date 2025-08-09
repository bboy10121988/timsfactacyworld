#!/bin/bash

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:9000"

echo -e "${BLUE}🔧 聯盟行銷管理系統測試 - 使用正確的 Medusa 認證${NC}"
echo "======================================================"
echo ""

# 使用 .env 中的預設管理員帳號
ADMIN_EMAIL="admin@medusa-test.com"
ADMIN_PASSWORD="supersecret"

echo -e "${YELLOW}🔑 步驟 1: 管理員登入${NC}"

# 使用 Medusa 原生認證端點
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/user/emailpass" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "登入回應: $LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ 認證成功，Token: ${TOKEN:0:20}...${NC}"
else
    echo -e "${RED}❌ 認證失敗，無法繼續測試${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔑 步驟 2: 測試新的聯盟管理端點${NC}"

# 測試新的管理員聯盟端點（不會被 Medusa admin auth 攔截）
echo ""
echo -e "${BLUE}📋 測試: 獲取夥伴列表 (新端點)${NC}"
PARTNERS_RESPONSE=$(curl -s -X GET "$BASE_URL/affiliate-admin/partners" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "夥伴列表回應: $PARTNERS_RESPONSE"

echo ""
echo -e "${BLUE}📋 測試: 獲取夥伴列表 (帶分頁參數)${NC}"
PARTNERS_PAGINATED_RESPONSE=$(curl -s -X GET "$BASE_URL/affiliate-admin/partners?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "分頁夥伴列表回應: $PARTNERS_PAGINATED_RESPONSE"

echo ""
echo -e "${BLUE}📋 測試: 獲取待審核夥伴${NC}"
PENDING_PARTNERS_RESPONSE=$(curl -s -X GET "$BASE_URL/affiliate-admin/partners?status=pending" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "待審核夥伴回應: $PENDING_PARTNERS_RESPONSE"

echo ""
echo -e "${BLUE}🔒 測試: 無認證訪問 (預期失敗)${NC}"
NO_AUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/affiliate-admin/partners" \
  -H "Content-Type: application/json")
echo "無認證回應: $NO_AUTH_RESPONSE"

echo ""
echo -e "${GREEN}✅ 測試完成！${NC}"
