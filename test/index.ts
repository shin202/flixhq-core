import { MOVIES } from "../src";

(async () => {
    const FlixHQ = new MOVIES.FlixHQ();
    const data = await FlixHQ.fetchMovieInfo('tv/watch-junji-ito-maniac-japanese-tales-of-the-macabre-92398');
    console.log(data);
})();