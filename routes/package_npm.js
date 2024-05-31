import express from 'express';
var router = express.Router();
import algoliasearch from 'algoliasearch';
import searchdata from '../fake/algoliasearch.json' assert { type: 'json' };

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

router.get('/', (req, res)=>{
    res.send({status: 400, message: "Bad Request!"});
})

router.get('/:package/overview', async (req, res)=>{
    const project = req.params.package;
    console.log('fetching npm package overview for', project);

    // get package.json from json


    res.send({status: 200});
    return;

    res.send({status: 404, message: "Not Found"});
})

export default router;
