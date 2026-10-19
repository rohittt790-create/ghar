"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOwner = exports.updateOwner = exports.createOwner = exports.getOwnerById = exports.getOwners = void 0;
const Owner_js_1 = require("../models/Owner.js");
const Property_js_1 = require("../models/Property.js");
const upload_js_1 = require("../middleware/upload.js");
const getOwners = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { search, city, sort = '-createdAt' } = req.query;
        let filter = { createdBy: userId };
        if (search) {
            const searchRegex = new RegExp(String(search), 'i');
            filter = {
                createdBy: userId,
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex },
                    { address: searchRegex },
                    { city: searchRegex },
                ],
            };
        }
        if (city) {
            filter.city = new RegExp(String(city), 'i');
        }
        const owners = await Owner_js_1.Owner.find(filter).sort(String(sort));
        // Attach property count for each owner
        const ownersWithProperties = await Promise.all(owners.map(async (owner) => {
            const properties = await Property_js_1.Property.find({ owner: owner._id, createdBy: userId }).select('propertyId name status progressPercentage coverPhoto');
            return {
                ...owner.toObject(),
                propertiesCount: properties.length,
                properties,
            };
        }));
        res.status(200).json({
            success: true,
            count: ownersWithProperties.length,
            owners: ownersWithProperties,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching owners' });
    }
};
exports.getOwners = getOwners;
const getOwnerById = async (req, res) => {
    try {
        const userId = req.user?._id;
        const owner = await Owner_js_1.Owner.findOne({ _id: req.params.id, createdBy: userId });
        if (!owner) {
            res.status(404).json({ success: false, message: 'Owner not found' });
            return;
        }
        const properties = await Property_js_1.Property.find({ owner: owner._id, createdBy: userId });
        // Compute average progress across properties
        const totalProgress = properties.reduce((sum, p) => sum + (p.progressPercentage || 0), 0);
        const averageProgress = properties.length > 0 ? Math.round(totalProgress / properties.length) : 0;
        res.status(200).json({
            success: true,
            owner: {
                ...owner.toObject(),
                properties,
                propertiesCount: properties.length,
                averageProgress,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching owner' });
    }
};
exports.getOwnerById = getOwnerById;
const createOwner = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { name, email, phone, address, city, state, zipCode, notes, emergencyContact } = req.body;
        if (!name || !phone || !address) {
            res.status(400).json({ success: false, message: 'Name, phone number, and address are required.' });
            return;
        }
        let profilePicture = '';
        if (req.file) {
            profilePicture = await (0, upload_js_1.processUploadedFile)(req.file);
        }
        else if (req.body.profilePicture) {
            profilePicture = req.body.profilePicture;
        }
        let parsedEmergencyContact;
        if (typeof emergencyContact === 'string') {
            try {
                parsedEmergencyContact = JSON.parse(emergencyContact);
            }
            catch (e) {
                parsedEmergencyContact = { name: '', phone: '', relationship: '' };
            }
        }
        else {
            parsedEmergencyContact = emergencyContact;
        }
        const owner = await Owner_js_1.Owner.create({
            name,
            email: email || '',
            phone,
            address,
            city: city || '',
            state: state || '',
            zipCode: zipCode || '',
            profilePicture,
            notes: notes || '',
            emergencyContact: parsedEmergencyContact,
            createdBy: userId,
        });
        res.status(201).json({
            success: true,
            message: 'Owner created successfully',
            owner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating owner' });
    }
};
exports.createOwner = createOwner;
const updateOwner = async (req, res) => {
    try {
        const userId = req.user?._id;
        const owner = await Owner_js_1.Owner.findOne({ _id: req.params.id, createdBy: userId });
        if (!owner) {
            res.status(404).json({ success: false, message: 'Owner not found' });
            return;
        }
        const { name, email, phone, address, city, state, zipCode, notes, emergencyContact } = req.body;
        if (name)
            owner.name = name;
        if (email !== undefined)
            owner.email = email;
        if (phone)
            owner.phone = phone;
        if (address)
            owner.address = address;
        if (city !== undefined)
            owner.city = city;
        if (state !== undefined)
            owner.state = state;
        if (zipCode !== undefined)
            owner.zipCode = zipCode;
        if (notes !== undefined)
            owner.notes = notes;
        if (req.file) {
            owner.profilePicture = await (0, upload_js_1.processUploadedFile)(req.file);
        }
        else if (req.body.profilePicture !== undefined) {
            owner.profilePicture = req.body.profilePicture;
        }
        if (emergencyContact) {
            let parsed;
            if (typeof emergencyContact === 'string') {
                try {
                    parsed = JSON.parse(emergencyContact);
                }
                catch (e) {
                    parsed = owner.emergencyContact;
                }
            }
            else {
                parsed = emergencyContact;
            }
            owner.emergencyContact = parsed;
        }
        await owner.save();
        res.status(200).json({
            success: true,
            message: 'Owner updated successfully',
            owner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating owner' });
    }
};
exports.updateOwner = updateOwner;
const deleteOwner = async (req, res) => {
    try {
        const userId = req.user?._id;
        const owner = await Owner_js_1.Owner.findOne({ _id: req.params.id, createdBy: userId });
        if (!owner) {
            res.status(404).json({ success: false, message: 'Owner not found' });
            return;
        }
        // Check if owner has associated properties
        const propertyCount = await Property_js_1.Property.countDocuments({ owner: owner._id, createdBy: userId });
        if (propertyCount > 0) {
            res.status(400).json({
                success: false,
                message: `Cannot delete owner. There are ${propertyCount} propert${propertyCount === 1 ? 'y' : 'ies'} assigned to this owner. Please reassign or delete the properties first.`,
            });
            return;
        }
        await Owner_js_1.Owner.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Owner deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting owner' });
    }
};
exports.deleteOwner = deleteOwner;
