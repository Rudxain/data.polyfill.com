import express from 'express';
var router = express.Router();
import algoliasearch from 'algoliasearch';
import request from '../utils/request.js';
import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';
import * as CONST from '../utils/const.js';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

router.get('/', (req, res) => {
    res.send({ status: 400, message: "Bad Request!" });
})

router.get('/*/overview', async (req, res) => {
    const project = req.params[0];
    console.log(project);
    let response = {};

    /// if already exist in cache, send it
    const cacheData = await GetContentFromRedis(req.originalUrl);
    if (cacheData != null) {
        console.log('loading from redis', req.originalUrl);
        res.send(cacheData);
        return;
    }

    console.log('fetching npm package overview for', project);

    try {
        const index = client.initIndex('npm-search');

        const searchOptions = {
            hitsPerPage: 1,
            page: 0,
            attributesToRetrieve: ["deprecated", "description", "githubRepo", "homepage", "keywords", "license", "name", "owner", "version", "popular", "moduleTypes", "styleTypes", "jsDelivrHits", "downloadsLast30Days"]
        };

        const { hits } = await index.search(project, searchOptions);
        if (hits.length > 0) {
            const item = hits[0];
            response = {
                ...response,
                name: item.name,
                author: item.owner.name,
                avatar: item.owner.avatar,
                version: item.version,
                description: item.description,
                popular: item.popular,
                moduleTypes: item.moduleTypes,
                styleTypes: item.styleTypes,
                license: item.license,
                github_url: item.owner.link,
                homepage: item.homepage,
                downloads: item.jsDelivrHits,
                keywords: item.keywords,
            }

        } else {
            res.json({ status: 404, success: false, data: [] })
            return;
        }
    } catch (error) {
        res.send({ status: 400, success: false, error: error.message });
        return;
    }

    const respData = { status: 200, success: true, data: response };
    await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH)
    res.json(respData);
})

/// get entrypoints
router.get('/*/entrypoints', async (req, res) => {

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


    /// fetch
    const url = `https://data.jsdelivr.com/v1/packages/npm/${pkg}@${version}/entrypoints`;
    try {
        const { data } = await request.get(url);
        const respData = { success: true, data: data };
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_YEAR)
        res.json(respData);
    } catch (error) {
        res.send({ success: false });
    }
})

/// get versions
router.get('/*/versions', async (req, res) => {

    /// if already exist in cache, send it
    const cacheData = await GetContentFromRedis(req.originalUrl);
    if (cacheData != null) {
        console.log('loading from redis', req.originalUrl);
        res.send(cacheData);
        return;
    }

    const pkg = req.params[0];
    /// else
    const url = `https://data.jsdelivr.com/v1/packages/npm/${pkg}`;
    try {
        const { data } = await request.get(url);
        const versions = data.versions.map(item => item.version);
        const respData = { success: true, versions: versions };
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH)
        res.send(respData);
    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

/// get file list of a package/version
router.get('/*/files', async (req, res) => {

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

    /// else
    const url = `https://data.jsdelivr.com/v1/packages/npm/${pkg}@${version}`;
    try {
        const { data } = await request.get(url);
        const respData = { success: true, data: data };
        await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_YEAR)
        res.send(respData);
    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

export default router;
