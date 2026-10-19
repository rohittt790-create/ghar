"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamMembers = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = require("../models/User.js");
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'hometrack_super_secure_jwt_secret_key_2026_dev';
    return jsonwebtoken_1.default.sign({ id: userId }, secret, { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503).json({
                success: false,
                message: 'Database is unreachable. Please ensure 0.0.0.0/0 (Allow Access from Anywhere) is added in MongoDB Atlas -> Network Access.',
            });
            return;
        }
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
            return;
        }
        const existingUser = await User_js_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists with this email address.' });
            return;
        }
        const user = await User_js_1.User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'project_manager',
            phone: phone || '',
        });
        const token = generateToken(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error registering user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503).json({
                success: false,
                message: 'Database is unreachable. Please ensure 0.0.0.0/0 (Allow Access from Anywhere) is added in MongoDB Atlas -> Network Access.',
            });
            return;
        }
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password.' });
            return;
        }
        const user = await User_js_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
            return;
        }
        const token = generateToken(user._id.toString());
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error logging in' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                phone: req.user.phone,
                avatar: req.user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getMe = getMe;
const getTeamMembers = async (_req, res) => {
    try {
        const users = await User_js_1.User.find().select('name email role phone avatar');
        res.status(200).json({ success: true, count: users.length, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getTeamMembers = getTeamMembers;
