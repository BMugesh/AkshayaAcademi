"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.News = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .slice(0, 100);
};
const NewsSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    summary: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    featuredImage: { type: String, trim: true },
    category: {
        type: String,
        enum: ['Admission Updates', 'Scholarships', 'University Rankings', 'Placements', 'Visa & Immigration', 'Campus Updates', 'General Education'],
        required: true,
    },
    tags: [{ type: String, trim: true }],
    universityName: { type: String, trim: true },
    relatedUniversity: { type: String, trim: true },
    country: { type: String, trim: true },
    author: { type: String, required: true, trim: true, default: 'Akshaya Akademics' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    publishDate: { type: Date },
    publishedDate: { type: Date },
    aiSummary: { type: String, trim: true },
    sourceUrl: { type: String, trim: true, index: true, sparse: true },
    isAutoFetched: { type: Boolean, default: false },
}, { timestamps: true });
// Auto-generate slug before save
NewsSchema.pre('save', async function () {
    if (this.universityName && !this.relatedUniversity) {
        this.relatedUniversity = this.universityName;
    }
    else if (this.relatedUniversity && !this.universityName) {
        this.universityName = this.relatedUniversity;
    }
    if (this.publishDate && !this.publishedDate) {
        this.publishedDate = this.publishDate;
    }
    else if (this.publishedDate && !this.publishDate) {
        this.publishDate = this.publishedDate;
    }
    if (!this.isModified('title') && this.slug)
        return;
    const base = generateSlug(this.title);
    let slug = base;
    let counter = 1;
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${base}-${counter++}`;
    }
    this.slug = slug;
});
NewsSchema.index({ status: 1, publishDate: -1 });
NewsSchema.index({ category: 1 });
NewsSchema.index({ featured: 1 });
exports.News = mongoose_1.default.model('News', NewsSchema);
