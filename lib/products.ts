export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  popular?: boolean
}

// This is the source of truth for all products
export const PRODUCTS: Product[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for getting started with financial tracking",
    priceInCents: 0, // Free
    features: ["Up to 3 connected accounts", "30-day forecast", "Basic insights", "Mobile app access"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for serious savers",
    priceInCents: 999, // $9.99/month
    popular: true,
    features: [
      "Unlimited connected accounts",
      "90-day forecast with confidence bands",
      "AI-powered insights",
      "Smart savings recommendations",
      "Goal tracking & prioritization",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete financial control and optimization",
    priceInCents: 1999, // $19.99/month
    features: [
      "Everything in Pro",
      "Custom forecast models",
      "Advanced analytics",
      "Tax optimization insights",
      "Investment tracking",
      "Dedicated account manager",
    ],
  },
]
