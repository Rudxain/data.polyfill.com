import { Redis } from "ioredis";

import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

const redisConfigFile = {
    host: process.env.FILE_REDIS_HOST,
    port: process.env.FILE_REDIS_PORT,
    password: process.env.FILE_REDIS_PASS,
    db: '1',
};

const redisFile = new Redis(redisConfigFile);

redisFile.on('connect', () => {
    console.log('Connected to Redis File server');
});

redisFile.on('error', (err) => {
    console.error(`RedisFile connection error: ${err}`);
});

export const GetContentFromRedis = async (url) => {
    try {
        const content = await redisFile.get(url);
        return content;
    } catch (error) {
        return null;
    }
}

export const SaveContentToRedis = async (url, content) => {
    try {
        await redisFile.set(url, content);
        await redisFile.expire(url, 86400);
    } catch (error) {
        console.log("error while saving data to db", error);
    }
}