import { MOVIES } from "../src";

(async () => {
    const FlixHQ = new MOVIES.FlixHQ();
    const data = await FlixHQ.home();
    console.log(data);
})();