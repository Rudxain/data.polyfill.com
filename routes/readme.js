import express from 'express';
var router = express.Router();
import request from '../utils/request.js';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

/// get npm package readme
router.get('/npm/:package/:version', async (req, res)=>{
    
    const pkg = req.params.package;
    const version = req.params.version;

    /// get redis

    /// else
    const url = `https://www.jsdelivr.com/readme/npm/${pkg}/${version}`;
    try {
        const {data} = await request.get(url);
        res.send({success: true, data: data});
        // save to redis

    } catch (error) {
        console.log(error);
        res.send({success: false});
    }
})

export default router;
