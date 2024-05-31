import express from 'express';
var router = express.Router();
import algoliasearch from 'algoliasearch';

//import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';

/// temp json
import searchdata from '../fake/algolia_npm.json' assert { type: 'json' };

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

router.get('/:package/overview', async (req, res) => {
    const project = req.params.package;

    let response = {};

    console.log('fetching npm package overview for', project);

    // algolia search
    if (process.env.NODE_ENV == 'development') {
        const { hits } = searchdata;
        res.json(hits);
    } else {
        try {
            const index = client.initIndex('npm-search');
            
            const searchOptions = {
                hitsPerPage: 1,
                page: 0,
                attributesToRetrieve: ["deprecated", "description", "githubRepo", "homepage", "keywords", "license", "name", "owner", "version", "popular", "moduleTypes", "styleTypes", "jsDelivrHits", "downloadsLast30Days"]
            };

            const { hits } = await index.search(searchText, searchOptions);
            res.json(hits);
            return;
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
                    keywords: item.keywords,
                    github_url: item.owner.link,
                    homepage: item.homepage,
                    downloads: item.jsDelivrHits,
                }
                res.json({ result: true, data: data, page: page, totalPages: nbPages });
            } else {
                res.json({ result: false, data: [] })
            }
        } catch (error) {
            res.json({ error: error.message });
        }
    }



    // name, owner, popular, moduleTypes, styleTypes, description, version, license, homepage, github_url, npm_url, download_url,


    // get package.json from cdn


    res.send({ status: 200 });
    return;
})

export default router;
