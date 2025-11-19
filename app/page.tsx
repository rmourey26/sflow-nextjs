'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarRange, PiggyBank, ShieldCheck, ArrowRight, Lock, Shield, X } from 'lucide-react'
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
      title: 'Read-only bank connections',
      description: 'Through trusted providers like Plaid',
      icon: Lock,
    },
    {
      id: 'encrypt',
      title: 'Bank-level encryption',
      description: 'In transit and at rest',
      icon: Shield,
    },
    {
      id: 'disconnect',
      title: 'Disconnect anytime',
      description: 'You control your data',
      icon: X,
    },
    {
      id: 'delete',
      title: 'Delete your data',
      description: 'Available in settings',
      icon: ShieldCheck,
    },
  ]

  const stats = [
    { value: '$200+/mo', label: 'Average user saves' },
    { value: '2 weeks', label: 'Forecast improves within' },
  ]

  const securityBadges = [
    'Stripe Secure',
    'Bank-level Encryption',
    'Cancel Anytime',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({ name: '', email: '' })
    }, 1000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-navy px-6 pb-24 pt-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
              Predict your{' '}
              <span className="text-purple">next</span>{' '}
              <span className="text-purple">90 days</span>{' '}
              of{' '}
              <span className="text-teal">money</span>{' '}
              so you can{' '}
              <span className="text-purple">relax</span>{' '}
              and{' '}
              <span className="text-purple">spend</span>{' '}
              with{' '}
              <span className="text-teal">confidence</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-300"
          >
            See your future balance, predictions, and gentle saving suggestions.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 flex items-center gap-2 text-sm text-gray-400"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Your data is safe with us—bank grade encryption</span>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Card - Floating */}
      <section className="relative px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto -mt-16 max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-foreground">Join the Waitlist</h3>
          <p className="mt-2 text-sm text-muted-foreground">Be the first to experience SaverFlow</p>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-purple hover:bg-purple/90"
            >
              {isSubmitting ? 'Joining...' : 'Get early access'}
            </Button>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
              >
                Thanks! We'll invite you as soon as we open the doors.
              </motion.div>
            )}
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            counts—we never move
          </p>
        </motion.div>
      </section>

      {/* Security Section */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-foreground md:text-5xl">
              Your security is our priority
            </motion.h2>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple/10">
                  <feature.icon className="h-6 w-6 text-purple" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted px-6 py-16 md:px-12 lg:px-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={containerVariants}
          className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-2xl bg-white p-8 text-center shadow-sm"
            >
              <div className="mb-3 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-purple/10">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-purple">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="px-6 py-12 md:px-12 lg:px-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={containerVariants}
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6"
        >
          {securityBadges.map((badge, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-teal" />
              <span className="text-sm font-medium text-foreground">{badge}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Forecast Section */}
      <section className="bg-background px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-foreground md:text-5xl">
              Your financial forecast at a glance
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground">
              See where your money is headed with confidence-scored predictions
            </motion.p>
            
            <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">85% Confidence</span>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 rounded-3xl bg-white p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-foreground">Your 90-day forecast</h3>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-8 bg-gray-400"></div>
                <span className="text-muted-foreground">P10 (Conservative)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-8 bg-purple"></div>
                <span className="text-muted-foreground">P50 (Median)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-8 bg-teal"></div>
                <span className="text-muted-foreground">P90 (Optimistic)</span>
              </div>
            </div>
            <div className="mt-8 h-64 flex items-center justify-center text-muted-foreground">
              [Chart placeholder - forecast visualization]
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl rounded-3xl bg-navy px-8 py-16 text-center shadow-2xl"
        >
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            You deserve to sleep well at night.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-300">
            Not wondering if you have enough. Not stressing about surprise expenses. Just knowing what's ahead and how to stay ready.
          </p>
          <div className="mt-10">
            <Button size="lg" className="bg-purple hover:bg-purple/90 text-white px-8 py-6 text-lg">
              Get started
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
