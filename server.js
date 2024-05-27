import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import useragent from 'express-useragent';
import cookieSession from 'cookie-session';

import routePackages from './routes/packages.js'

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

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

// 404
app.get('*', (req, res) => {
    res.status(400).send({ status: 400, message: 'Bad request' });
});


// start server
app.listen(app.get('port'), () => console.log(`Server running on port ${app.get('port')}`))