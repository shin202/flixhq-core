"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
class MixDrop {
    serverName = 'MixDrop';
    extract = async (videoUrl) => {
        const videoResult = {
            sources: [],
            subtiles: []
        };
        try {
            const { data } = await axios_1.default.get(videoUrl.href);
            const match = (0, cheerio_1.load)(data).html().match(/return p}(.+?)wurl.+?}/g);
            if (!match) {
                throw new Error('Video not found!');
            }
            const [p, a, c, k, e, d] = match[0].replace(/return p}\(/, '').split(',').map(o => o.split('.split(')[0]);
            const formatted = this.formatter(p, a, c, k, e, JSON.parse(d));
            const url = /MDCore\.wurl="(.+?)\"/g.exec(formatted)?.pop();
            const poster = /MDCore\.poster\'?="(.+?)\"/g.exec(formatted)?.pop();
            videoResult.sources.push({
                url: url?.startsWith('https') ? url : `https:${url}`,
                poster: poster?.startsWith('https') ? poster : `https:${poster}`,
                isM3U8: url.includes('.m3u8'),
            });
            return videoResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    formatter = (p, a, c, k, e, d) => {
        k = k.split('|');
        e = function (c) {
            return c.toString(36);
        };
        if (!''.replace(/^/, String)) {
            while (c--) {
                d[c.toString(a)] = k[c] || c.toString(a);
            }
            k = [function (e) {
                    return d[e];
                }
            ];
            e = function () {
                return '\\w+';
            };
            c = 1;
        }
        while (c--) {
            if (k[c]) {
                p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
            }
        }
        return p;
    };
}
exports.default = MixDrop;
//# sourceMappingURL=mixdrop.js.map