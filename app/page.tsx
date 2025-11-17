'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarRange, PiggyBank, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HomePage() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const features = [
    {
      id: 'connect',
      title: 'Connect safely',
      description: 'Read-only links to your accounts. Bank-grade encryption and no access to move your money.',
      icon: ShieldCheck,
    },
    {
      id: 'forecast',
      title: 'See your forecast',
      description: 'A 90 day view with confidence bands so you can spot dry spells before they hit.',
      icon: CalendarRange,
    },
    {
      id: 'smartsave',
      title: 'Save smarter',
      description: 'Gentle nudges for small transfers that stretch your runway and build cushions.',
      icon: PiggyBank,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({ name: '', email: '' })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-[#1A2B3C] px-6 pb-24 pt-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C7F366]">Feel calm again</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#FAFAFA] md:text-6xl">
            See your next 90 days of money before it happens.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#7BA4CC]">
            SaverFlow shows your future balance, predicts expenses, and offers small saving suggestions so you never have
            to guess. No spreadsheets. No guilt. Just clarity.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" className="bg-[#C7F366] text-[#1A2B3C] hover:bg-[#B5E355]">
              Start free
            </Button>
            <Button size="lg" variant="outline" className="border-[#7BA4CC] text-[#7BA4CC] hover:bg-[#7BA4CC]/10">
              Join the waitlist
            </Button>
          </div>
          <p className="mt-6 text-sm text-[#7BA4CC]/60">Secure read only. We never move your money.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            No guesswork. Just a clear view of what is coming.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            SaverFlow brings your cash flow, forecast, and smart saving prompts together in one calm place.
          </p>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.id} className="flex flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#4A90E2]/10">
                  <feature.icon className="h-6 w-6 text-[#4A90E2]" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="bg-muted/30 px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Get early access</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Feel good about your money again.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Leave your email and we'll let you know as soon as the trial is ready. No spam. We promise.
          </p>
          
          <form onSubmit={handleSubmit} className="mt-8 max-w-xl">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Taylor Reed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href="/pricing">
                <Button type="button" variant="ghost" className="text-[#4A90E2]">
                  See pricing
                </Button>
              </Link>
            </div>

            {submitStatus === 'success' && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                Thanks! We will invite you as soon as we open the doors.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                Something went wrong. Please try again in a moment.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#1A2B3C] px-8 py-12 text-center shadow-lg">
          <h2 className="text-3xl font-semibold text-[#FAFAFA]">You deserve to sleep well at night.</h2>
          <p className="mt-4 text-lg leading-relaxed text-[#7BA4CC]">
            Not wondering if you have enough. Not stressing about surprise expenses. Just knowing what's ahead and how
            to stay ready.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" className="bg-[#C7F366] text-[#1A2B3C] hover:bg-[#B5E355]">
              Get started
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
