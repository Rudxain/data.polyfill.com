import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import useragent from 'express-useragent';
import cookieSession from 'cookie-session';

import routePackages from './routes/packages.js';
import routePackageNpm from './routes/package_npm.js';
import routeStats from './routes/stats.js';
import routeTools from './routes/tools.js';
import routeReadme from './routes/readme.js';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

//database
import './db/redis.js';

/// express
var app = express();
app.set('port', process.env.PORT || 8090);

// cors
const corsOptions = {
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// disable x-powered-by
app.disable('x-powered-by');

//user-agent
app.use(useragent.express());

// cookie-session
app.use(
    cookieSession({
        name: 'session',
        keys: ['cookie:data.polyfill.com'],
        maxAge: 10 * 60 * 60 * 1000,
    })
);

/// Routes
app.use('/packages', routePackages);
app.use('/package/npm', routePackageNpm);
app.use('/readme', routeReadme);
app.use('/stats', routeStats);
app.use('/tools', routeTools);

// 404
app.get('*', (req, res) => {
    res.status(400).send({ status: 400, message: 'Bad request' });
});


// start server
app.listen(app.get('port'), () => console.log(`Server running on port ${app.get('port')}`))