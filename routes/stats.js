import express from 'express';
var router = express.Router();
import request from '../utils/request.js';
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env' });
}

import { GetContentFromRedis, SaveContentToRedis } from '../db/redis.js';
import * as CONST from '../utils/const.js';
import { getDateString, getMonthDayString } from '../utils/datetime.js';


const apiToken = process.env.Cloudflare_ApiToken;
const zoneId = process.env.Cloudflare_ZoneId;


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

  console.log(pkg, period);

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

router.get('/packages/npm/:package/versions', async (req, res) => {

  /// if already exist in cache, send it
  const cacheData = await GetContentFromRedis(req.originalUrl);
  if (cacheData != null) {
    console.log('loading from redis', req.originalUrl);
    res.send(cacheData);
    return;
  }

  const pkg = req.params.package;
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

const fetchAnalyticsData = async (startDate, endDate) => {
  const query = `
    {
        viewer {
            zones(filter: {zoneTag: "${zoneId}"}) {
                httpRequests1dGroups(filter: {date_gt: "${startDate}", date_lt: "${endDate}"} limit: 10000 orderBy: [date_ASC]) {
                    dimensions {
                        date
                    }
                    sum {
                        bytes
                        requests
                        pageViews
                        cachedBytes
                        cachedRequests
                        browserMap {
                            pageViews
                            uaBrowserFamily
                        }
                        countryMap {
                            bytes
                            clientCountryName
                            requests
                        }
                    }
                }
            }
        }
    }`;

  try {
    const response = await axios.post('https://api.cloudflare.com/client/v4/graphql',
      {
        query: query
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });

    return response.data.data.viewer.zones[0].httpRequests1dGroups;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

const aggregateData = (data) => {
  const countryData = {};
  const browserData = {};
  let totalRequests = 0;
  let totalBytes = 0;

  data.forEach(item => {
    item.sum.countryMap.forEach(country => {
      if (!countryData[country.clientCountryName]) {
        countryData[country.clientCountryName] = { requests: 0, bytes: 0 };
      }
      countryData[country.clientCountryName].requests += country.requests;
      countryData[country.clientCountryName].bytes += country.bytes;
    });

    item.sum.browserMap.forEach(browser => {
      if (!browserData[browser.uaBrowserFamily]) {
        browserData[browser.uaBrowserFamily] = { pageViews: 0 };
      }
      browserData[browser.uaBrowserFamily].pageViews += browser.pageViews;
    });

    totalRequests += item.sum.requests;
    totalBytes += item.sum.bytes;
  });

  return {
    countryData,
    browserData,
    total: {
      requests: totalRequests,
      bytes: totalBytes
    }
  };
};

router.get('/cdn/cloudflare', async (req, res) => {
  console.log('fetching from cloudflare');

  console.log('getting duration');

  const period = req.query.period;
  var date = new Date();
  var startDate;
  var endDate = getDateString();

  console.log('period', period);

  if (period === 'quarter') {
    let dateStart = new Date();
    dateStart.setMonth(date.getMonth() - 3);
    startDate = getDateString(dateStart);
  } else if (period === 'year') {
    let dateStart = new Date();
    dateStart.setMonth(date.getMonth() - 12);
    startDate = getDateString(dateStart);
  } else if (period.split('-').length == 2) {
    const [year, month] = period.split('-');
    console.log(year, month);
    if (month == 'Q1') {
      startDate = `${year}-01-01`;
      endDate = `${year}-03-31`;
    } else if (month == 'Q2') {
      startDate = `${year}-04-01`;
      endDate = `${year}-06-30`;
    } else if (month == 'Q3') {
      startDate = `${year}-07-01`;
      endDate = `${year}-09-30`;
    } else if (month == 'Q4') {
      startDate = `${year}-10-01`;
      endDate = `${year}-12-31`;
    } else if (parseInt(month) > 0 && parseInt(month) <= 12) {
      startDate = `${year}-${month}-01`;
      const last_date = new Date(year, month, 0).getDate();
      endDate = year + '-' + month + '-' + last_date;
    } else {
      let dateStart = new Date();
      dateStart.setMonth(date.getMonth() - 1);
      startDate = getDateString(dateStart)
    }
  } else {
    let dateStart = new Date();
    dateStart.setMonth(date.getMonth() - 1);
    startDate = getDateString(dateStart)
  }

  console.log('start_date:', startDate);
  console.log('end_date', endDate);

  console.log('trying to fetch data from api.cloudflare');

  try {
    const data = await fetchAnalyticsData(startDate, endDate);
    const aggregatedData = aggregateData(data);
    res.json(aggregatedData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
})

export default router;