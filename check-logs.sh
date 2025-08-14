#!/bin/bash

# 檢查 VM 上的服務狀態和日誌
echo "=== 檢查時間: $(date) ==="
echo ""

echo "=== VM 服務狀態 ==="
gcloud compute ssh tim-web-dev --zone=asia-east1-c --command="pm2 status" 2>/dev/null || echo "無法獲取 PM2 狀態"

echo ""
echo "=== Backend 日誌 (最新 10 行) ==="
gcloud compute ssh tim-web-dev --zone=asia-east1-c --command="pm2 logs medusa-backend --lines 10 --nostream" 2>/dev/null || echo "無法獲取 Backend 日誌"

echo ""
echo "=== Frontend 日誌 (最新 10 行) ==="
gcloud compute ssh tim-web-dev --zone=asia-east1-c --command="pm2 logs next-frontend --lines 10 --nostream" 2>/dev/null || echo "無法獲取 Frontend 日誌"

echo ""
echo "=== 直接檢查進程 ==="
gcloud compute ssh tim-web-dev --zone=asia-east1-c --command="ps aux | grep -E '(yarn|node|next)' | grep -v grep" 2>/dev/null || echo "無法獲取進程資訊"

echo ""
echo "=== 檢查端口 ==="
gcloud compute ssh tim-web-dev --zone=asia-east1-c --command="netstat -tlnp | grep -E ':(3000|9000)'" 2>/dev/null || echo "無法獲取端口資訊"
