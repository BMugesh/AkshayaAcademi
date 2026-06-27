"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Fetch current user's full profile (personal + preferences + education + documents)
router.get('/profile', auth_1.verifyToken, userController_1.getFullProfile);
// Update onboarding progress for a specific step (multi-step registration)
router.put('/profile/step', auth_1.verifyToken, validation_1.onboardingValidation, userController_1.updateOnboarding);
// Update profile — general flat update (used by Edit Profile modal)
router.put('/profile', auth_1.verifyToken, userController_1.updateProfile);
exports.default = router;
