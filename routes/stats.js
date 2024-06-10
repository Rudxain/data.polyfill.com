import express from 'express';
import axios from 'axios';
var router = express.Router();
import request from '../utils/request.js';

import { fetchNetworkStatsData, fetchCountryStatsData } from '../utils/cloudflare.js';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env' });
}

import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';
import * as CONST from '../utils/const.js';
import { GetPrevStartEndDatesFromPeriod, GetStartEndDatesFromPeriod } from '../utils/period.js';


const apiToken = process.env.Cloudflare_ApiToken;
const zoneId = process.env.Cloudflare_ZoneId;

/// stats period
router.get('/periods', async (req, res) => {
  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  // fetch
  const url = `https://data.jsdelivr.com/v1/stats/periods`;

  try {
    const { data } = await request.get(url);
    const periodList = data.map(item => {
      return { period: item.period, periodType: item.periodType };
    });
    const respData = { success: true, data: periodList };
    await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH)
    res.send(respData);
    // save to redis

  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
})

router.get('/npm/*', async (req, res) => {

  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  console.log('fetching overall stats data', req.originalUrl);

  const pkg = req.params[0];
  const period = req.query.period || 'month';

  // fetch
  const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}?period=${period}`;
  try {
    const { data } = await request.get(url);
    const respData = { success: true, hits: data.hits, bandwidth: data.bandwidth };
    await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_DAY);
    res.send(respData);
    // save to redis

  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
})

/// get top package list
router.get('/packages', async (req, res) => {
  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  const qtype = req.query.type || 'npm';
  const period = req.query.month || 'month';
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  const url = `https://data.jsdelivr.com/v1/stats/packages?type=${qtype}&period=${period}&limit=${limit}&page=${page}`;
  try {
    const { data } = await request.get(url);
    console.log(data);
    const data2 = data.map(item=>{return {type: item.type, name: item.name, hits: item.hits, bandwidth: item.bandwidth, prev: item.prev}});
    const respData = { success: true, data: data2 };
    await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_WEEK);
    res.send(respData);
  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }

})

/// get top version list of a package
router.get('/packages/npm/*/versions', async (req, res) => {

  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  const pkg = req.params[0];
  var period = req.query.period;
  var limit = req.query.limit;
  var page = req.query.page;
  var by = req.query.by;

  const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}/versions?period=${period}&by=${by}&limit=${limit}&page=${page}`;

  try {
    const { data } = await request.get(url);
    const data1 = data.map(item => {
      return { version: item.version, hits: item.hits, bandwidth: item.bandwidth };
    });
    const respData = { success: true, data: data1 }
    await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH);
    res.send(respData);

  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
})

/// get top file list of a package & version
router.get('/packages/npm/*/files', async (req, res) => {

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
  var period = req.query.period;
  var limit = req.query.limit;
  var page = req.query.page;
  var by = req.query.by;

  const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${pkg}@${version}/files?period=${period}&by=${by}&limit=${limit}&page=${page}`;

  try {
    const { data } = await request.get(url);
    const data1 = data.map(item => {
      return { name: item.name, hits: item.hits.total, bandwidth: item.bandwidth.total };
    });
    const respData = { success: true, data: data1 }
    await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_MONTH);
    res.send(respData);
  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
})

///////////// Network stats
router.get('/network', async (req, res) => {

  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  const period = req.query.period;

  const { prevDate, startDate, endDate } = GetPrevStartEndDatesFromPeriod(period);

  if (process.env.NODE_ENV == 'development') {
    let prev_data = [
      {
        "dimensions": { "date": "2024-05-09" },
        "sum": {
          "bytes": 1674845152344,
          "cachedBytes": 1797055085201,
          "cachedRequests": 1284330958,
          "requests": 1201878923
        }
      },
      {
        "dimensions": { "date": "2024-05-10" },
        "sum": {
          "bytes": 1681566302489,
          "cachedBytes": 1803440443780,
          "cachedRequests": 1278366717,
          "requests": 1295266753
        }
      }
    ];

    let current_data = [
      {
        "dimensions": { "date": "2024-05-09" },
        "sum": {
          "bytes": 1874845152344,
          "cachedBytes": 1797055085201,
          "cachedRequests": 1284330958,
          "requests": 1301878923
        }
      },
      {
        "dimensions": { "date": "2024-05-10" },
        "sum": {
          "bytes": 1881566302489,
          "cachedBytes": 1803440443780,
          "cachedRequests": 1278366717,
          "requests": 1295266753
        }
      }
    ];

    let result = {
      bandwidth: { total: 0, dates: {}, prev: { total: 0 } },
      hits: { total: 0, dates: {}, hitrates: 0, prev: { total: 0 } },
    };

    let totalPrevRequests = 0;
    let totalPrevBandwidth = 0
    let totalCachedRequests = 0;

    prev_data.forEach(data => {
      totalPrevRequests += data.sum.requests;
      totalPrevBandwidth += data.sum.bytes;
    })

    result.hits.prev.total = totalPrevRequests;
    result.bandwidth.prev.total = totalPrevBandwidth;

    current_data.forEach(data => {
      let date = data.dimensions.date;
      result.hits.dates[date] = data.sum.requests;
      result.hits.total += data.sum.requests;
      result.bandwidth.dates[date] = data.sum.bytes;
      result.bandwidth.total += data.sum.bytes;
      totalCachedRequests += data.sum.cachedRequests;
    });

    if (result.hits.total == 0) {
      result.hitrates = 0
    } else {
      result.hits.hitrates = Math.round(10000 * totalCachedRequests / result.hits.total) / 100;
    }

    res.json({ success: true, data: result });

  } else {
    try {
      const prev_data = await fetchNetworkStatsData(prevDate, startDate);
      const current_data = await fetchNetworkStatsData(startDate, endDate);

      let result = {
        bandwidth: { total: 0, dates: {}, prev: { total: 0 } },
        hits: { total: 0, dates: {}, hitrates: 0, prev: { total: 0 } },

      };

      let totalPrevRequests = 0;
      let totalPrevBandwidth = 0
      let totalCachedRequests = 0;

      prev_data.forEach(data => {
        totalPrevRequests += data.sum.requests;
        totalPrevBandwidth += data.sum.bytes;
      })

      result.hits.prev.total = totalPrevRequests;
      result.bandwidth.prev.total = totalPrevBandwidth;

      current_data.forEach(data => {
        let date = data.dimensions.date;
        result.hits.dates[date] = data.sum.requests;
        result.hits.total += data.sum.requests;
        result.bandwidth.dates[date] = data.sum.bytes;
        result.bandwidth.total += data.sum.bytes;
        totalCachedRequests += data.sum.cachedRequests;
      });

      if (result.hits.total == 0) {
        result.hitrates = 0
      } else {
        result.hits.hitrates = Math.round(10000 * totalCachedRequests / result.hits.total) / 100;
      }

      const respData = { success: true, data: result }
      await SaveContentToRedis(req.originalUrl, JSON.stringify(respData), CONST.EXPIRE_DAY);
      res.json(respData);

    } catch (error) {
      res.json({ success: false, error: error });
    }
  }
})


///////////// Country stats

router.get('/network/countries', async (req, res) => {

  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  const period = req.query.period;

  const { startDate, endDate } = GetStartEndDatesFromPeriod(period);

  if (process.env.NODE_ENV == 'development') {

    let data = [
      {
        "sum": {
          "bytes": 56800403163083,
          "countryMap": [
            {
              "bytes": 2937890468,
              "clientCountryName": "AD",
              "requests": 3701796
            },
            {
              "bytes": 62531856589,
              "clientCountryName": "AE",
              "requests": 62565196
            }
          ],
          "requests": 38615714463
        }
      }
    ];

    if (data.length == 1 && data[0] !== {}) {
      let result = {
        hits: { total: 0, countries: [] },
        bandwidth: { total: 0, countries: [] }
      };

      /// hits
      result.hits.total = data[0].sum.requests;
      data[0].sum.countryMap.forEach(country => {
        result.hits.countries.push({ code: country.clientCountryName, total: country.requests });
      });

      /// bandwidth
      result.bandwidth.total = data[0].sum.bytes;
      data[0].sum.countryMap.forEach(country => {
        result.bandwidth.countries.push({ code: country.clientCountryName, total: country.bytes });
      })

      res.json({ success: true, data: result });
    } else {
      res.send({ success: false, message: "not found" });
    }

  } else {
    try {
      const data = await fetchCountryStatsData(startDate, endDate);
      if (data.length == 1 && data[0] !== {}) {
        let result = {
          hits: { total: 0, countries: [] },
          bandwidth: { total: 0, countries: [] }
        };

        /// hits
        result.hits.total = data[0].sum.requests;
        data[0].sum.countryMap.forEach(country => {
          result.hits.countries.push({ code: country.clientCountryName, total: country.requests });
        });

        /// bandwidth
        result.bandwidth.total = data[0].sum.bytes;
        data[0].sum.countryMap.forEach(country => {
          result.bandwidth.countries.push({ code: country.clientCountryName, total: country.bytes });
        })

        res.json({ success: true, data: result });
      } else {
        res.send({ success: false, message: "not found" });
      }
    } catch (error) {
      res.json({ success: false, error: error });
    }
  }
})

export default router;