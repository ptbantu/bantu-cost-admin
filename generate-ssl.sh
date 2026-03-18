#!/bin/bash

# SSL 证书生成脚本 - admin.oabantuqifu.com
# 使用 Certbot 生成 Let's Encrypt 证书

DOMAIN="admin.oabantuqifu.com"
EMAIL="admin@oabantuqifu.com"
NGINX_CONTAINER="bantuqifu-nginx"
SSL_DIR="/root/bantuqifu-sales-hub/nginx/ssl/admin"
CERTBOT_DIR="/root/bantuqifu-sales-hub/nginx/certbot"

echo "=== 为 ${DOMAIN} 生成 SSL 证书 ==="

# 创建 SSL 目录
mkdir -p "${SSL_DIR}"
mkdir -p "${CERTBOT_DIR}"

# 检查 nginx 容器是否运行
if ! docker ps | grep -q "${NGINX_CONTAINER}"; then
    echo "错误: nginx 容器未运行，请先启动 docker-compose"
    exit 1
fi

echo "开始申请证书..."

# 使用 certbot 生成证书
docker run --rm \
    --name certbot \
    -v "${CERTBOT_DIR}:/var/www/certbot:rw" \
    -v "${SSL_DIR}:/etc/letsencrypt/live/${DOMAIN}:rw" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "${DOMAIN}"

# 检查证书是否生成成功
if [ $? -eq 0 ]; then
    echo "✓ 证书生成成功"

    # 检查证书文件
    if [ -f "${SSL_DIR}/fullchain.pem" ] && [ -f "${SSL_DIR}/privkey.pem" ]; then
        echo "✓ 证书文件已就位"
        echo "  - fullchain.pem: ${SSL_DIR}/fullchain.pem"
        echo "  - privkey.pem: ${SSL_DIR}/privkey.pem"

        # 重新加载 nginx 配置
        docker exec "${NGINX_CONTAINER}" nginx -t && \
        docker exec "${NGINX_CONTAINER}" nginx -s reload

        if [ $? -eq 0 ]; then
            echo "✓ Nginx 配置已重新加载"
            echo ""
            echo "=== 证书安装完成 ==="
            echo "域名: https://${DOMAIN}"
            echo "证书路径: ${SSL_DIR}"
            echo "证书有效期: 90 天"
        else
            echo "✗ Nginx 重新加载失败，请检查配置"
            exit 1
        fi
    else
        echo "✗ 证书文件未找到"
        echo "请检查 ${SSL_DIR} 目录"
        exit 1
    fi
else
    echo "✗ 证书生成失败"
    echo ""
    echo "可能的原因："
    echo "1. 域名 DNS 未正确指向服务器 IP"
    echo "2. 80 端口未开放或被占用"
    echo "3. nginx 配置中 .well-known/acme-challenge 路径配置错误"
    echo ""
    echo "请检查："
    echo "- DNS: dig ${DOMAIN}"
    echo "- 端口: netstat -tlnp | grep :80"
    echo "- 测试: curl http://${DOMAIN}/.well-known/acme-challenge/test"
    exit 1
fi
