import express from 'express';
var router = express.Router();

import algoliasearch from 'algoliasearch';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

console.log(process.env.ALGOLIA_APP_ID);
console.log(process.env.ALGOLIA_API_KEY);

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

router.get('/', async (req, res) => {
    const searchText = req.query.search;
    console.log(searchText)
    if (searchText === undefined || searchText === '') {
        res.status(400).send("Bad Request!");
        return;
    }

    try {
        const index = client.initIndex('npm-search');
        const data = await index.search(searchText);
        console.log(data);
        res.json(data);
      } catch (error) {
        res.json({ error: error.message });
      }
})

router.get('/:package', async (req, res) => {
    const pkgName = req.params.package;
    if (pkgName === undefined || pkgName === '') {
        res.status(400).send("Bad Request!");
        return;
    }

    res.send(pkgName);
})


export default router;
