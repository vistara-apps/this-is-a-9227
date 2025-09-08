import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripe = await loadStripe(stripePublishableKey)

// Subscription tier configurations matching the PRD
export const subscriptionTiers = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    clearances: 3,
    searches: 10,
    features: [
      'Limited sample searches',
      'Basic clearance requests',
      'Community support'
    ]
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 15,
    priceId: 'price_creator_monthly', // Replace with actual Stripe price ID
    clearances: 10,
    searches: 100,
    features: [
      'Extended sample searches',
      'Priority clearance processing',
      'Email support',
      'Advanced analytics'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    clearances: -1, // Unlimited
    searches: -1, // Unlimited
    features: [
      'Unlimited sample searches',
      'Unlimited clearance requests',
      'Direct agent outreach',
      'Premium support',
      'Advanced analytics',
      'API access'
    ]
  }
}

export const createCheckoutSession = async (priceId, userId) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl: `${window.location.origin}/app?success=true`,
        cancelUrl: `${window.location.origin}/app?canceled=true`,
      }),
    })

    const session = await response.json()
    
    if (session.error) {
      throw new Error(session.error)
    }

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const createPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/app/settings`,
      }),
    })

    const session = await response.json()
    
    if (session.error) {
      throw new Error(session.error)
    }

    // Redirect to Stripe Customer Portal
    window.location.href = session.url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}
