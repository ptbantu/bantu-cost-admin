# 部署成功 ✓

## 部署信息

- **域名**: https://admin.oabantuqifu.com
- **容器名**: bantu-cost-admin
- **网络**: bantuqifu-sales-hub_bantuqifu-network
- **SSL 证书**: Let's Encrypt
- **证书有效期**: 2026-06-15 (90天)

## 服务状态

✓ 应用容器运行正常
✓ SSL 证书已生成并配置
✓ Nginx 反向代理已配置
✓ HTTPS 访问正常

## 访问地址

https://admin.oabantuqifu.com

## 证书文件位置

- 证书: `/root/bantuqifu-sales-hub/nginx/ssl/admin/fullchain.pem`
- 私钥: `/root/bantuqifu-sales-hub/nginx/ssl/admin/privkey.pem`
- Let's Encrypt 原始文件: `/root/bantuqifu-sales-hub/nginx/letsencrypt/`

## 常用管理命令

```bash
# 查看应用日志
docker logs -f bantu-cost-admin

# 重启应用
cd /root/bantu-cost-admin
docker-compose restart

# 重新构建
docker-compose up -d --build

# 重载 nginx
docker exec bantuqifu-nginx nginx -s reload

# 查看证书信息
openssl x509 -in /root/bantuqifu-sales-hub/nginx/ssl/admin/fullchain.pem -text -noout
```

## SSL 证书续期

证书将在 90 天后过期，需要续期。可以使用以下命令手动续期：

```bash
cd /root/bantu-cost-admin
./generate-ssl-v2.sh
```

或设置自动续期（推荐）：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每月1号凌晨2点自动续期）
0 2 1 * * cd /root/bantu-cost-admin && ./generate-ssl-v2.sh >> /var/log/ssl-renew-admin.log 2>&1
```

## 网络架构

```
Internet (HTTPS)
    ↓
nginx (bantuqifu-nginx) :443
    ├── sales.oabantuqifu.com → nextjs:3000
    ├── visa.oabantuqifu.com → visa-service
    └── admin.oabantuqifu.com → bantu-cost-admin:3000 ✓
```

## 部署时间

2026-03-17 19:38 UTC
