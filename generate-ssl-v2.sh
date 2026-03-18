#!/bin/bash

DOMAIN="admin.oabantuqifu.com"
EMAIL="admin@oabantuqifu.com"
NGINX_CONTAINER="bantuqifu-nginx"
CERTBOT_DIR="/root/bantuqifu-sales-hub/nginx/certbot"
LETSENCRYPT_DIR="/root/bantuqifu-sales-hub/nginx/letsencrypt"
SSL_DIR="/root/bantuqifu-sales-hub/nginx/ssl/admin"

echo "=== 为 ${DOMAIN} 生成 SSL 证书 ==="

# 创建目录
mkdir -p "${CERTBOT_DIR}"
mkdir -p "${LETSENCRYPT_DIR}"
mkdir -p "${SSL_DIR}"

# 检查 nginx 容器
if ! docker ps | grep -q "${NGINX_CONTAINER}"; then
    echo "错误: nginx 容器未运行"
    exit 1
fi

echo "申请证书..."

# 使用 certbot 生成证书，挂载 letsencrypt 目录
docker run --rm \
    --name certbot \
    -v "${CERTBOT_DIR}:/var/www/certbot:rw" \
    -v "${LETSENCRYPT_DIR}:/etc/letsencrypt:rw" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "${DOMAIN}"

if [ $? -eq 0 ]; then
    echo "✓ 证书申请成功"

    # 复制证书到 SSL 目录
    cp "${LETSENCRYPT_DIR}/live/${DOMAIN}/fullchain.pem" "${SSL_DIR}/"
    cp "${LETSENCRYPT_DIR}/live/${DOMAIN}/privkey.pem" "${SSL_DIR}/"

    if [ -f "${SSL_DIR}/fullchain.pem" ] && [ -f "${SSL_DIR}/privkey.pem" ]; then
        echo "✓ 证书文件已复制到 ${SSL_DIR}"

        # 测试并重载 nginx
        docker exec "${NGINX_CONTAINER}" nginx -t
        if [ $? -eq 0 ]; then
            docker exec "${NGINX_CONTAINER}" nginx -s reload
            echo "✓ Nginx 已重新加载"
            echo ""
            echo "=== 部署完成 ==="
            echo "访问: https://${DOMAIN}"
            echo "证书有效期至: 2026-06-15"
        else
            echo "✗ Nginx 配置测试失败"
            exit 1
        fi
    else
        echo "✗ 证书复制失败"
        exit 1
    fi
else
    echo "✗ 证书申请失败"
    exit 1
fi
