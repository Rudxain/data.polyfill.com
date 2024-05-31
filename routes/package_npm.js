import express from 'express';
var router = express.Router();
import algoliasearch from 'algoliasearch';

//import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';

/// temp json
import overview_data from '../fake/algolia_npm_overview.json' assert { type: 'json' };

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
        console.log("development");
        response = {
            ...response,
            name: overview_data.name,
            author: overview_data.author,
            avatar: overview_data.avatar,
            version: overview_data.version,
            description: overview_data.description,
            popular: overview_data.popular,
            moduleTypes: overview_data.moduleTypes,
            styleTypes: overview_data.styleTypes,
            license: overview_data.license,
            github_url: overview_data.github_url,
            homepage: overview_data.homepage,
            downloads: overview_data.downloads,
        };
    } else {
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
                }
                
            } else {
                res.json({status: 404, result: false, data: [] })
                return;
            }
        } catch (error) {
            res.send({ status: 400, error: error.message });
            return;
        }
    }

    res.json({ status: 200, result: true, data: response });


    // name, owner, popular, moduleTypes, styleTypes, description, version, license, homepage, github_url, npm_url, download_url,


    // get package.json from cdn
})

export default router;
