import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  PRO: {
    name: 'Pro',
    price: 2,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
  BUSINESS: {
    name: 'Business',
    price: 10,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
  },
} as const

export const PLAN_LIMITS = {
  FREE: { maxApps: 3, teamMembers: false },
  PRO: { maxApps: Infinity, teamMembers: false },
  BUSINESS: { maxApps: Infinity, teamMembers: true },
} as const
