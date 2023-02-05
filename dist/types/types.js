"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingServers = exports.Filter = exports.MovieReport = exports.MovieType = void 0;
var MovieType;
(function (MovieType) {
    MovieType["MOVIE"] = "movie";
    MovieType["TVSERIES"] = "tv-show";
    MovieType["ALL"] = "all";
})(MovieType = exports.MovieType || (exports.MovieType = {}));
var MovieReport;
(function (MovieReport) {
    MovieReport["TRENDING"] = "Trending";
    MovieReport["LATEST_MOVIE"] = "Latest Movies";
    MovieReport["LATEST_TV_SHOWS"] = "Latest TV Shows";
    MovieReport["COMING_SOON"] = "Coming Soon";
})(MovieReport = exports.MovieReport || (exports.MovieReport = {}));
var Filter;
(function (Filter) {
    Filter["GENRE"] = "genre";
    Filter["COUNTRY"] = "country";
})(Filter = exports.Filter || (exports.Filter = {}));
var StreamingServers;
(function (StreamingServers) {
    StreamingServers["UpCloud"] = "UpCloud";
    StreamingServers["VidCloud"] = "Vidcloud";
    StreamingServers["MixDrop"] = "MixDrop";
})(StreamingServers = exports.StreamingServers || (exports.StreamingServers = {}));
//# sourceMappingURL=types.js.map