import { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { IMovieInfo, IMovieResult, MovieType } from "../types/types";

// Short informations of the movie.
export const setMovieData = ($: Cheerio<AnyNode>, baseUrl: string) => {
    const releaseDate = $.find('.film-detail > .fd-infor > .fdi-item:nth-child(1)').text();
    const totalEpisodes = $.find('.film-detail > .fd-infor > span:nth-child(3)').text();
    const movieData: IMovieResult = {
        id: $.find('.film-poster > .film-poster-ahref').attr('href')?.slice(1)!,
        title: $.find('.film-detail > .film-name > a').attr('title')!,
        url: `${baseUrl}${$.find('.film-detail > .film-name > a').attr('href')}`!,
        image: $.find('.film-poster-img').attr('data-src'),
        releaseDate: isNaN(parseInt(releaseDate)) ? null : releaseDate,
        type: $.find('.film-detail > .fd-infor > .fdi-type').text() === 'Movie' ? MovieType.MOVIE : MovieType.TVSERIES,
        duration: $.find('.film-detail > .fd-infor > .fdi-duration').text(),
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

// Detail information of the movie.
export const setMovieInfo = ($: CheerioAPI, movieInfo: IMovieInfo, baseUrl: string) => {
    const coverImageRegex = new RegExp(/^background-image: url\((.*)\)/);
    const cover = $('.watch_block > .w_b-cover').attr('style')!;
    const match = cover.match(coverImageRegex)!;
    const recommendedArr: IMovieResult[] = [];

    movieInfo.title = $('.heading-name > a:nth-child(1)').text();
    movieInfo.url = `${baseUrl}${$('.heading-name > a:nth-child(1)').attr('href')}`;
    movieInfo.cover = match[1];
    movieInfo.image = $('.m_i-d-poster > .film-poster > img:nth-child(1)').attr('src')!;
    movieInfo.description = $('.m_i-d-content > .description').text();
    movieInfo.releaseDate = $('.m_i-d-content > .elements > .row-line:nth-child(3)').text().replace('Released: ', '').trim();
    movieInfo.type = movieInfo.id.split('/')[0] === 'movie' ? MovieType.MOVIE : MovieType.TVSERIES;
    movieInfo.country = {
        title: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('title')!,
        url: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('href')?.slice(1)!,
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
        recommendedArr.push(setMovieData($(el), baseUrl));
    });
    movieInfo.recommended = recommendedArr;
}