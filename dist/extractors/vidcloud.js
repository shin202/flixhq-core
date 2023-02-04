"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const utils_1 = require("../utils");
class VidCloud {
    serverName = 'VidCloud';
    host = 'https://dokicloud.one';
    host2 = 'https://rabbitstream.net';
    extract = async (videoUrl, isAlternative = false) => {
        const videoResult = {
            sources: [],
            subtiles: [],
        };
        try {
            const id = videoUrl.href.split('/').pop()?.split('?')[0];
            const options = {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': videoUrl.href,
                },
            };
            const { data } = await axios_1.default.get(`${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`, options);
            let sources = null;
            if (!(0, utils_1.isJson)(data.sources)) {
                const key = await (await axios_1.default.get('https://raw.githubusercontent.com/enimax-anime/key/e4/key.txt')).data;
                sources = JSON.parse(crypto_js_1.default.AES.decrypt(data.sources, key).toString(crypto_js_1.default.enc.Utf8));
            }
            for (const source of sources) {
                const { data } = await axios_1.default.get(source.file, options);
                const videoUrls = data.split('\n').filter((line) => line.includes('.m3u8'));
                const videoQualities = data.split('\n').filter((line) => line.includes('RESOLUTION='));
                videoQualities.map((item, i) => {
                    const quality = item.split(',')[2].split('x')[1];
                    const url = videoUrls[i];
                    videoResult.sources.push({
                        url: url,
                        quality: quality,
                        isM3U8: url.includes('.m3u8'),
                    });
                });
            }
            videoResult.subtiles = data.tracks.map((track) => {
                return {
                    url: track.file,
                    lang: track.label ?? 'Default',
                };
            });
            return videoResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map