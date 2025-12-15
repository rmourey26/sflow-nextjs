import { getCurrentUser } from "@/lib/actions/user"
import { StripeCheckout } from "@/components/integrations/stripe-checkout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export default async function BillingPage() {
  const user = await getCurrentUser()

  const plans = [
    {
      name: "Free",
      price: "$0",
      tier: "free",
      features: ["90-day forecast", "Up to 2 accounts", "Basic insights", "Email support"],
    },
    {
      name: "Essential",
      price: "$9",
      tier: "essential",
      features: [
        "Everything in Free",
        "Up to 5 accounts",
        "Advanced insights",
        "Smart savings suggestions",
        "Priority support",
      ],
    },
    {
      name: "Pro",
      price: "$19",
      tier: "pro",
      features: [
        "Everything in Essential",
        "Unlimited accounts",
        "AI-powered forecasts",
        "Custom goals",
        "24/7 support",
      ],
    },
  ]

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and payment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {user?.subscription_tier || "free"} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="capitalize">
            {user?.subscription_tier || "free"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.tier} className={plan.tier === user?.subscription_tier ? "border-purple-600" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <StripeCheckout tier={plan.tier} />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
