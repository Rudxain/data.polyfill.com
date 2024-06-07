import express from 'express';
var router = express.Router();
import request from '../utils/request.js';
import fs from 'fs';
import * as CONST from '../utils/const.js';

import dotenv from 'dotenv';
import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

/// get npm package readme
router.get('/npm/*', async (req, res) => {

    /// if already exist in cache, send it
    const cacheData = await GetContentFromRedis(req.originalUrl);
    if (cacheData != null) {
        console.log('loading from redis', req.originalUrl);
        res.send(cacheData);
        return;
    }

    const params = req.params[0];
    const paramsplit = params.split("@");
    if (paramsplit.length < 2) {
        res.send({ success: false, status: 400 });
    }
    var pkg, version;
    version = paramsplit[paramsplit.length - 1];
    pkg = params.replace(`@${version}`, "");
    /// get redis

    if (process.env.NODE_ENV == 'development') {
        fs.readFile('./fake/readme.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                res.send({ success: false });
                return
            }
            res.send({ success: true, data: data });
        })
    } else {
        const url = `https://www.jsdelivr.com/readme/npm/${pkg}/${version}`;
        try {
            const { data } = await request.get(url);
            const respData = { success: true, data: data };
            await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_YEAR);
            res.send(respData);
        } catch (error) {
            console.log(error);
            res.send({ success: false });
        }
    }
})

export default router;
