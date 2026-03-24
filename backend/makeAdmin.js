import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOneAndUpdate(
            { email },
            { isAdmin: true, tier: 'ENTERPRISE', storageLimit: 100 * 1024 * 1024 * 1024 },
            { new: true }
        );
        if (user) {
            console.log(`Node ${email} promoted to Administrator.`);
            console.log(`Current Tier: ${user.tier}`);
        } else {
            console.log(`Node ${email} found in sector.`);
        }
    } catch (error) {
        console.error("Governance recalibration failed:", error);
    } finally {
        await mongoose.connection.close();
    }
};

const email = process.argv[2];
if (!email) {
    console.log("Usage: node makeAdmin.js <email>");
    process.exit(1);
}

promoteToAdmin(email);
