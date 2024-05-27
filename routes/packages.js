import express from 'express';
var router = express.Router();

import algoliasearch from 'algoliasearch';

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
        const { hits } = await index.search(searchText);
        res.json({ hits });
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
