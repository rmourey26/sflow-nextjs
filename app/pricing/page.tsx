export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold">Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Simple, transparent pricing for SaverFlow.
        </p>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-2xl font-semibold">Free</h3>
            <p className="mt-2 text-3xl font-bold">$0</p>
            <p className="text-muted-foreground">per month</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>1 connected account</li>
              <li>30-day forecast</li>
              <li>Basic insights</li>
            </ul>
          </div>
          
          <div className="rounded-lg border-2 border-[#4A90E2] bg-card p-6">
            <div className="mb-2 inline-block rounded-full bg-[#4A90E2]/10 px-3 py-1 text-xs font-medium text-[#4A90E2]">
              Popular
            </div>
            <h3 className="text-2xl font-semibold">Pro</h3>
            <p className="mt-2 text-3xl font-bold">$9</p>
            <p className="text-muted-foreground">per month</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>Unlimited accounts</li>
              <li>90-day forecast</li>
              <li>Smart savings suggestions</li>
              <li>Priority support</li>
            </ul>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-2xl font-semibold">Enterprise</h3>
            <p className="mt-2 text-3xl font-bold">Custom</p>
            <p className="text-muted-foreground">contact us</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>Everything in Pro</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>SLA guarantee</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
