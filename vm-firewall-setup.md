# GCP 防火牆設置指南

## 創建防火牆規則

### 方法 1: 使用 gcloud CLI
```bash
# PostgreSQL 防火牆規則
gcloud compute firewall-rules create allow-postgresql \
    --allow tcp:5432 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow PostgreSQL connections"

# Redis 防火牆規則  
gcloud compute firewall-rules create allow-redis \
    --allow tcp:6379 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow Redis connections"
```

### 方法 2: 使用 Google Cloud Console
1. 前往 VPC network > Firewall
2. 點擊 "CREATE FIREWALL RULE"
3. 創建 PostgreSQL 規則：
   - Name: allow-postgresql
   - Direction: Ingress
   - Action: Allow
   - Targets: All instances in the network
   - Source IP ranges: 0.0.0.0/0
   - Protocols and ports: TCP, Port 5432

4. 創建 Redis 規則：
   - Name: allow-redis
   - Direction: Ingress
   - Action: Allow
   - Targets: All instances in the network
   - Source IP ranges: 0.0.0.0/0
   - Protocols and ports: TCP, Port 6379

## 安全建議
- 限制 source IP ranges 只允許您的 IP 地址
- 為 Redis 設置密碼
- 使用 SSL/TLS 加密連接
