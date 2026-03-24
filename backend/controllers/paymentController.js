const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

const createCheckoutSession = async (req, res) => {
    const { tier } = req.body;
    
    // Tier details
    const tiers = {
        PRO: {
            amount: 900, // $9.00
            name: "BitShare PRO",
            storage: 10 * 1024 * 1024 * 1024, // 10GB
        },
        ENTERPRISE: {
            amount: 2900, // $29.00
            name: "BitShare ENTERPRISE",
            storage: 100 * 1024 * 1024 * 1024, // 100GB
        }
    };

    if (!tiers[tier]) return res.status(400).json({ message: "Invalid tier" });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: tiers[tier].name,
                            description: `Upgrade to ${tier} with ${tiers[tier].storage / (1024 * 1024 * 1024)}GB storage`,
                        },
                        unit_amount: tiers[tier].amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
            metadata: {
                userId: req.user._id.toString(),
                tier: tier,
                storageLimit: tiers[tier].storage
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { userId, tier, storageLimit } = session.metadata;

        try {
            await User.findByIdAndUpdate(userId, {
                tier: tier,
                storageLimit: parseInt(storageLimit)
            });
            console.log(`User ${userId} upgraded to ${tier}`);
        } catch (error) {
            console.error("Failed to update user after payment", error);
        }
    }

    res.json({ received: true });
};

module.exports = {
    createCheckoutSession,
    handleStripeWebhook
};
