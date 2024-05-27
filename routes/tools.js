import express from 'express';
var router = express.Router();

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

const github_entry = 'https://github.com/';

router.get('/gh', async (req, res) => {

    let gitUrl = req.query.url;
    let cdnUrl = '';

    if (gitUrl === undefined || gitUrl === '') {
        res.status(400).send({result:false, cdn_url: cdnUrl});
        return;
    }

    console.log(gitUrl);

    if (!gitUrl.startsWith(github_entry)) {
        res.status(400).send({result:false, cdn_url: cdnUrl});
        return;
    }
    
    /// remove github entry
    gitUrl = gitUrl.replace(github_entry, "");
    console.log(gitUrl);

    /// split
    let splitted = gitUrl.split('/');
    console.log(splitted);

    /// check url again
    if (splitted.length < 5) {
        res.status(400).send({result:false, cdn_url: cdnUrl});
        return;
    }

    /// get version
    let version = splitted[3];
    if (version === 'main') version = '';

    splitted.slice(2, 2);

    console.log(splitted);


    cdnUrl = `${process.env.CDN_BASE_URL}/${splitted[0]}/${splitted[1]}/${version}/`

    res.send('welcome');
})


export default router;