"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMovieInfo = exports.isJson = exports.setMovieData = void 0;
const types_1 = require("../types/types");
// Short informations of the movie.
const setMovieData = ($, baseUrl) => {
    const releaseDate = $.find('.film-detail > .fd-infor > .fdi-item:nth-child(1)').text();
    const totalEpisodes = $.find('.film-detail > .fd-infor > span:nth-child(3)').text();
    const movieData = {
        id: $.find('.film-poster > .film-poster-ahref').attr('href')?.slice(1),
        title: $.find('.film-detail > .film-name > a').attr('title'),
        url: `${baseUrl}${$.find('.film-detail > .film-name > a').attr('href')}`,
        image: $.find('.film-poster-img').attr('data-src'),
        releaseDate: isNaN(parseInt(releaseDate)) ? null : releaseDate,
        type: $.find('.film-detail > .fd-infor > .fdi-type').text() === 'Movie' ? types_1.MovieType.MOVIE : types_1.MovieType.TVSERIES,
        duration: $.find('.film-detail > .fd-infor > .fdi-duration').text(),
        seasons: releaseDate.includes('SS') && !isNaN(parseInt(releaseDate.split('SS')[1])) ? parseInt(releaseDate.split('SS')[1]) : null,
        lastEpisodes: totalEpisodes.includes('EPS') && !isNaN(parseInt(totalEpisodes.split('EPS')[1])) ? parseInt(totalEpisodes.split('EPS')[1]) : null,
    };
    return movieData;
};
exports.setMovieData = setMovieData;
const isJson = (data) => {
    try {
        JSON.parse(data);
    }
    catch (err) {
        return false;
    }
    return true;
};
exports.isJson = isJson;
// Detail information of the movie.
const setMovieInfo = ($, movieInfo, baseUrl) => {
    const coverImageRegex = new RegExp(/^background-image: url\((.*)\)/);
    const cover = $('.watch_block > .w_b-cover').attr('style');
    const match = cover.match(coverImageRegex);
    const recommendedArr = [];
    movieInfo.title = $('.heading-name > a:nth-child(1)').text();
    movieInfo.url = `${baseUrl}${$('.heading-name > a:nth-child(1)').attr('href')}`;
    movieInfo.cover = match[1];
    movieInfo.image = $('.m_i-d-poster > .film-poster > img:nth-child(1)').attr('src');
    movieInfo.description = $('.m_i-d-content > .description').text();
    movieInfo.releaseDate = $('.m_i-d-content > .elements > .row-line:nth-child(3)').text().replace('Released: ', '').trim();
    movieInfo.type = movieInfo.id.split('/')[0] === 'movie' ? types_1.MovieType.MOVIE : types_1.MovieType.TVSERIES;
    movieInfo.country = {
        title: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('title'),
        url: $('.m_i-d-content > .elements > .row-line:nth-child(1) > a').attr('href')?.slice(1),
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
        recommendedArr.push((0, exports.setMovieData)($(el), baseUrl));
    });
    movieInfo.recommended = recommendedArr;
};
exports.setMovieInfo = setMovieInfo;
//# sourceMappingURL=index.js.map