const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create checkout session
app.post('/create-checkout', async (req, res) => {
  try {
    const { userId, priceId, successUrl, cancelUrl } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check subscription status
app.post('/check-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Query your database or Stripe for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 1,
      status: 'active',
    });
    
    // Match with userId logic here
    const isActive = subscriptions.data.some(sub => 
      sub.metadata.userId === userId || 
      sub.client_reference_id === userId
    );
    
    res.json({ isActive, plan: isActive ? 'pro' : 'free' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);