import OSS from 'ali-oss';

export function createOssClient() {
  return new OSS({
    region: process.env.OSS_ENDPOINT?.replace('https://', '').split('.')[0] ?? 'oss-ap-southeast-5',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.OSS_BUCKET_NAME!,
    endpoint: process.env.OSS_ENDPOINT,
  });
}

export async function uploadToOss(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const client = createOssClient();
  const key = `reconciliation/${Date.now()}_${filename}`;
  await client.put(key, buffer, { headers: { 'Content-Type': contentType } });
  return `https://${process.env.OSS_BUCKET_NAME}.${process.env.OSS_ENDPOINT}/${key}`;
}
