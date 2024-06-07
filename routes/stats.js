import express from 'express';
var router = express.Router();
import request from '../utils/request.js';

import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';
import * as CONST from '../utils/const.js';

router.get('/periods', async (req, res) => {
    /// if already exist in cache, send it
    const cacheData = await GetContentFromRedis(req.originalUrl);
    if (cacheData != null) {
        console.log('loading from redis', req.originalUrl);
        res.send(cacheData);
        return;
    }

    // fetch
    const url = `https://data.jsdelivr.com/v1/stats/periods`;

    try {
        const { data } = await request.get(url);
        const periodList = data.map(item => {
            return {period: item.period, periodType: item.periodType};
        });
        const respData = { success: true, data: periodList };
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH)
        res.send(respData);
        // save to redis

    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

router.get('/npm/*', async (req, res) => {

    /// if already exist in cache, send it
    const cacheData = await GetContentFromRedis(req.originalUrl);
    if (cacheData != null) {
        console.log('loading from redis', req.originalUrl);
        res.send(cacheData);
        return;
    }

    console.log('fetching overall stats data', req.originalUrl);

    const pkg = req.params[0];
    const period = req.query.period || 'month';

    console.log(pkg, period);

    // fetch
    const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}?period=${period}`;
    try {
        const { data } = await request.get(url);
        const respData = {success: true, hits: data.hits, bandwidth: data.bandwidth};
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_DAY);
        res.send(respData);
        // save to redis

    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

router.get('/packages/npm/:package/versions', async (req, res) => {
    
    /// if already exist in cache, send it
    const cacheData = await GetContentFromRedis(req.originalUrl);
    if (cacheData != null) {
        console.log('loading from redis', req.originalUrl);
        res.send(cacheData);
        return;
    }

    const pkg = req.params.package;
    var period = req.query.period;
    var limit = req.query.limit;
    var page = req.query.page;
    var by = req.query.by;

    const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}/versions?period=${period}&by=${by}&limit=${limit}&page=${page}`;

    try {
        const { data } = await request.get(url);
        const data1 = data.map(item=>{
            return {version: item.version, hits: item.hits, bandwidth: item.bandwidth};
        });
        const respData = { success: true, data: data1 }
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH);
        res.send(respData);

    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

router.get('/packages/npm/*/files', async (req, res) => {

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
        res.send({success: false, status:400});
    }
    var pkg, version;
    version = paramsplit[paramsplit.length-1];
    pkg = params.replace(`@${version}`, "");
    var period = req.query.period;
    var limit = req.query.limit;
    var page = req.query.page;
    var by = req.query.by;

    const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}@${version}/files?period=${period}&by=${by}&limit=${limit}&page=${page}`;

    try {
        const { data } = await request.get(url);
        const data1 = data.map(item=>{
            return {name: item.name,  hits: item.hits.total, bandwidth: item.bandwidth.total};
        });
        const respData = { success: true, data: data1 }
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH);
        res.send(respData);
        // save to redis

    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

export default router;