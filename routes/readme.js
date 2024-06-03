import express from 'express';
var router = express.Router();
import request from '../utils/request.js';
import fs from 'fs';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

/// get npm package readme
router.get('/npm/*', async (req, res) => {
    
    const params = req.params[0];
    const paramsplit = params.split("@");
    if (paramsplit.length < 2) {
        res.send({success: false, status:400});
    }
    var pkg, version;
    version = paramsplit[paramsplit.length-1];
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
            res.send({ success: true, data: data });
            // save to redis

        } catch (error) {
            console.log(error);
            res.send({ success: false });
        }
    }

    /// else

})

export default router;
