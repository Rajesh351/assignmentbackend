import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    experienceLevel: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERT'], required: true },
    candidates: [{ type: String }], // Array of student email IDs
    endDate: { type: Date, required: true },
}, { timestamps: true });


export const Job = mongoose.model('Job', jobSchema);