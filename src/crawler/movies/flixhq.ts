import axios from "axios";
import { AnyNode, Cheerio, CheerioAPI, load } from "cheerio";
import {
    Filter,
    ICountry,
    IEpisodeServer,
    IGenre,
    IHomeResult,
    IMovieEpisode,
    IMovieFilter,
    IMovieInfo,
    IMovieResult,
    IMovieSection,
    ISearch,
    ISlider,
    MovieReport,
    MovieType,
    StreamingServers
} from "../../types/types";
import { setMovieData, setMovieInfo } from "../../utils";
import { MixDrop, VidCloud } from '../../extractors';

class FlixHQ {
    readonly name = 'FlixHQ';
    protected baseUrl = 'https://flixhq.to';
    protected classPath = 'MOVIES.FlixHQ';
    protected supportedTypes = [MovieType.MOVIE, MovieType.TVSERIES];

    private fetchSlider = ($: CheerioAPI, slider: ISlider[]) => {
        const sliderImageRegex = new RegExp(/^background-image: url\((.*)\)/);

        $('#slider > div.swiper-wrapper > div.swiper-slide').each((_, el) => {
            const image = $(el).attr('style')?.split(';')[0]!;
            const match = image.match(sliderImageRegex)!;
            const title = $(el).find('.film-title > a').attr('title')!;
            const movieDetail = $(el).find('.sc-detail > .scd-item');
            const movieGenre = $(movieDetail.get()[3]).find('a').get();

            slider.push({
                image: match[1],
                title: title,
                detail: {
                    quality: $(movieDetail).find('span.quality').text(),
                    duration: $(movieDetail.get()[1]).find('strong').text(),
                    imdb: $(movieDetail.get()[2]).find('strong').text(),
                    genres: movieGenre.map(el => $(el).attr('title')!),
                },
                description: $(el).find('.sc-desc').text(),
            });
        });
    }

    private fetchTrendingMovies = ($: Cheerio<AnyNode>, trendingMoviesSelector: string, trendingMovies: IMovieResult[]) => {
        $.find(trendingMoviesSelector).each((_, el) => {
            trendingMovies.push(setMovieData($._make(el), this.baseUrl));
        });
    }

    private fetchTrendingTvShows = ($: Cheerio<AnyNode>, trendingTvShowSelector: string, trendingTVShows: IMovieResult[]) => {
        $.find(trendingTvShowSelector).each((_, el) => {
            trendingTVShows.push(setMovieData($._make(el), this.baseUrl));
        });
    }

    private fetchMovieSections = ($: CheerioAPI, options: IMovieSection) => {
        const { trendingMovies, trendingTVShows, latestTvShows, latestMovies, comingSoon } = options;

        const moviesListSelector = '.block_area-content.film_list > .film_list-wrap > .flw-item';
        const trendingMoviesSelector = `.tab-content > #trending-movies > ${moviesListSelector}`;
        const trendingTvShowSelector = `.tab-content > #trending-tv > ${moviesListSelector}`;

        $('.block_area.block_area_home').each((_, el) => {
            const title = $(el).find('h2.cat-heading').text();

            switch (title) {
                case MovieReport.TRENDING:
                    this.fetchTrendingMovies($(el), trendingMoviesSelector, trendingMovies);
                    this.fetchTrendingTvShows($(el), trendingTvShowSelector, trendingTVShows);
                    break;

                case MovieReport.LATEST_MOVIE:
                    $(el).find(moviesListSelector).each((_, el) => {
                        latestMovies.push(setMovieData($(el), this.baseUrl));
                    });
                    break;

                case MovieReport.LATEST_TV_SHOWS:
                    $(el).find(moviesListSelector).each((_, el) => {
                        latestTvShows.push(setMovieData($(el), this.baseUrl));
                    });
                    break;

                case MovieReport.COMING_SOON:
                    $(el).find(moviesListSelector).each((_, el) => {
                        comingSoon.push(setMovieData($(el), this.baseUrl));
                    });
                    break;

                default:
                    break;
            }
        });
    }

    home = async (): Promise<IHomeResult> => {
        const homeResult: IHomeResult = {
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
        const {
            slider, moviesSection: {
                trending: {
                    trendingMovies,
                    trendingTVShows,
                },
                latestTvShows,
                latestMovies,
                comingSoon
            }
        } = homeResult;
        const movieSections: IMovieSection = {
            trendingMovies,
            trendingTVShows,
            latestTvShows,
            latestMovies,
            comingSoon: comingSoon
        };

        try {
            const { data } = await axios.get(`${this.baseUrl}/home`);
            const $ = load(data);

            this.fetchSlider($, slider);
            this.fetchMovieSections($, movieSections);

            return homeResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    fetchGenresList = async (): Promise<IGenre[]> => {
        const genreResult: IGenre[] = [];

        try {
            const { data } = await axios.get(`${this.baseUrl}/home`);
            const $ = load(data);

            const genreSelector = '#header_menu > .header_menu-list > .nav-item:contains("Genre") > .header_menu-sub > .sub-menu > li';
            $(genreSelector).each((_, el) => {
                genreResult.push({
                    title: $(el).find('a').attr('title')!,
                    url: $(el).find('a').attr('href')?.slice(1)!,
                });
            });

            return genreResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    fetchCountriesList = async (): Promise<ICountry[]> => {
        const countryResult: ICountry[] = [];

        try {
            const { data } = await axios.get(`${this.baseUrl}/home`);
            const $ = load(data);

            const countrySelector = '#header_menu > .header_menu-list > .nav-item:contains("Country") > .header_menu-sub > .sub-menu > li';
            $(countrySelector).each((_, el) => {
                countryResult.push({
                    title: $(el).find('a').attr('title')!,
                    url: $(el).find('a').attr('href')?.slice(1)!,
                });
            });

            return countryResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    /**
     *
     * @param filterBy Type of the filter
     * @param query Query depend on the filter
     * @param page
     * @returns
     */
    fetchMovieByGenreOrCountry = async (filterBy: Filter, query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/${filterBy}/${query}?page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($(el), this.baseUrl));
            });

            return filterResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    /**
     *
     * @param type Type of the video (MOVIE or TVSERIES)
     * @param page
     * @returns
     */
    fetchMovieByType = async (type: MovieType, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/${type}?page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($(el), this.baseUrl));
            });

            return filterResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    /**
     *
     * @param type
     * @param page
     * @returns
     */
    fetchMovieByTopIMDB = async (type: MovieType = MovieType.ALL, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/top-imdb?type=${type}&page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($(el), this.baseUrl));
            });

            return filterResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    private fetchTvShowSeasons = async (id: string): Promise<CheerioAPI> => {
        try {
            const { data } = await axios.get(`${this.baseUrl}/ajax/v2/tv/seasons/${id}`);
            return load(data);
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    private fetchTvShowEpisodes = async (seasonsId: string): Promise<CheerioAPI> => {
        try {
            const { data } = await axios.get(`${this.baseUrl}/ajax/v2/season/episodes/${seasonsId}`);
            return load(data);
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    private fetchTvShowEpisodeInfo = async (seasonId: string, currentSeason: number, episodes: IMovieEpisode[]): Promise<void> => {
        const $ = await this.fetchTvShowEpisodes(seasonId);

        $(`.nav > .nav-item`).map((_, el) => {
            const episode: IMovieEpisode = {
                id: $(el).find('a').attr('data-id')!,
                title: $(el).find('a').attr('title')!,
                episode: parseInt($(el).find('a').attr('title')!.split(':')[0].slice(3).trim()),
                season: currentSeason,
                url: `${this.baseUrl}/ajax/v2/episode/servers/${$(el).find('a').attr('data-id')}`,
            }

            episodes.push(episode);
        });
    }

    private fetchTvShowSeasonInfo = async (uid: string, episodes: IMovieEpisode[]): Promise<void> => {
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
    }

    /**
     * Get Info of the video
     *
     * @param mediaId
     * @returns
     */
    fetchMovieInfo = async (mediaId: string): Promise<IMovieInfo> => {
        const movieInfo: IMovieInfo = {
            id: mediaId,
            title: "",
            url: "",
            cover: "",
            image: "",
            description: "",
            episodes: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/${mediaId}`);
            const $ = load(data);

            const uid = $('.watch_block').attr('data-id')!;

            setMovieInfo($, movieInfo, this.baseUrl);

            if (movieInfo.type === MovieType.MOVIE) {
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
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    fetchEpisodeServers = async (mediaId: string, episodeId: string): Promise<IEpisodeServer[]> => {
        if (!mediaId.includes('movie')) {
            episodeId = `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;
        } else {
            episodeId = `${this.baseUrl}/ajax/movie/episodes/${episodeId}`;
        }

        try {
            const { data } = await axios.get(episodeId);
            const $ = load(data);

            const servers = $('.nav > .nav-item').map((_, el) => {
                const server: IEpisodeServer = {
                    id: mediaId.includes('movie') ? $(el).find('a').attr('data-linkid')! : $(el).find('a').attr('data-id')!,
                    name: $(el).find('a').find('span').text(),
                    url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                }

                return server;
            }).get();

            return servers;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    fetchEpisodeSources = async (mediaId: string, episodeId: string, server: StreamingServers = StreamingServers.UpCloud): Promise<any> => {
        if (episodeId.startsWith('http')) {
            const serverUrl = new URL(episodeId);

            switch (server) {
                case StreamingServers.MixDrop:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new MixDrop().extract(serverUrl)),
                    }

                case StreamingServers.VidCloud:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new VidCloud().extract(serverUrl, true)),
                    }

                case StreamingServers.UpCloud:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new VidCloud().extract(serverUrl)),
                    }

                default:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                        },
                        ...(await new MixDrop().extract(serverUrl)),
                    }
            }
        }

        try {
            const servers = await this.fetchEpisodeServers(mediaId, episodeId);

            const i = servers.findIndex(s => s.name === server);

            if (i === -1) throw new Error(`Server ${server} not found.`);

            // Send request to the streaming server to get the video url.
            const { data } = await axios.get(`${this.baseUrl}/ajax/sources/${servers[i].id}`);
            const serverUrl: URL = new URL(data.link);

            return await this.fetchEpisodeSources(mediaId, serverUrl.href, server);
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const searchResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        query = query.replaceAll(' ', '-');

        try {
            const { data } = await axios.get(`${this.baseUrl}/search/${query}?page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination > nav > ul';
            searchResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                searchResult.results.push(setMovieData($(el), this.baseUrl));
            });

            return searchResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    fetchFiltersList = async (): Promise<IMovieFilter> => {
        const filtersList: IMovieFilter = {
            types: [],
            qualities: [],
            releaseYear: [],
            genres: [],
            countries: []
        };
        const { types = [], qualities = [], releaseYear = [], genres = [], countries = [] } = filtersList;

        try {
            const { data } = await axios.get(`${this.baseUrl}/movie`);
            const $ = load(data);

            const filterWrapper = '.category_filter-content';
            const typeSelector = `${filterWrapper} .row > div:nth-child(1) > .cfc-item > .ni-list > .form-check`;
            const qualitySelector = `${filterWrapper} .row > div:nth-child(2) > .cfc-item > .ni-list > .form-check`;
            const releaseSelector = `${filterWrapper} .row > div:nth-child(3) > .cfc-item > .ni-list > .form-check`;
            const genreSelector = `${filterWrapper} > div:nth-child(2) > .ni-list > .form-check`;
            const countrySelector = `${filterWrapper} > div:nth-child(3) > .ni-list > .form-check`;

            $(typeSelector).each((_, el) => {
                types.push({
                    label: $(el).find('input').attr('value')!,
                    value: $(el).find('input').attr('value')!,
                });
            });

            $(qualitySelector).each((_, el) => {
                qualities.push({
                    label: $(el).find('input').attr('value')!,
                    value: $(el).find('input').attr('value')!,
                });
            });

            $(releaseSelector).each((_, el) => {
                releaseYear.push({
                    label: $(el).find('input').attr('value')!,
                    value: $(el).find('input').attr('value')!,
                });
            });

            $(genreSelector).each((_, el) => {
                genres.push({
                    label: $(el).find('label').text(),
                    value: parseInt($(el).find('input').attr('value')!),
                });
            });

            $(countrySelector).each((_, el) => {
                countries.push({
                    label: $(el).find('label').text(),
                    value: parseInt($(el).find('input').attr('value')!),
                });
            });

            return filtersList;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    filter = async (options: IMovieFilter, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const { type = 'all', quality = 'all', released = 'all', genre = 'all', country = 'all' } = options;
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const reqParams = {
                type,
                quality,
                release_year: released,
                genre: Array.isArray(genre) ? genre.join('-') : 'all',
                country: Array.isArray(country) ? country.join('-') : 'all',
            }

            const { data } = await axios.get(`${this.baseUrl}/filter`, {
                params: {
                    ...reqParams,
                }
            });
            const $ = load(data);

            const navSelector = '.pre-pagination > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($(el), this.baseUrl));
            });

            return filterResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }
}

export default FlixHQ;