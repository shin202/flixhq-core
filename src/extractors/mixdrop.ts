import axios from "axios";
import { load } from "cheerio";
import { IVideoResult } from "../types/types";

class MixDrop {
    protected serverName = 'MixDrop';

    extract = async (videoUrl: URL) => {
        const videoResult: IVideoResult = {
            sources: [],
            subtiles: []
        }

        try {
            const { data } = await axios.get(videoUrl.href);
            const match = load(data).html().match(/return p}(.+?)wurl.+?}/g);

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
                isM3U8: url!.includes('.m3u8'),
            });
    
            return videoResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    private formatter = (p: any, a: any, c: any, k: any, e: any, d: any) => {
        k = k.split('|');

        e = function (c: any) {
            return c.toString(36);
        }

        if (!''.replace(/^/, String)) {
            while (c--) {
                d[c.toString(a)] = k[c] || c.toString(a);
            }

            k = [function (e: any) {
                return d[e];
            }
            ];

            e = function () {
                return '\\w+';
            }

            c = 1;
        }

        while (c--) {
            if (k[c]) {
                p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
            }
        }

        return p;
    }
}

export default MixDrop;