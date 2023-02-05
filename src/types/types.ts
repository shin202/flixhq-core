export enum MovieType {
    MOVIE = 'movie',
    TVSERIES = 'tv-show',
    ALL = 'all',
}

export enum MovieReport {
    TRENDING = 'Trending',
    LATEST_MOVIE = 'Latest Movies',
    LATEST_TV_SHOWS = 'Latest TV Shows',
    COMING_SOON = 'Coming Soon',
}

export enum Filter {
    GENRE = 'genre',
    COUNTRY = 'country',
}

export enum StreamingServers {
    UpCloud = 'UpCloud',
    VidCloud = 'Vidcloud',
    MixDrop = 'MixDrop',
}

export interface ISliderDetail {
    quality: string,
    duration: string,
    imdb: string,
    genres: string[],
}

export interface ISlider {
    image: string,
    title: string,
    detail: ISliderDetail,
    description: string,
}

export interface IMovieResult {
    id: string,
    title: string,
    url?: string,
    image?: string,
    releaseDate?: string | null,
    type?: MovieType,
    [x: string]: unknown,
}

export interface IHomeResult {
    slider: ISlider[],
    moviesSection: {
        trending: {
            trendingMovies: IMovieResult[],
            trendingTVShows: IMovieResult[],
        },
        latestMovies: IMovieResult[],
        latestTvShows: IMovieResult[],
        comingSoon: IMovieResult[],
    }
}

export interface IGenre {
    id?: number,
    title: string,
    url: string,
}

export interface ICountry {
    id?: number
    title: string,
    url: string,
}

export interface ISearch<T> {
    currentPage?: number,
    hasNextPage?: boolean,
    totalPages?: number,
    totalResults?: number,
    results: T[],
}

export interface IMovieEpisode {
    id: string,
    title: string,
    url?: string,
    episode?: number,
    seasons?: number,
    [x: string]: unknown,
}

export interface IMovieInfo extends IMovieResult {
    cover: string,
    description: string,
    episodes: IMovieEpisode[],
    recommended?: IMovieResult[],
    country?: ICountry,
    genres?: string[],
    productions?: string[],
    casts?: string[],
    tags?: string[],
    duration?: string,
    rating?: number,
    quality?: string,
}

export interface IEpisodeServer {
    id: string,
    name: string,
    url: string,
}

export interface IVideo {
    url: string,
    quality?: string,
    isM3U8: boolean,
    poster?: string,
}

export interface ISubtile {
    url: string,
    lang: string,
}

export interface IVideoResult {
    sources: IVideo[],
    subtiles: ISubtile[],
}

export interface IMovieSection {
    trendingMovies: IMovieResult[],
    trendingTVShows: IMovieResult[],
    latestMovies: IMovieResult[],
    latestTvShows: IMovieResult[],
    comingSoon: IMovieResult[],
}

export interface IItem {
    label: string,
    value: string|number,
}

export interface IMovieFilter {
    genres?: IItem[],
    countries?: IItem[], 
    types?: IItem[];
    qualities?: IItem[],
    releaseYear?: IItem[],
    [x: string]: unknown,
}