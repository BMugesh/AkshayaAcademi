import mongoose, { Document, Schema } from 'mongoose';

export type NewsCategory =
    | 'Admission Updates'
    | 'Scholarships'
    | 'University Rankings'
    | 'Placements'
    | 'Visa & Immigration'
    | 'Campus Updates'
    | 'General Education';

export type NewsStatus = 'draft' | 'published';

export interface INews extends Document {
    title: string;
    slug: string;
    summary: string;
    content: string;
    featuredImage?: string;
    category: NewsCategory;
    tags: string[];
    universityName?: string;
    country?: string;
    author: string;
    status: NewsStatus;
    featured: boolean;
    views: number;
    publishDate?: Date;
    relatedUniversity?: string;
    publishedDate?: Date;
    // AI & RSS fields
    aiSummary?: string;
    sourceUrl?: string;
    isAutoFetched?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .slice(0, 100);
};

const NewsSchema: Schema = new Schema(
    {
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
    },
    { timestamps: true }
);

// Auto-generate slug before save
NewsSchema.pre<INews>('save', async function () {
    if (this.universityName && !this.relatedUniversity) {
        this.relatedUniversity = this.universityName;
    } else if (this.relatedUniversity && !this.universityName) {
        this.universityName = this.relatedUniversity;
    }
    if (this.publishDate && !this.publishedDate) {
        this.publishedDate = this.publishDate;
    } else if (this.publishedDate && !this.publishDate) {
        this.publishDate = this.publishedDate;
    }

    if (!this.isModified('title') && this.slug) return;
    const base = generateSlug(this.title);
    let slug = base;
    let counter = 1;
    while (await (this.constructor as any).findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${base}-${counter++}`;
    }
    this.slug = slug;
});

NewsSchema.index({ status: 1, publishDate: -1 });
NewsSchema.index({ category: 1 });
NewsSchema.index({ featured: 1 });

export const News = mongoose.model<INews>('News', NewsSchema);
