const http = require('http');
const fs = require('fs');
const path = require('path');

function isSticker(ctx) {
    return ctx.updateSubTypes.includes('sticker')
}

function isText(ctx) {
    return ctx.updateSubTypes.includes('text')
}

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const buf = [];
        http.get(httpsToHttp(url), function (response) {
            response.on('data', d => buf.push(d));
            response.on('end', () => {
                resolve(Buffer.concat(buf))
            });
            response.on('error', reject);
        });
    })
}

function downloadFileStream(url) {
    return new Promise((resolve, reject) => {
        const buf = [];
        http.get(httpsToHttp(url), function (response) {
            resolve(response)
        });
    })
}

function httpsToHttp(url) {
    return url.replace('https:', 'http:')
}

module.exports = {isSticker, isText, downloadFile, downloadFileStream}