"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Landmark, ArrowRight, CheckCircle } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    preferredCurrency: "USD",
    safetyBuffer: "500",
  })

  const handleSubmit = async () => {
    // Update user profile via server action
    // Then redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome to SaverFlow</h1>
            <p className="mt-2 text-muted-foreground">Let's set up your account in just a few steps</p>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select
                    value={formData.preferredCurrency}
                    onValueChange={(value) => setFormData({ ...formData, preferredCurrency: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="buffer">Safety Buffer Amount</Label>
                  <Input
                    id="buffer"
                    type="number"
                    value={formData.safetyBuffer}
                    onChange={(e) => setFormData({ ...formData, safetyBuffer: e.target.value })}
                    placeholder="500"
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Minimum balance you want to maintain</p>
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-purple hover:bg-purple/90" size="lg">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-purple/10 p-6">
                    <Landmark className="h-12 w-12 text-purple" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground">Connect Your Bank Account</h2>
                  <p className="mt-2 text-muted-foreground">
                    We use Plaid to securely connect to your bank with read-only access
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  {[
                    "Bank-level 256-bit encryption",
                    "Read-only access (we can never move money)",
                    "Disconnect anytime from settings",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-teal" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-purple hover:bg-purple/90">
                    Connect Bank Account
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
