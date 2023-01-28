"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const types_1 = require("../../types/types");
const utils_1 = require("../../utils");
const extractors_1 = require("../../extractors");
class FlixHQ {
    name = 'FlixHQ';
    baseUrl = 'https://flixhq.to';
    classPath = 'MOVIES.FlixHQ';
    supportedTypes = [types_1.MovieType.MOVIE, types_1.MovieType.TVSERIES];
    home = async () => {
        const homeResult = {
            slider: [],
            moviesSection: {
                trending: {
                    trendingMovies: [],
                    trendingTVShows: [],
                },
                latestTvShows: [],
                latestMovies: [],
                commingSoon: [],
            }
        };
        const { moviesSection: { trending: { trendingMovies, trendingTVShows, }, latestTvShows, latestMovies, commingSoon } } = homeResult;
        const sliderImageRegex = new RegExp(/^background-image: url\((.*)\)/);
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            // Slider
            $('#slider > div.swiper-wrapper > div.swiper-slide').each((_, el) => {
                const image = $(el).attr('style')?.split(';')[0];
                const match = image.match(sliderImageRegex);
                const title = $(el).find('.film-title > a').attr('title');
                const movieDetail = $(el).find('.sc-detail > .scd-item');
                const movieGenre = $(movieDetail.get()[3]).find('a').get();
                homeResult.slider.push({
                    image: match[1],
                    title: title,
                    detail: {
                        quality: $(movieDetail).find('span.quality').text(),
                        duration: $(movieDetail.get()[1]).find('strong').text(),
                        imdb: $(movieDetail.get()[2]).find('strong').text(),
                        genres: movieGenre.map(el => $(el).attr('title')),
                    },
                    description: $(el).find('.sc-desc').text(),
                });
            });
            // Movie Section
            const movieListSelector = '.block_area-content.film_list > .film_list-wrap > .flw-item';
            const trendingMovieSelector = `.tab-content > #trending-movies > ${movieListSelector}`;
            const trendingTvShowSelector = `.tab-content > #trending-tv > ${movieListSelector}`;
            $('.block_area.block_area_home').each((_, el) => {
                const title = $(el).find('h2.cat-heading').text();
                switch (title) {
                    case types_1.MovieReport.TRENDING:
                        // Trending Movies
                        $(el).find(trendingMovieSelector).each((_, el) => {
                            trendingMovies.push((0, utils_1.setMovieData)($, el, this.baseUrl));
                        });
                        // Trending TvShows
                        $(el).find(trendingTvShowSelector).each((_, el) => {
                            trendingTVShows.push((0, utils_1.setMovieData)($, el, this.baseUrl));
                        });
                        break;
                    case types_1.MovieReport.LATEST_MOVIE:
                        latestMovies.push((0, utils_1.setMovieData)($, el, this.baseUrl));
                        break;
                    case types_1.MovieReport.LATEST_TV_SHOWS:
                        latestTvShows.push((0, utils_1.setMovieData)($, el, this.baseUrl));
                        break;
                    case types_1.MovieReport.COMING_SOON:
                        commingSoon.push((0, utils_1.setMovieData)($, el, this.baseUrl));
                    default:
                        break;
                }
            });
            return homeResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchGenresList = async () => {
        const genreResult = [];
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            const genreSelector = '#header_menu > .header_menu-list > .nav-item:contains("Genre") > .header_menu-sub > .sub-menu > li';
            $(genreSelector).each((_, el) => {
                genreResult.push({
                    title: $(el).find('a').attr('title'),
                    url: $(el).find('a').attr('href')?.slice(1),
                });
            });
            return genreResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchCountriesList = async () => {
        const countryResult = [];
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            const countrySelector = '#header_menu > .header_menu-list > .nav-item:contains("Country") > .header_menu-sub > .sub-menu > li';
            $(countrySelector).each((_, el) => {
                countryResult.push({
                    title: $(el).find('a').attr('title'),
                    url: $(el).find('a').attr('href')?.slice(1),
                });
            });
            return countryResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    /**
     *
     * @param filterBy Type of the filter
     * @param query Query depend on the filter
     * @param page
     * @returns
     */
    fetchMovieByGenreOrCountry = async (filterBy, query, page = 1) => {
        const filterResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/${types_1.Filter[filterBy]}/${query}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($, el, this.baseUrl));
            });
            return filterResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    /**
     *
     * @param type Type of the video (MOVIE or TVSERIES)
     * @param page
     * @returns
     */
    fetchMovieByType = async (type, page = 1) => {
        const filterResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/${types_1.MovieType[type]}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($, el, this.baseUrl));
            });
            return filterResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    /**
     *
     * @param type
     * @param page
     * @returns
     */
    fetchMovieByTopIMDB = async (type, page = 1) => {
        const filterResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/top-imdb?type=${type === 'ALL' ? 'all' : types_1.MovieType[type]}&page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($, el, this.baseUrl));
            });
            return filterResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    /**
     * Get Info of the video
     *
     * @param mediaId
     * @returns
     */
    fetchMovieInfo = async (mediaId) => {
        const movieInfo = {
            id: mediaId,
            title: "",
            url: "",
            cover: "",
            image: "",
            description: "",
            episodes: [],
        };
        const coverImageRegex = new RegExp(/^background-image: url\((.*)\)/);
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/${mediaId}`);
            const $ = (0, cheerio_1.load)(data);
            const recommendedArr = [];
            const uid = $('.watch_block').attr('data-id');
            const cover = $('.watch_block > .w_b-cover').attr('style');
            const match = cover.match(coverImageRegex);
            movieInfo.title = $('.heading-name > a:nth-child(1)').text();
            movieInfo.url = `${this.baseUrl}${$('.heading-name > a:nth-child(1)').attr('href')}`;
            movieInfo.cover = match[1];
            movieInfo.image = $('.m_i-d-poster > .film-poster > img:nth-child(1)').attr('src');
            movieInfo.description = $('.m_i-d-content > .description').text();
            movieInfo.releaseData = $('.m_i-d-content > .elements > .row-line:nth-child(3)').text().replace('Released: ', '').trim(),
                movieInfo.type = movieInfo.id.split('/')[0] === 'movie' ? types_1.MovieType.MOVIE : types_1.MovieType.TVSERIES;
            movieInfo.country = {
                title: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('title'),
                url: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('href').slice(1),
            };
            movieInfo.genres = $('.m_i-d-content > .elements > .row-line:nth-child(2) > a')
                .map((_, el) => $(el).attr('title')).get();
            movieInfo.productions = $('.m_i-d-content > .elements > .row-line:nth-child(4) > a')
                .map((_, el) => $(el).attr('title')).get();
            movieInfo.casts = $('.m_i-d-content > .elements > .row-line:nth-child(5) > a')
                .map((_, el) => $(el).attr('title')).get();
            movieInfo.tags = $('.m_i-d-content > .elements > .row-line:nth-child(6) > .h-tag')
                .map((_, el) => $(el).text()).get();
            movieInfo.duration = $('.m_i-d-content > .stats > .item:nth-child(3)').text();
            movieInfo.rating = parseFloat($('.m_i-d-content > .stats > .item:nth-child(2)').text());
            movieInfo.quality = $('.m_i-d-content > .stats > .item:nth-child(1)').text();
            $('.m_i-related > .film-related > .block_area > .block_area-content > .film_list-wrap > .flw-item').each((_, el) => {
                recommendedArr.push((0, utils_1.setMovieData)($, el, this.baseUrl));
            });
            movieInfo.recommended = recommendedArr;
            if (movieInfo.type === types_1.MovieType.MOVIE) {
                movieInfo.episodes = [
                    {
                        id: uid,
                        title: `${movieInfo.title} Movie`,
                        url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
                    }
                ];
            }
            else {
                const $$ = await this.fetchTvShowSeasons(uid);
                const seasondsIds = $$('.slt-seasons-dropdown > .dropdown-menu > a')
                    .map((_, el) => $$(el)
                    .attr('data-id'))
                    .get();
                let season = 1;
                for (const id of seasondsIds) {
                    const $$$ = await this.fetchTvShowEpisodes(id);
                    $$$(`.nav > .nav-item`).map((_, el) => {
                        const episode = {
                            id: $$$(el).find('a').attr('data-id'),
                            title: $$$(el).find('a').attr('title'),
                            episode: parseInt($$$(el).find('a').attr('title').split(':')[0].slice(3).trim()),
                            season: season,
                            url: `${this.baseUrl}/ajax/v2/episode/servers/${$$$(el).find('a').attr('data-id')}`,
                        };
                        movieInfo.episodes.push(episode);
                    });
                    season++;
                }
            }
            return movieInfo;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchTvShowSeasons = async (id) => {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/ajax/v2/tv/seasons/${id}`);
            const $ = (0, cheerio_1.load)(data);
            return $;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchTvShowEpisodes = async (seasonsId) => {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/ajax/v2/season/episodes/${seasonsId}`);
            const $ = (0, cheerio_1.load)(data);
            return $;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchEpisodeServers = async (mediaId, episodeId) => {
        if (!mediaId.includes('movie')) {
            episodeId = `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;
        }
        else {
            episodeId = `${this.baseUrl}/ajax/movie/episodes/${episodeId}`;
        }
        try {
            const { data } = await axios_1.default.get(episodeId);
            const $ = (0, cheerio_1.load)(data);
            const servers = $('.nav > .nav-item').map((_, el) => {
                const server = {
                    id: $(el).find('a').attr('data-linkid'),
                    name: $(el).find('a').find('span').text(),
                    url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                };
                return server;
            }).get();
            return servers;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchEpisodeSources = async (mediaId, episodeId, server = 'UpCloud') => {
        if (episodeId.startsWith('http')) {
            const serverUrl = new URL(episodeId);
            switch (server) {
                case types_1.StreamingServers.MixDrop:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new extractors_1.MixDrop().extract(serverUrl)),
                    };
                case types_1.StreamingServers.VidCloud:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new extractors_1.VidCloud().extract(serverUrl, true)),
                    };
                case types_1.StreamingServers.UpCloud:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new extractors_1.VidCloud().extract(serverUrl)),
                    };
                default:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new extractors_1.MixDrop().extract(serverUrl)),
                    };
            }
        }
        try {
            const servers = await this.fetchEpisodeServers(mediaId, episodeId);
            const i = servers.findIndex(s => s.name === server);
            if (i === -1) {
                throw new Error(`Server ${server} not found.`);
            }
            // Send request to the streaming server to get the video url.
            const { data } = await axios_1.default.get(`${this.baseUrl}/ajax/sources/${servers[i].id}`);
            const serverUrl = new URL(data.link);
            return await this.fetchEpisodeSources(mediaId, serverUrl.href, server);
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    search = async (query, page = 1) => {
        const searchResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/search/${query}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            searchResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                searchResult.results.push((0, utils_1.setMovieData)($, el, this.baseUrl));
            });
            return searchResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
}
exports.default = FlixHQ;
//# sourceMappingURL=flixhq.js.map