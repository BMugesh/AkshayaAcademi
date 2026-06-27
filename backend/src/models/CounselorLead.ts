import mongoose, { Document, Schema } from 'mongoose';

export interface ICounselorLead extends Document {
    user?: mongoose.Types.ObjectId;
    university?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    universityName?: string;
    message?: string;
    status: 'Pending' | 'Contacted' | 'Closed';
    createdAt: Date;
    updatedAt: Date;
}

const CounselorLeadSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
        university: { type: Schema.Types.ObjectId, ref: 'University', index: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        universityName: { type: String, trim: true },
        message: { type: String, trim: true },
        status: { type: String, enum: ['Pending', 'Contacted', 'Closed'], default: 'Pending', index: true },
    },
    { timestamps: true }
);

export const CounselorLead = mongoose.model<ICounselorLead>('CounselorLead', CounselorLeadSchema);
