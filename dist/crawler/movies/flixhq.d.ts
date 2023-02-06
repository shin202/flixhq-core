import { Filter, ICountry, IEpisodeServer, IGenre, IHomeResult, IMovieFilter, IMovieInfo, IMovieResult, ISearch, MovieType, StreamingServers } from "../../types/types";
declare class FlixHQ {
    readonly name = "FlixHQ";
    protected baseUrl: string;
    protected classPath: string;
    protected supportedTypes: MovieType[];
    private fetchSlider;
    private fetchTrendingMovies;
    private fetchTrendingTvShows;
    private fetchMovieSections;
    home: () => Promise<IHomeResult>;
    fetchGenresList: () => Promise<IGenre[]>;
    fetchCountriesList: () => Promise<ICountry[]>;
    /**
     *
     * @param filterBy Type of the filter
     * @param query Query depend on the filter
     * @param page
     * @returns
     */
    fetchMovieByGenreOrCountry: (filterBy: Filter, query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     *
     * @param type Type of the video (MOVIE or TVSERIES)
     * @param page
     * @returns
     */
    fetchMovieByType: (type: MovieType, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     *
     * @param type
     * @param page
     * @returns
     */
    fetchMovieByTopIMDB: (type?: MovieType, page?: number) => Promise<ISearch<IMovieResult>>;
    private fetchTvShowSeasons;
    private fetchTvShowEpisodes;
    private fetchTvShowEpisodeInfo;
    private fetchTvShowSeasonInfo;
    /**
     * Get Info of the video
     *
     * @param mediaId
     * @returns
     */
    fetchMovieInfo: (mediaId: string) => Promise<IMovieInfo>;
    fetchEpisodeServers: (mediaId: string, episodeId: string) => Promise<IEpisodeServer[]>;
    fetchEpisodeSources: (mediaId: string, episodeId: string, server?: StreamingServers) => Promise<any>;
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    fetchFiltersList: () => Promise<IMovieFilter>;
    filter: (options: IMovieFilter, page?: number) => Promise<ISearch<IMovieResult>>;
}
export default FlixHQ;
//# sourceMappingURL=flixhq.d.ts.map