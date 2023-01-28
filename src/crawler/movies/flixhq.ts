import axios from "axios";
import { CheerioAPI, load } from "cheerio";
import { Filter, FilterStrings, ICountry, IEpisodeServer, IGenre, IHomeResult, IMovieEpisode, IMovieInfo, IMovieResult, ISearch, MovieReport, MovieType, MovieTypeStrings, StreamingServers, StreamingServersStrings } from "../../types/types";
import { setMovieData } from "../../utils";
import { MixDrop, VidCloud } from '../../extractors';

class FlixHQ {
    readonly name = 'FlixHQ';
    protected baseUrl = 'https://flixhq.to';
    protected classPath = 'MOVIES.FlixHQ';
    protected supportedTypes = [MovieType.MOVIE, MovieType.TVSERIES];

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
                commingSoon: [],
            }
        };
        const { moviesSection: {
            trending: {
                trendingMovies,
                trendingTVShows,
            },
            latestTvShows,
            latestMovies,
            commingSoon
        } } = homeResult;


        const sliderImageRegex = new RegExp(/^background-image: url\((.*)\)/);

        try {
            const { data } = await axios.get(`${this.baseUrl}/home`);
            const $ = load(data);

            // Slider
            $('#slider > div.swiper-wrapper > div.swiper-slide').each((_, el) => {
                const image = $(el).attr('style')?.split(';')[0]!;
                const match = image.match(sliderImageRegex)!;
                const title = $(el).find('.film-title > a').attr('title')!;
                const movieDetail = $(el).find('.sc-detail > .scd-item');
                const movieGenre = $(movieDetail.get()[3]).find('a').get();

                homeResult.slider.push({
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

            // Movie Section
            const movieListSelector = '.block_area-content.film_list > .film_list-wrap > .flw-item';
            const trendingMovieSelector = `.tab-content > #trending-movies > ${movieListSelector}`;
            const trendingTvShowSelector = `.tab-content > #trending-tv > ${movieListSelector}`;

            $('.block_area.block_area_home').each((_, el) => {
                const title = $(el).find('h2.cat-heading').text();

                switch (title) {
                    case MovieReport.TRENDING:
                        // Trending Movies
                        $(el).find(trendingMovieSelector).each((_, el) => {
                            trendingMovies.push(setMovieData($, el, this.baseUrl));
                        });

                        // Trending TvShows
                        $(el).find(trendingTvShowSelector).each((_, el) => {
                            trendingTVShows.push(setMovieData($, el, this.baseUrl));
                        });
                        break;

                    case MovieReport.LATEST_MOVIE:
                        latestMovies.push(setMovieData($, el, this.baseUrl));
                        break;

                    case MovieReport.LATEST_TV_SHOWS:
                        latestTvShows.push(setMovieData($, el, this.baseUrl));
                        break;

                    case MovieReport.COMING_SOON:
                        commingSoon.push(setMovieData($, el, this.baseUrl));

                    default:
                        break;
                }
            });

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
    fetchMovieByGenreOrCountry = async (filterBy: FilterStrings, query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/${Filter[filterBy]}/${query}?page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($, el, this.baseUrl));
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
    fetchMovieByType = async (type: MovieTypeStrings, page: number = 1): Promise<ISearch<IMovieResult>> => {
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/${MovieType[type]}?page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($, el, this.baseUrl));
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
    fetchMovieByTopIMDB = async (type?: MovieTypeStrings | 'ALL', page: number = 1): Promise<ISearch<IMovieResult>> => {
        const filterResult: ISearch<IMovieResult> = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        }

        try {
            const { data } = await axios.get(`${this.baseUrl}/top-imdb?type=${type === 'ALL' ? 'all' : MovieType[type!]}&page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            filterResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                filterResult.results.push(setMovieData($, el, this.baseUrl));
            });

            return filterResult;
        } catch (err) {
            throw new Error((err as Error).message);
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

        const coverImageRegex = new RegExp(/^background-image: url\((.*)\)/);

        try {
            const { data } = await axios.get(`${this.baseUrl}/${mediaId}`);
            const $ = load(data);
            const recommendedArr: IMovieResult[] = [];

            const uid = $('.watch_block').attr('data-id')!;
            const cover = $('.watch_block > .w_b-cover').attr('style')!;
            const match = cover.match(coverImageRegex)!;

            movieInfo.title = $('.heading-name > a:nth-child(1)').text();
            movieInfo.url = `${this.baseUrl}${$('.heading-name > a:nth-child(1)').attr('href')}`;
            movieInfo.cover = match[1];
            movieInfo.image = $('.m_i-d-poster > .film-poster > img:nth-child(1)').attr('src')!;
            movieInfo.description = $('.m_i-d-content > .description').text();
            movieInfo.releaseData = $('.m_i-d-content > .elements > .row-line:nth-child(3)').text().replace('Released: ', '').trim(),
            movieInfo.type = movieInfo.id.split('/')[0] === 'movie' ? MovieType.MOVIE : MovieType.TVSERIES;
            movieInfo.country = {
                title: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('title')!,
                url: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('href')!.slice(1),
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
                recommendedArr.push(setMovieData($, el, this.baseUrl));
            });
            movieInfo.recommended = recommendedArr;

            if (movieInfo.type === MovieType.MOVIE) {
                movieInfo.episodes = [
                    {
                        id: uid,
                        title: `${movieInfo.title} Movie`,
                        url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
                    }
                ];
            } else {
                const $$ = await this.fetchTvShowSeasons(uid);

                const seasondsIds = $$('.slt-seasons-dropdown > .dropdown-menu > a')
                    .map((_, el) => $$(el)
                    .attr('data-id'))
                    .get();

                let season = 1;
                for (const id of seasondsIds) {
                    const $$$ = await this.fetchTvShowEpisodes(id);

                    $$$(`.nav > .nav-item`).map((_, el) => {
                        const episode: IMovieEpisode = {
                            id: $$$(el).find('a').attr('data-id')!,
                            title: $$$(el).find('a').attr('title')!,
                            episode: parseInt($$$(el).find('a').attr('title')!.split(':')[0].slice(3).trim()),
                            season: season,
                            url: `${this.baseUrl}/ajax/v2/episode/servers/${$$$(el).find('a').attr('data-id')}`,
                        }
                        
                        movieInfo.episodes.push(episode);
                    });
                    season++;
                }
            }

            return movieInfo;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    private fetchTvShowSeasons = async (id: string): Promise<CheerioAPI> => {
        try {
            const { data } = await axios.get(`${this.baseUrl}/ajax/v2/tv/seasons/${id}`);
            const $ = load(data);

            return $;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    private fetchTvShowEpisodes = async (seasonsId: string): Promise<CheerioAPI> => {
        try {
            const { data } = await axios.get(`${this.baseUrl}/ajax/v2/season/episodes/${seasonsId}`);
            const $ = load(data);

            return $;
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
                    id: $(el).find('a').attr('data-linkid')!,
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

    fetchEpisodeSources = async (mediaId: string, episodeId: string, server: StreamingServersStrings = 'UpCloud'): Promise<any> => {
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

            if (i === -1) {
                throw new Error(`Server ${server} not found.`);
            }

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

        try {
            const { data } = await axios.get(`${this.baseUrl}/search/${query}?page=${page}`);
            const $ = load(data);

            const navSelector = '.pre-pagination:nth-child(1) > nav > ul';
            searchResult.hasNextPage = $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

            $('.film_list-wrap > .flw-item').each((_, el) => {
                searchResult.results.push(setMovieData($, el, this.baseUrl));
            });

            return searchResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }
}

export default FlixHQ;