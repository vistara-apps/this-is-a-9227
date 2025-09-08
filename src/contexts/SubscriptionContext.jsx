import React, { createContext, useContext, useState, useEffect } from 'react'
import { subscriptionTiers, createCheckoutSession, createPortalSession } from '../services/stripe.js'
import { userService } from '../services/api.js'
import { useAuth } from './AuthContext'
import { SubscriptionError, asyncHandler } from '../utils/errors.js'
import toast from 'react-hot-toast'

const SubscriptionContext = createContext()

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [clearancesUsed, setClearancesUsed] = useState(0)
  const [searchesUsed, setSearchesUsed] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load user's subscription data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setSubscriptionTier(user.subscriptionTier || 'free')
      // In a real app, you'd load usage stats from the database
      setClearancesUsed(0)
      setSearchesUsed(0)
    }
  }, [isAuthenticated, user])

  const upgradeTier = asyncHandler(async (tierId) => {
    if (!isAuthenticated || !user) {
      throw new SubscriptionError('Please log in to upgrade your subscription')
    }

    const tier = subscriptionTiers[tierId]
    if (!tier) {
      throw new SubscriptionError('Invalid subscription tier')
    }

    if (tier.price === 0) {
      // Free tier - just update locally
      await userService.updateUser(user.userId, { subscriptionTier: tierId })
      setSubscriptionTier(tierId)
      toast.success('Subscription updated!')
      return
    }

    setLoading(true)
    try {
      // Create Stripe checkout session
      await createCheckoutSession(tier.priceId, user.userId)
    } catch (error) {
      setLoading(false)
      throw error
    }
  })

  const manageBilling = asyncHandler(async () => {
    if (!isAuthenticated || !user) {
      throw new SubscriptionError('Please log in to manage billing')
    }

    if (!user.stripeCustomerId) {
      throw new SubscriptionError('No billing information found')
    }

    await createPortalSession(user.stripeCustomerId)
  })

  const canUseClearance = () => {
    const tier = subscriptionTiers[subscriptionTier]
    if (!tier) return false
    return tier.clearances === -1 || clearancesUsed < tier.clearances
  }

  const canUseSearch = () => {
    const tier = subscriptionTiers[subscriptionTier]
    if (!tier) return false
    return tier.searches === -1 || searchesUsed < tier.searches
  }

  const useClearance = () => {
    if (!canUseClearance()) {
      const tier = subscriptionTiers[subscriptionTier]
      throw new SubscriptionError(
        `You've reached your clearance limit of ${tier.clearances} for the ${tier.name} plan. Please upgrade to continue.`,
        subscriptionTier
      )
    }
    
    setClearancesUsed(prev => prev + 1)
    return true
  }

  const useSearch = () => {
    if (!canUseSearch()) {
      const tier = subscriptionTiers[subscriptionTier]
      throw new SubscriptionError(
        `You've reached your search limit of ${tier.searches} for the ${tier.name} plan. Please upgrade to continue.`,
        subscriptionTier
      )
    }
    
    setSearchesUsed(prev => prev + 1)
    return true
  }

  const getRemainingClearances = () => {
    const tier = subscriptionTiers[subscriptionTier]
    if (!tier || tier.clearances === -1) return -1 // Unlimited
    return Math.max(0, tier.clearances - clearancesUsed)
  }

  const getRemainingSearches = () => {
    const tier = subscriptionTiers[subscriptionTier]
    if (!tier || tier.searches === -1) return -1 // Unlimited
    return Math.max(0, tier.searches - searchesUsed)
  }

  const getCurrentTier = () => {
    return subscriptionTiers[subscriptionTier] || subscriptionTiers.free
  }

  const isUpgradeRequired = (feature) => {
    const tier = getCurrentTier()
    
    switch (feature) {
      case 'clearance':
        return !canUseClearance()
      case 'search':
        return !canUseSearch()
      case 'analytics':
        return subscriptionTier === 'free'
      case 'api':
        return subscriptionTier !== 'pro'
      case 'priority_support':
        return subscriptionTier === 'free'
      default:
        return false
    }
  }

  return (
    <SubscriptionContext.Provider value={{
      subscriptionTier,
      clearancesUsed,
      searchesUsed,
      loading,
      tiers: subscriptionTiers,
      upgradeTier,
      manageBilling,
      canUseClearance,
      canUseSearch,
      useClearance,
      useSearch,
      getRemainingClearances,
      getRemainingSearches,
      getCurrentTier,
      isUpgradeRequired
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
