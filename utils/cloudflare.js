import axios from 'axios';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env' });
}

const apiToken = process.env.Cloudflare_ApiToken;
const zoneId = process.env.Cloudflare_ZoneId;

export const fetchNetworkStatsData = async (startDate, endDate) => {
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
                          cachedRequests
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

export const fetchCountryStatsData = async (startDate, endDate) => {
    const query = `
      {
          viewer {
              zones(filter: {zoneTag: "${zoneId}"}) {
                  httpRequests1dGroups(filter: {date_gt: "${startDate}", date_lt: "${endDate}"} limit: 10000) {
                      sum {
                          requests
                          bytes
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