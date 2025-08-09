#!/bin/bash

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:9000"

echo -e "${BLUE}🔧 使用 Medusa 原生管理員認證系統測試${NC}"
echo "======================================="
echo ""

# 使用 .env 中的預設管理員帳號
ADMIN_EMAIL="admin@medusa-test.com"
ADMIN_PASSWORD="supersecret"

echo -e "${YELLOW}🔑 步驟 1: 管理員登入 (Medusa 原生)${NC}"

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

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ 無法獲取認證 token，嘗試創建管理員用戶...${NC}"
    
    # 嘗試註冊管理員
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/user/emailpass/register" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\"
      }")
    
    echo "註冊回應: $REGISTER_RESPONSE"
    
    # 重新登入
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/user/emailpass" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\"
      }")
    
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')
fi

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ 認證成功，Token: ${TOKEN:0:20}...${NC}"
else
    echo -e "${RED}❌ 認證失敗，無法繼續測試${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔑 步驟 2: 測試聯盟管理員端點${NC}"

# 測試管理員聯盟端點
echo ""
echo -e "${BLUE}📋 測試: 獲取夥伴列表${NC}"
PARTNERS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/affiliate/partners" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "夥伴列表回應: $PARTNERS_RESPONSE"

echo ""
echo -e "${BLUE}💰 測試: 獲取佣金列表${NC}"
COMMISSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/affiliate/commissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "佣金列表回應: $COMMISSIONS_RESPONSE"

echo ""
echo -e "${BLUE}📊 測試: 獲取統計數據${NC}"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/affiliate/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "統計數據回應: $STATS_RESPONSE"

echo ""
echo -e "${GREEN}✅ 測試完成！${NC}"
