# Docker 部署指南

## 架构说明

本项目与 `bantuqifu-sales-hub` 共享同一个 nginx 反向代理，通过域名 `admin.oabantuqifu.com` 访问。

## 部署步骤

### 1. 确保 DNS 配置正确

确保域名 `admin.oabantuqifu.com` 的 A 记录指向服务器 IP。

### 2. 启动 bantuqifu-sales-hub 的 nginx（如果还未启动）

```bash
cd /root/bantuqifu-sales-hub
docker-compose up -d nginx
```

### 3. 构建并启动 bantu-cost-admin

```bash
cd /root/bantu-cost-admin
docker-compose up -d --build
```

### 4. 生成 SSL 证书

**重要**: 修改 `generate-ssl.sh` 中的邮箱地址，然后运行：

```bash
./generate-ssl.sh
```

证书将保存在 `/root/bantuqifu-sales-hub/nginx/ssl/admin/` 目录。

### 5. 重启 nginx 使配置生效

```bash
cd /root/bantuqifu-sales-hub
docker-compose restart nginx
```

### 6. 验证部署

访问 `https://admin.oabantuqifu.com` 检查网站是否正常运行。

## 常用命令

```bash
# 查看日志
docker logs -f bantu-cost-admin

# 重启服务
docker-compose restart bantu-cost-admin

# 停止服务
docker-compose down

# 重新构建
docker-compose up -d --build
```

## SSL 证书续期

Let's Encrypt 证书有效期为 90 天，建议设置自动续期：

```bash
# 添加到 crontab
0 0 1 * * /root/bantu-cost-admin/generate-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

## 网络架构

```
Internet
    ↓
nginx (bantuqifu-nginx) :80, :443
    ├── sales.oabantuqifu.com → nextjs:3000 (sales-hub)
    ├── visa.oabantuqifu.com → visa-service
    └── admin.oabantuqifu.com → bantu-cost-admin:3000
```

所有服务通过 `bantuqifu-network` 网络互联。
