"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  TrendingUp,
  Target,
  Shield,
  Zap,
  Brain,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  const [formData, setFormData] = useState({ name: "", email: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: TrendingUp,
      title: "90-Day Money Forecast",
      description: "See your future balance with P10, P50, and P90 confidence bands using Monte Carlo simulation",
      color: "text-purple",
      bgColor: "bg-purple/10",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get smart actions, risk alerts, and spending pattern analysis to make better decisions",
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: Target,
      title: "Smart Goal Prioritization",
      description: "Automatically rank your savings goals by urgency, impact, and feasibility",
      color: "text-purple",
      bgColor: "bg-purple/10",
    },
    {
      icon: Shield,
      title: "Risk Detection",
      description: "Proactive alerts for low balance, potential overdrafts, and unusual spending patterns",
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: DollarSign,
      title: "Safe-to-Save Calculator",
      description: "Know exactly how much you can save without compromising your financial runway",
      color: "text-purple",
      bgColor: "bg-purple/10",
    },
    {
      icon: Zap,
      title: "FlowScore™",
      description: "Your financial wellness score (0-100) based on cash stability, savings rate, and consistency",
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
  ]

  const stats = [
    { value: "$200+/mo", label: "Average user saves", icon: DollarSign },
    { value: "2 weeks", label: "Forecast improves within", icon: Calendar },
    { value: "85%+", label: "Forecast confidence score", icon: TrendingUp },
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Connect Your Accounts",
      description: "Securely link your bank accounts through trusted providers like Plaid (read-only access)",
    },
    {
      step: "2",
      title: "Get Your Forecast",
      description: "Our AI analyzes your transaction history and generates a 90-day probabilistic forecast",
    },
    {
      step: "3",
      title: "Take Smart Actions",
      description: "Receive personalized recommendations for saving, spending, and avoiding financial risks",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({ name: "", email: "" })
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 tap-target">
              <Image
                src="/icons/icon-192x192.png"
                alt="SaverFlow"
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-bold text-white">SaverFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors tap-target">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors tap-target">
                Pricing
              </Link>
              <Link href="#security" className="text-sm text-gray-300 hover:text-white transition-colors tap-target">
                Security
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white tap-target p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 border-t border-white/10"
            >
              <div className="flex flex-col gap-4">
                <Link
                  href="#features"
                  className="text-white hover:text-gray-300 transition-colors tap-target py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-white hover:text-gray-300 transition-colors tap-target py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#security"
                  className="text-white hover:text-gray-300 transition-colors tap-target py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Security
                </Link>
                <Link href="/auth/login" className="tap-target" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent w-full"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <section className="bg-navy px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 pt-24 sm:pt-28 lg:pt-32">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Predict your next <span className="text-purple">90 days</span> of <span className="text-teal">money</span>
            </h1>
            <p className="mt-4 sm:mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-gray-300">
              so you can <span className="text-purple">relax</span> and <span className="text-purple">spend</span> with{" "}
              <span className="text-teal">confidence</span>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 sm:mt-6 md:mt-8 text-center max-w-3xl mx-auto text-base sm:text-lg leading-relaxed text-gray-300"
          >
            See your future balance with AI-powered forecasting, get smart savings suggestions, and avoid financial
            surprises before they happen.
          </motion.p>
        </div>
      </section>

      <section className="relative px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="container mx-auto -mt-12 sm:-mt-16 max-w-md"
        >
          <Card className="p-6 sm:p-8 shadow-2xl bg-white">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">Join the Waitlist</h3>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Be the first to experience SaverFlow</p>

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
                  className="mt-1 h-11 sm:h-12"
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
                  className="mt-1 h-11 sm:h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple hover:bg-purple/90 h-11 sm:h-12 text-base sm:text-lg"
              >
                {isSubmitting ? "Joining..." : "Get early access"}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>Thanks! We'll invite you as soon as we open the doors.</span>
                </motion.div>
              )}
            </form>

            <p className="mt-4 text-xs text-center text-muted-foreground">
              Your data is safe—bank-level encryption, read-only access
            </p>
          </Card>
        </motion.div>
      </section>

      <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Powerful features for financial confidence
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-base sm:text-lg text-muted-foreground">
              Advanced AI and data science to help you make smarter money decisions
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-12 sm:mt-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              How it works
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-12 sm:mt-16 grid gap-4 sm:gap-6 md:grid-cols-3"
          >
            {howItWorks.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 sm:p-8 text-center h-full">
                  <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-purple/10 text-xl sm:text-2xl font-bold text-purple">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={containerVariants}
          className="container mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-3"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-6 sm:p-8 text-center">
                <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 mx-auto items-center justify-center rounded-full bg-purple/10">
                  <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-purple" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-purple">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-navy px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">Your security is our priority</h2>
            <p className="mt-4 sm:mt-6 md:mt-8 text-base sm:text-lg text-gray-300">
              Bank-level encryption, read-only access, and you're always in control
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-12 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Shield, text: "Bank-level encryption" },
              { icon: CheckCircle2, text: "Read-only access" },
              { icon: Shield, text: "Disconnect anytime" },
              { icon: Shield, text: "Delete your data" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center gap-3 rounded-xl bg-white/10 p-4 sm:p-6 backdrop-blur-sm"
              >
                <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-teal" />
                <span className="text-xs sm:text-sm font-medium text-white text-center">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-4xl text-center"
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-purple/5 to-teal/5">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Sleep well at night</h2>
            <p className="mt-4 sm:mt-6 md:mt-8 text-base sm:text-lg leading-relaxed text-muted-foreground">
              Not wondering if you have enough. Not stressing about surprise expenses. Just knowing what's ahead and how
              to stay ready.
            </p>
            <div className="mt-8 sm:mt-10">
              <Button
                size="lg"
                className="bg-purple hover:bg-purple/90 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg h-12 sm:h-14"
              >
                Join the waitlist
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Improved mobile spacing for footer */}
      <footer className="bg-navy px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/icons/icon-192x192.png"
                alt="SaverFlow"
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-bold text-white">SaverFlow</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
            © 2025 SaverFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
