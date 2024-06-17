import express from 'express';
var router = express.Router();

import request from '../utils/request.js';

import { google_hostes_libraries } from '../utils/google-hosted-libraries.js';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config({ path: '.env' });
}

const github_entry = 'https://github.com/';
const unpkg_base = 'https://unpkg.com/';
const google_base = 'https://ajax.googleapis.com/ajax/libs/';
const skypack_base = 'https://cdn.skypack.dev/';
const esmsh_base = 'https://esm.sh/';

router.get('/gh', async (req, res) => {

    let srcUrl = req.query.url;
    let cdnUrl = '';

    if (srcUrl === undefined || srcUrl === '') {
        res.send({ success: false });
        return;
    }

    if (!srcUrl.startsWith(github_entry)) {
        res.send({ success: false });
        return;
    }

    /// remove github entry
    srcUrl = srcUrl.replace(github_entry, "");

    /// split
    let splitted = srcUrl.split('/');

    /// check url again
    if (splitted.length < 5) {
        res.send({ success: false });
        return;
    }

    /// get version
    let version = splitted[3];
    if (version === 'main') version = '';

    const filePath = splitted.slice(4).join('/');

    cdnUrl = `${process.env.CDN_BASE_URL}/gh/${splitted[0]}/${splitted[1]}@${version}/${filePath}`;

    const respData = { success: true, url: cdnUrl };
    res.send(respData);
})

router.get('/unpkg', async (req, res) => {

    let srcUrl = req.query.url;
    let cdnUrl = '';

    if (srcUrl === undefined || srcUrl === '') {
        res.send({ success: false });
        return;
    }

    if (!srcUrl.startsWith(unpkg_base)) {
        res.send({ success: false });
        return;
    }

    /// remove github entry
    srcUrl = srcUrl.replace(unpkg_base, "");

    /// split

    let splitted = srcUrl.split('/');

    /// check url again
    if (splitted.length < 2) {
        res.send({ success: false });
        return;
    }

    const v2 = splitted.join('/');

    cdnUrl = `${process.env.CDN_BASE_URL}/npm/${v2}`;

    const respData = { success: true, url: cdnUrl };
    res.send(respData);
})


router.get('/google', async (req, res) => {

    let srcUrl = req.query.url;
    let cdnUrl = '';

    if (srcUrl === undefined || srcUrl === '') {
        res.send({ success: false });
        return;
    }

    if (!srcUrl.startsWith(google_base)) {
        res.send({ success: false });
        return;
    }

    /// remove github entry
    srcUrl = srcUrl.replace(google_base, "");

    /// split

    let splitted = srcUrl.split('/');

    /// check url again
    if (splitted.length < 2) {
        res.send({ success: false });
        return;
    }

    /// check if it is google hosted libraries
    const pkg = splitted[0];
    const version = splitted[1];
    const file = splitted.slice(2).join('/');

    const isGoogleHosted = google_hostes_libraries.some(lib => lib.name === pkg);
    if (isGoogleHosted === false) {
        res.send({ success: false });
        return;
    }

    const googleHostedObj = google_hostes_libraries.find(lib => lib.name === pkg);
    const isEntryValid = googleHostedObj.entrypoints.some(entry => entry.google === file);
    if (isEntryValid === false) {
        res.send({ success: false });
        return;
    }

    const googleEntry = googleHostedObj.entrypoints.find(entry => entry.google === file);

    const npm_package = googleHostedObj.npm_name;
    const npm_entrypoint = googleEntry.cdn;

    cdnUrl = `${process.env.CDN_BASE_URL}/npm/${npm_package}@${version}/${npm_entrypoint}`;

    const respData = { success: true, url: cdnUrl };
    res.send(respData);
})

router.get('/skypack', async (req, res) => {

    let srcUrl = req.query.url;
    let cdnUrl = '';

    if (srcUrl === undefined || srcUrl === '') {
        res.send({ success: false });
        return;
    }

    if (!srcUrl.startsWith(skypack_base)) {
        res.send({ success: false });
        return;
    }

    /// remove github entry
    srcUrl = srcUrl.replace(skypack_base, "");

    /// split

    let splitted = srcUrl.split('/');

    const v2 = splitted.join('/');

    cdnUrl = `${process.env.CDN_BASE_URL}/npm/${v2}/+esm`;

    const respData = { success: true, url: cdnUrl };
    res.send(respData);
})

router.get('/esmsh', async (req, res) => {

    let srcUrl = req.query.url;
    let cdnUrl = '';

    if (srcUrl === undefined || srcUrl === '') {
        res.send({ success: false });
        return;
    }

    if (!srcUrl.startsWith(esmsh_base)) {
        res.send({ success: false });
        return;
    }

    /// remove github entry
    srcUrl = srcUrl.replace(esmsh_base, "");

    /// split
    let splitted = srcUrl.split('/');

    const v2 = splitted.join('/');


    cdnUrl = `${process.env.CDN_BASE_URL}/npm/${v2}/+esm`;

    const respData = { success: true, url: cdnUrl };
    res.send(respData);
})

router.post('/purge', async function (req, res) {

    if (req.body.urls == undefined || req.body.urls == '') {
        res.send({ success: false, error: 'Bad Request' });
        return;
    }

    const urls = req.body.urls;
    try {
        const { data } = await request({
            url: `${process.env.CDN_BASE_URL}/purge`,
            data: {
                urls: urls
            },
            method: 'post'
        })
        
        console.log(data);

        res.send({ success: true, data: data });
    } catch (error) {
        console.log(error);
        res.send({ success: false })
    }
})

export default router;