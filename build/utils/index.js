"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJson = exports.setMovieData = void 0;
const types_1 = require("../types/types");
const setMovieData = ($, el, baseUrl) => {
    const releaseDate = $(el).find('.film-detail > .fd-infor > .fdi-item:nth-child(1)').text();
    const totalEpisodes = $(el).find('.film-detail > .fd-infor > span:nth-child(3)').text();
    const movieData = {
        id: $(el).find('.film-poster > .film-poster-ahref').attr('href')?.slice(1),
        title: $(el).find('.film-detail > .film-name > a').attr('title'),
        url: `${baseUrl}${$(el).find('.film-detail > .film-name > a').attr('href')}`,
        image: $(el).find('.film-poster-img').attr('data-src'),
        releaseDate: isNaN(parseInt(releaseDate)) ? null : releaseDate,
        type: $(el).find('.film-detail > .fd-infor > .fdi-type').text() === 'Movie' ? types_1.MovieType.MOVIE : types_1.MovieType.TVSERIES,
        duration: $(el).find('.film-detail > .fd-infor > .fdi-duration').text(),
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
//# sourceMappingURL=index.js.map