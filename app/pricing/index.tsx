import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { PricingCard } from '@/components/PricingCard';
import { Section } from '@/components/Section';
import { useAnalytics } from '@/lib/analytics/provider';

const plans = [
  {
    id: 'essential',
    name: 'Essential',
    monthly: 4.99,
    features: ['Connect up to three accounts', '90 day forecast', 'Weekly insights'],
    description: 'Perfect for staying on top of day-to-day cash flow.',
    valueLine: 'Most users save over $200 per month with SmartSave.',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 9.99,
    features: ['Unlimited accounts', 'What-if scenarios', 'SmartSave suggestions', 'Advanced insights'],
    description: 'Built for freelancers and solo founders who need deeper forecasting.',
    valueLine: 'Includes scenario planning and runway alerts.',
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 14.99,
    features: [
      'All Pro features',
      'Payout and invoice tracking',
      'Tax reserve automation',
      'Priority support',
    ],
    description: 'For small teams managing incoming payments and staying tax ready.',
    valueLine: 'Switching saves an average of 4 hours a week.',
  },
];

export default function PricingScreen() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();
  const { track } = useAnalytics();

  const multiplier = billingCycle === 'monthly' ? 1 : 12 * 0.83;

  const formattedPlans = useMemo(
    () =>
      plans.map((plan) => {
        const monthlyPrice = plan.monthly;
        const displayPrice =
          billingCycle === 'monthly'
            ? `$${monthlyPrice.toFixed(2)}/mo`
            : `$${(monthlyPrice * 12 * 0.83).toFixed(2)}/yr`;
        const valueLine =
          billingCycle === 'yearly'
            ? `${plan.valueLine} Save 17% with yearly billing.`
            : plan.valueLine;
        return { ...plan, displayPrice, valueLine };
      }),
    [billingCycle],
  );

  const handleStartTrial = (planId: string) => {
    track(planId === 'business' ? 'start_yearly' : 'start_trial', { plan: planId, billingCycle });
    router.push('/onboarding');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
        <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Plans</Text>
        <Text className="mt-2 text-4xl font-semibold text-navy md:text-5xl">Pick what fits</Text>
        <Text className="mt-4 max-w-3xl text-lg text-gray">
          Start with a seven-day free trial. Cancel anytime. We recommend Pro if you manage multiple accounts or invoices.
        </Text>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section eyebrow="Billing" title="Choose how you pay">
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              className={`rounded-full px-4 py-2 ${billingCycle === 'monthly' ? 'bg-blue' : 'bg-blue/10'}`}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-blue'}`}>
                Monthly
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className={`flex-row items-center rounded-full px-4 py-2 ${
                billingCycle === 'yearly' ? 'bg-blue' : 'bg-blue/10'
              }`}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-blue'}`}>
                Yearly
              </Text>
              <Text className="ml-2 rounded-full bg-lime/30 px-2 py-0.5 text-xs font-medium text-navy">Save 17%</Text>
            </Pressable>
          </View>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <View className="grid gap-6 md:grid-cols-3">
          {formattedPlans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              priceMonthly={plan.displayPrice}
              description={plan.description}
              features={plan.features}
              valueLine={plan.valueLine}
              highlight={plan.id === 'pro'}
              actionLabel="Start free trial"
              onPress={() => handleStartTrial(plan.id)}
              footer={
                billingCycle === 'yearly' ? (
                  <Text className="text-sm text-gray">
                    Works out to ${(plan.monthly * multiplier).toFixed(2)} per year, billed once.
                  </Text>
                ) : (
                  <Text className="text-sm text-gray">Includes seven-day trial before billing starts.</Text>
                )
              }
            />
          ))}
        </View>
      </View>

      <View className="px-6 pb-24 pt-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Need time?"
          title="Not ready to connect yet?"
          description="Join the waitlist and we’ll send a free trial when you’re ready to jump back in."
        >
          <Pressable accessibilityRole="button" onPress={() => router.push('/')}>
            <Text className="text-sm font-medium text-blue">Join the waitlist</Text>
          </Pressable>
        </Section>
      </View>
    </ScrollView>
  );
}
