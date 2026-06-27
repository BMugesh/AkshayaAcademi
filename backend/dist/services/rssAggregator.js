"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndSaveSource = fetchAndSaveSource;
exports.runAggregator = runAggregator;
const rss_parser_1 = __importDefault(require("rss-parser"));
const News_1 = require("../models/News");
const NewsSource_1 = require("../models/NewsSource");
const aiSummarizer_1 = require("./aiSummarizer");
const parser = new rss_parser_1.default({
    timeout: 12_000,
    maxRedirects: 5,
    headers: { 'User-Agent': 'AkshayaAkademics-NewsBot/1.0' },
});
async function fetchAndSaveSource(source) {
    const feed = await parser.parseURL(source.rssUrl);
    let saved = 0;
    for (const item of feed.items.slice(0, 15)) {
        if (!item.title)
            continue;
        // Deduplicate by source URL or identical title
        const dupQuery = [{ title: item.title }];
        if (item.link)
            dupQuery.push({ sourceUrl: item.link });
        const exists = await News_1.News.findOne({ $or: dupQuery });
        if (exists)
            continue;
        const rawContent = item.content || item.contentSnippet || item.summary || '';
        const textForAI = rawContent.slice(0, 3000);
        // Run AI in parallel; graceful fallback if Groq is unavailable
        const [aiSummary, category] = await Promise.all([
            (0, aiSummarizer_1.generateAiSummary)(item.title, textForAI).catch(() => ''),
            (0, aiSummarizer_1.categorizeArticle)(item.title, textForAI).catch(() => 'General Education'),
        ]);
        const summary = (aiSummary || rawContent).slice(0, 400) || item.title;
        const content = rawContent || item.title;
        const article = new News_1.News({
            title: item.title.slice(0, 200),
            summary,
            content,
            sourceUrl: item.link || '',
            universityName: source.universityName,
            country: source.country,
            author: source.universityName,
            status: 'published',
            publishDate: item.isoDate ? new Date(item.isoDate) : new Date(),
            category,
            aiSummary: aiSummary || '',
            isAutoFetched: true,
            tags: [],
        });
        await article.save();
        saved++;
    }
    await NewsSource_1.NewsSource.findByIdAndUpdate(source._id, {
        lastFetched: new Date(),
        $inc: { totalFetched: saved },
        $unset: { lastError: '' },
    });
    return saved;
}
async function runAggregator() {
    const sources = await NewsSource_1.NewsSource.find({ active: true });
    let total = 0;
    const errors = [];
    for (const source of sources) {
        try {
            const count = await fetchAndSaveSource(source);
            total += count;
            console.log(`[RSS] ${source.universityName}: +${count} new articles`);
        }
        catch (err) {
            const msg = `${source.universityName}: ${err.message}`;
            errors.push(msg);
            console.error(`[RSS] Error — ${msg}`);
            await NewsSource_1.NewsSource.findByIdAndUpdate(source._id, { lastError: err.message }).catch(() => { });
        }
    }
    console.log(`[RSS] Aggregation done: ${total} total new articles, ${errors.length} source errors`);
    return { total, errors };
}
