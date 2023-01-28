"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
(async () => {
    const FlixHQ = new src_1.MOVIES.FlixHQ();
    const data = await FlixHQ.home();
    console.log(data);
})();
//# sourceMappingURL=index.js.map