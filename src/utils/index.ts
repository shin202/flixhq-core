import { CheerioAPI } from "cheerio";
import { IMovieResult, MovieType } from "../types/types";

export const setMovieData = ($: CheerioAPI, el: any, baseUrl: string) => {
    const releaseDate = $(el).find('.film-detail > .fd-infor > .fdi-item:nth-child(1)').text();
    const totalEpisodes = $(el).find('.film-detail > .fd-infor > span:nth-child(3)').text();
    const movieData: IMovieResult = {
        id: $(el).find('.film-poster > .film-poster-ahref').attr('href')?.slice(1)!,
        title: $(el).find('.film-detail > .film-name > a').attr('title')!,
        url: `${baseUrl}${$(el).find('.film-detail > .film-name > a').attr('href')}`!,
        image: $(el).find('.film-poster-img').attr('data-src'),
        releaseDate: isNaN(parseInt(releaseDate)) ? null : releaseDate,
        type: $(el).find('.film-detail > .fd-infor > .fdi-type').text() === 'Movie' ? MovieType.MOVIE : MovieType.TVSERIES,
        duration: $(el).find('.film-detail > .fd-infor > .fdi-duration').text(),
        seasons: releaseDate.includes('SS') && !isNaN(parseInt(releaseDate.split('SS')[1])) ? parseInt(releaseDate.split('SS')[1]) : null,
        lastEpisodes: totalEpisodes.includes('EPS') && !isNaN(parseInt(totalEpisodes.split('EPS')[1])) ? parseInt(totalEpisodes.split('EPS')[1]) : null,
    };

    return movieData;
}

export const isJson = (data: string): boolean => {
    try {
        JSON.parse(data);
    } catch (err) {
        return false;
    }

    return true;
}