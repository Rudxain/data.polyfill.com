import express from 'express';
var router = express.Router();
import request from '../utils/request.js';

router.get('/periods', async (req, res) => {
    // get from redis

    // fetch
    const url = `https://data.jsdelivr.com/v1/stats/periods`;

    try {
        const { data } = await request.get(url);
        const periodList = data.map(item => {
            return {period: item.period, periodType: item.periodType};
        });
        res.send({ success: true, data: periodList });
        // save to redis

    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})

router.get('/npm/*', async (req, res) => {

    const pkg = req.params[0];
    const period = req.query.period || 'month';

    console.log(pkg, period);

    // load from redis

    // fetch
    const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}?period=${period}`;
    try {
        const { data } = await request.get(url);
        const respData = {hits: data.hits, bandwidth: data.bandwidth};
        res.send({ success: true, data: respData });
        // save to redis

    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
})


export default router;