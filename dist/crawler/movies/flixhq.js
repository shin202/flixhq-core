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
    fetchSlider = ($, slider) => {
        const sliderImageRegex = new RegExp(/^background-image: url\((.*)\)/);
        $('#slider > div.swiper-wrapper > div.swiper-slide').each((_, el) => {
            const image = $(el).attr('style')?.split(';')[0];
            const match = image.match(sliderImageRegex);
            const title = $(el).find('.film-title > a').attr('title');
            const movieDetail = $(el).find('.sc-detail > .scd-item');
            const movieGenre = $(movieDetail.get()[3]).find('a').get();
            slider.push({
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
    };
    fetchTrendingMovies = ($, trendingMoviesSelector, trendingMovies) => {
        $.find(trendingMoviesSelector).each((_, el) => {
            trendingMovies.push((0, utils_1.setMovieData)($._make(el), this.baseUrl));
        });
    };
    fetchTrendingTvShows = ($, trendingTvShowSelector, trendingTVShows) => {
        $.find(trendingTvShowSelector).each((_, el) => {
            trendingTVShows.push((0, utils_1.setMovieData)($._make(el), this.baseUrl));
        });
    };
    fetchMovieSections = ($, options) => {
        const { trendingMovies, trendingTVShows, latestTvShows, latestMovies, comingSoon } = options;
        const moviesListSelector = '.block_area-content.film_list > .film_list-wrap > .flw-item';
        const trendingMoviesSelector = `.tab-content > #trending-movies > ${moviesListSelector}`;
        const trendingTvShowSelector = `.tab-content > #trending-tv > ${moviesListSelector}`;
        $('.block_area.block_area_home').each((_, el) => {
            const title = $(el).find('h2.cat-heading').text();
            switch (title) {
                case types_1.MovieReport.TRENDING:
                    this.fetchTrendingMovies($(el), trendingMoviesSelector, trendingMovies);
                    this.fetchTrendingTvShows($(el), trendingTvShowSelector, trendingTVShows);
                    break;
                case types_1.MovieReport.LATEST_MOVIE:
                    $(el).find(moviesListSelector).each((_, el) => {
                        latestMovies.push((0, utils_1.setMovieData)($(el), this.baseUrl));
                    });
                    break;
                case types_1.MovieReport.LATEST_TV_SHOWS:
                    $(el).find(moviesListSelector).each((_, el) => {
                        latestTvShows.push((0, utils_1.setMovieData)($(el), this.baseUrl));
                    });
                    break;
                case types_1.MovieReport.COMING_SOON:
                    $(el).find(moviesListSelector).each((_, el) => {
                        comingSoon.push((0, utils_1.setMovieData)($(el), this.baseUrl));
                    });
                    break;
                default:
                    break;
            }
        });
    };
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
                comingSoon: [],
            }
        };
        const { slider, moviesSection: { trending: { trendingMovies, trendingTVShows, }, latestTvShows, latestMovies, comingSoon } } = homeResult;
        const movieSections = {
            trendingMovies,
            trendingTVShows,
            latestTvShows,
            latestMovies,
            comingSoon: comingSoon
        };
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            this.fetchSlider($, slider);
            this.fetchMovieSections($, movieSections);
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
            const { data } = await axios_1.default.get(`${this.baseUrl}/${filterBy}/${query}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($(el), this.baseUrl));
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
            const { data } = await axios_1.default.get(`${this.baseUrl}/${type}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($(el), this.baseUrl));
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
    fetchMovieByTopIMDB = async (type = types_1.MovieType.ALL, page = 1) => {
        const filterResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/top-imdb?type=${type}&page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($(el), this.baseUrl));
            });
            return filterResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchTvShowSeasons = async (id) => {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/ajax/v2/tv/seasons/${id}`);
            return (0, cheerio_1.load)(data);
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchTvShowEpisodes = async (seasonsId) => {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/ajax/v2/season/episodes/${seasonsId}`);
            return (0, cheerio_1.load)(data);
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchTvShowEpisodeInfo = async (seasonId, currentSeason, episodes) => {
        const $ = await this.fetchTvShowEpisodes(seasonId);
        $(`.nav > .nav-item`).map((_, el) => {
            const episode = {
                id: $(el).find('a').attr('data-id'),
                title: $(el).find('a').attr('title'),
                episode: parseInt($(el).find('a').attr('title').split(':')[0].slice(3).trim()),
                season: currentSeason,
                url: `${this.baseUrl}/ajax/v2/episode/servers/${$(el).find('a').attr('data-id')}`,
            };
            episodes.push(episode);
        });
    };
    fetchTvShowSeasonInfo = async (uid, episodes) => {
        const $ = await this.fetchTvShowSeasons(uid);
        const seasonIds = $('.slt-seasons-dropdown > .dropdown-menu > a')
            .map((_, el) => $(el)
            .attr('data-id'))
            .get();
        let currentSeason = 1;
        for (const id of seasonIds) {
            await this.fetchTvShowEpisodeInfo(id, currentSeason, episodes);
            currentSeason++;
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
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/${mediaId}`);
            const $ = (0, cheerio_1.load)(data);
            const uid = $('.watch_block').attr('data-id');
            (0, utils_1.setMovieInfo)($, movieInfo, this.baseUrl);
            if (movieInfo.type === types_1.MovieType.MOVIE) {
                movieInfo.episodes = [
                    {
                        id: uid,
                        title: `${movieInfo.title} Movie`,
                        url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
                    }
                ];
                return movieInfo;
            }
            await this.fetchTvShowSeasonInfo(uid, movieInfo.episodes);
            return movieInfo;
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
                    id: mediaId.includes('movie') ? $(el).find('a').attr('data-linkid') : $(el).find('a').attr('data-id'),
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
    fetchEpisodeSources = async (mediaId, episodeId, server = types_1.StreamingServers.UpCloud) => {
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
            if (i === -1)
                throw new Error(`Server ${server} not found.`);
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
        query = query.replaceAll(' ', '-');
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/search/${query}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination > nav > ul';
            searchResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                searchResult.results.push((0, utils_1.setMovieData)($(el), this.baseUrl));
            });
            return searchResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    fetchFiltersList = async () => {
        const filtersList = {
            types: [],
            qualities: [],
            releaseYear: [],
            genres: [],
            countries: []
        };
        const { types = [], qualities = [], releaseYear = [], genres = [], countries = [] } = filtersList;
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/movie`);
            const $ = (0, cheerio_1.load)(data);
            const filterWrapper = '.category_filter-content';
            const typeSelector = `${filterWrapper} .row > div:nth-child(1) > .cfc-item > .ni-list > .form-check`;
            const qualitySelector = `${filterWrapper} .row > div:nth-child(2) > .cfc-item > .ni-list > .form-check`;
            const releaseSelector = `${filterWrapper} .row > div:nth-child(3) > .cfc-item > .ni-list > .form-check`;
            const genreSelector = `${filterWrapper} > div:nth-child(2) > .ni-list > .form-check`;
            const countrySelector = `${filterWrapper} > div:nth-child(3) > .ni-list > .form-check`;
            $(typeSelector).each((_, el) => {
                types.push({
                    label: $(el).find('input').attr('value'),
                    value: $(el).find('input').attr('value'),
                });
            });
            $(qualitySelector).each((_, el) => {
                qualities.push({
                    label: $(el).find('input').attr('value'),
                    value: $(el).find('input').attr('value'),
                });
            });
            $(releaseSelector).each((_, el) => {
                releaseYear.push({
                    label: $(el).find('input').attr('value'),
                    value: $(el).find('input').attr('value'),
                });
            });
            $(genreSelector).each((_, el) => {
                genres.push({
                    label: $(el).find('label').text(),
                    value: parseInt($(el).find('input').attr('value')),
                });
            });
            $(countrySelector).each((_, el) => {
                countries.push({
                    label: $(el).find('label').text(),
                    value: parseInt($(el).find('input').attr('value')),
                });
            });
            return filtersList;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
    filter = async (options, page = 1) => {
        const { type = 'all', quality = 'all', released = 'all', genre = 'all', country = 'all' } = options;
        const filterResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const reqParams = {
                type,
                quality,
                release_year: released,
                genre: Array.isArray(genre) ? genre.join('-') : 'all',
                country: Array.isArray(country) ? country.join('-') : 'all',
            };
            const { data } = await axios_1.default.get(`${this.baseUrl}/filter`, {
                params: {
                    ...reqParams,
                }
            });
            const $ = (0, cheerio_1.load)(data);
            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push((0, utils_1.setMovieData)($(el), this.baseUrl));
            });
            return filterResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
}
exports.default = FlixHQ;
//# sourceMappingURL=flixhq.js.map