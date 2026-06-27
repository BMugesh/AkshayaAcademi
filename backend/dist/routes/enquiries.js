"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const CounselorLead_1 = require("../models/CounselorLead");
const University_1 = require("../models/University");
// Helper to optionally extract userId from cookie
function tryGetUserId(req) {
    const token = req.cookies?.token;
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded.id || decoded._id || null;
    }
    catch {
        return null;
    }
}
// @route   POST /api/enquiries
// @desc    Receive an enquiry form submission and send email via EmailJS
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, country, service, message } = req.body;
        // Basic validation
        if (!name || !email || !phone || !country || !service) {
            res.status(400).json({ message: 'Please fill in all required fields' });
            return;
        }
        const templateId = process.env.EMAILJS_TEMPLATE_ID_ENQUIRY;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY;
        if (!templateId || !publicKey || !privateKey) {
            console.error("Missing EmailJS environment variables for Enquiry");
            res.status(500).json({ message: 'Email service configuration error' });
            return;
        }
        // Match these keys to your EmailJS Template variables
        const templateParams = {
            from_name: name,
            to_name: "Akshaya Akademics Admin",
            from_email: email,
            phone: phone,
            country: country,
            service: service,
            message: message || 'No message provided.',
            reply_to: email,
        };
        await (0, email_1.sendEmail)(templateId, templateParams, publicKey, privateKey);
        res.status(200).json({ message: 'Enquiry sent successfully' });
    }
    catch (error) {
        console.error('Failed to process enquiry:', error);
        res.status(500).json({ message: 'Failed to send enquiry. Please try again later.' });
    }
});
// @route   POST /api/enquiries/counselor
// @desc    Submit a counselor enquiry, save as CounselorLead
// @access  Public
router.post('/counselor', async (req, res) => {
    try {
        const { name, email, phone, universityId, universityName, message } = req.body;
        if (!name || !email || !phone) {
            res.status(400).json({ message: 'Name, email and phone are required' });
            return;
        }
        let universityObj = null;
        let finalUniversityName = universityName;
        if (universityId) {
            universityObj = await University_1.University.findOne({ id: universityId });
            if (!universityObj && String(universityId).match(/^[0-9a-fA-F]{24}$/)) {
                universityObj = await University_1.University.findById(universityId);
            }
            if (universityObj) {
                finalUniversityName = universityObj.name;
            }
        }
        const userId = tryGetUserId(req) || req.body.userId || null;
        await CounselorLead_1.CounselorLead.create({
            user: userId || undefined,
            university: universityObj ? universityObj._id : undefined,
            name,
            email,
            phone,
            universityName: finalUniversityName,
            message,
            status: 'Pending'
        });
        res.status(201).json({ message: 'Your counselor request has been received. We will contact you within 24 hours.' });
    }
    catch (error) {
        console.error('Failed to save counselor lead:', error);
        res.status(500).json({ message: 'Failed to submit request. Please try again.' });
    }
});
exports.default = router;
