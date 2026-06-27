"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const rssAggregator_1 = require("../services/rssAggregator");
function startCronJobs() {
    // RSS aggregation: every 6 hours at minute 0
    node_cron_1.default.schedule('0 */6 * * *', async () => {
        console.log('[CRON] RSS aggregation starting...');
        try {
            const { total, errors } = await (0, rssAggregator_1.runAggregator)();
            if (errors.length) {
                console.warn(`[CRON] ${errors.length} source error(s):`, errors);
            }
            console.log(`[CRON] RSS aggregation complete — ${total} new articles`);
        }
        catch (err) {
            console.error('[CRON] RSS aggregation failed:', err);
        }
    });
    console.log('[CRON] Scheduled: RSS aggregation every 6 hours');
}
