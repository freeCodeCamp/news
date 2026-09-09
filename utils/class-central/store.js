import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

import { config } from '../../config/index.js';

const { doObjectStorageKeyId, doObjectStorageSecret } = config;

const SPACES_BUCKET = 'freecodecamp-news-class-central';
const SPACES_REGION = 'nyc3';
const CACHE_KEY = 'related-courses-cache.json';

let client;
const getClient = () => {
  if (!client) {
    client = new S3Client({
      endpoint: `https://${SPACES_REGION}.digitaloceanspaces.com`,
      region: 'us-east-1',
      forcePathStyle: false,
      credentials: {
        accessKeyId: doObjectStorageKeyId,
        secretAccessKey: doObjectStorageSecret
      }
    });
  }

  return client;
};

// The cache is fetched and written to object storage by a separate service;
// the build only reads it here. Returns an empty cache if the object doesn't
// exist yet (first run).
export const loadCache = async () => {
  try {
    const res = await getClient().send(
      new GetObjectCommand({
        Bucket: SPACES_BUCKET,
        Key: CACHE_KEY
      })
    );
    const body = await res.Body.transformToString();

    return JSON.parse(body);
  } catch (error) {
    if (error.name === 'NoSuchKey') return { posts: {} };
    throw error;
  }
};
