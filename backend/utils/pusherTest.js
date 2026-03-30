const pusher = require("../config/pusher");

const testPusher = async () => {
    console.log("🚀 Starting Pusher Connectivity Test...");
    
    const testPayload = {
        message: "Neural Sync Test Successful",
        timestamp: new Date().toISOString(),
        geo: "Silicon Valley"
    };

    try {
        // Trigger a global test event
        await pusher.trigger("global", "pusher-test", testPayload);
        console.log("✅ Global Event Triggered Successfully");

        // Trigger a mock user notification
        const mockUserId = "test-user-123";
        await pusher.trigger(`user-${mockUserId}`, "notification", testPayload);
        console.log(`✅ User-Specific Event Triggered (Channel: user-${mockUserId})`);

        console.log("\n--- TEST SUMMARY ---");
        console.log("Pusher Instance: OK");
        console.log("API Connectivity: OK");
        console.log("Payload Delivery: SENT");
        console.log("\nVerification: check the 'Debug Console' in your Pusher Dashboard to confirm receipt.");
        
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Pusher Test Failed!");
        console.error("Error Detail:", error.message);
        console.log("\nChecklist:");
        console.log("1. Ensure PUSHER_APP_ID, KEY, SECRET, and CLUSTER are set in .env");
        console.log("2. Ensure your IP is allowed in Pusher App Settings (if IP restriction is on)");
        console.log("3. Ensure your Pusher account hasn't exceeded its message limit");
        
        process.exit(1);
    }
};

testPusher();
