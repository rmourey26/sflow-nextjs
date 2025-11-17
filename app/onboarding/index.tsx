import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormMessage } from '@/components/FormMessage';
import { Input } from '@/components/Input';
import { Section } from '@/components/Section';
import { generateMockFlowState } from '@/lib/mockData';
import { useAnalytics } from '@/lib/analytics/provider';
import { useAuthStore } from '@/store/useAuthStore';
import { useFlowStore } from '@/store/useFlowStore';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

const manualEntrySchema = z.object({
  incomeAmount: z.coerce.number().min(100, 'Enter at least $100'),
  cadence: z.enum(['monthly', 'biweekly', 'weekly']),
  rent: z.coerce.number().min(0).default(0),
  utilities: z.coerce.number().min(0).default(0),
  subscriptions: z.coerce.number().min(0).default(0),
});

type ManualEntryForm = z.infer<typeof manualEntrySchema>;
type ManualEntryFormInput = z.input<typeof manualEntrySchema>;

export default function OnboardingScreen() {
  const [mode, setMode] = useState<'connect' | 'manual'>('connect');
  const router = useRouter();
  const { track } = useAnalytics();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const setFlow = useFlowStore((state) => state.setFlow);
  const setFlowMode = useFlowStore((state) => state.setMode);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ManualEntryFormInput>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      incomeAmount: 4800,
      cadence: 'monthly',
      rent: 2100,
      utilities: 220,
      subscriptions: 120,
    },
  });

  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sent'>('idle');

  const cadenceOptions = useMemo(
    () => [
      { id: 'monthly', label: 'Monthly' },
      { id: 'biweekly', label: 'Every 2 weeks' },
      { id: 'weekly', label: 'Weekly' },
    ],
    [],
  );

  const handleMagicLink = () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailStatus('idle');
      return;
    }
    setCredentials('demo-token', parsed.data);
    setEmailStatus('sent');
    track('onboarding_complete', { method: 'email' });
  };

  const handleConnectDemo = () => {
    track('connect_bank_start');
    const mock = generateMockFlowState({ seed: 'connected' });
    setFlow(mock);
    setFlowMode('connected');
    track('connect_bank_success');
    router.push('/dashboard');
  };

  const onManualSubmit = (rawData: ManualEntryFormInput) => {
    const data = manualEntrySchema.parse(rawData);
    const monthlyIncome =
      data.cadence === 'monthly'
        ? data.incomeAmount
        : data.cadence === 'biweekly'
          ? Math.round((data.incomeAmount * 26) / 12)
          : Math.round((data.incomeAmount * 52) / 12);

    const mock = generateMockFlowState({
      seed: 'manual',
      monthlyIncome,
      buffer: 400,
      bills: [
        { name: 'Rent', amount: data.rent, cadence: 'monthly', dueInDays: 12 },
        { name: 'Utilities', amount: data.utilities, cadence: 'monthly', dueInDays: 15 },
        { name: 'Subscriptions', amount: data.subscriptions, cadence: 'monthly', dueInDays: 8 },
      ],
    });

    setFlow(mock);
    setFlowMode('manual');
    track('manual_entry_complete', { cadence: data.cadence, monthlyIncome });
    router.push('/dashboard');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
        <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Welcome</Text>
        <Text className="mt-3 text-4xl font-semibold text-navy md:text-5xl">Create your calm money space</Text>
        <Text className="mt-4 max-w-2xl text-lg text-gray">
          Start with a magic link, choose to connect your bank with read-only access, or enter a few numbers manually
          to see your 90 day forecast.
        </Text>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Step 1"
          title="Sign in with email"
          description="We’ll send a secure magic link or let you use a passkey. No passwords to remember."
        >
          <Card className="bg-white/90">
            <Input
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View className="mt-4 flex-row flex-wrap items-center gap-3">
              <Button title="Send link" onPress={handleMagicLink} />
              <Text className="text-sm text-gray">Prefer passkeys? They’re coming soon.</Text>
            </View>
            {emailStatus === 'sent' ? (
              <FormMessage tone="success" message="Check your inbox. We just sent your link." />
            ) : null}
          </Card>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Step 2"
          title="Choose how you want to get started"
          description="Connect your accounts in read-only mode or give us a few details manually. You can always connect
            later."
        >
          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              className={`flex-1 rounded-full border px-5 py-3 ${
                mode === 'connect' ? 'border-blue bg-blue/10' : 'border-transparent bg-white'
              }`}
              onPress={() => setMode('connect')}
            >
              <Text className={`text-center text-sm font-medium ${mode === 'connect' ? 'text-blue' : 'text-navy'}`}>
                Connect bank (read only)
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className={`flex-1 rounded-full border px-5 py-3 ${
                mode === 'manual' ? 'border-blue bg-blue/10' : 'border-transparent bg-white'
              }`}
              onPress={() => setMode('manual')}
            >
              <Text className={`text-center text-sm font-medium ${mode === 'manual' ? 'text-blue' : 'text-navy'}`}>
                Enter manually
              </Text>
            </Pressable>
          </View>

          {mode === 'connect' ? (
            <Card
              className="mt-6"
              title="Link accounts securely"
              description="We use read-only connections with market-leading providers. Encryption is end-to-end, and your credentials are never stored."
            >
              <View className="space-y-3">
                <View className="rounded-2xl border border-blue/20 bg-blue/5 px-4 py-3">
                  <Text className="text-sm text-blue">
                    Coming soon — for now, jump into the demo forecast to see how SaverFlow works.
                  </Text>
                </View>
                <View className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                  <Text className="text-base font-medium text-navy">Plaid • Read only</Text>
                  <Text className="mt-1 text-sm text-gray">Institution access • Last updated just now</Text>
                </View>
                <Button title="Preview with demo accounts" onPress={handleConnectDemo} />
              </View>
            </Card>
          ) : (
            <Card
              className="mt-6"
              title="Tell us the basics"
              description="Share your average income and a couple of essential bills. We’ll generate a forecast you can explore right away."
            >
              <Controller
                control={control}
                name="incomeAmount"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Income amount"
                    keyboardType="numeric"
                    placeholder="4800"
                    value={String(value)}
                    onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ''))}
                    error={errors.incomeAmount?.message}
                  />
                )}
              />

              <View className="mt-4">
                <Text className="mb-2 text-sm font-medium text-navy">Cadence</Text>
                <View className="flex-row flex-wrap gap-3">
                  {cadenceOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      onPress={() => setValue('cadence', option.id as ManualEntryForm['cadence'])}
                      className={`rounded-full px-4 py-2 ${
                        getValues('cadence') === option.id ? 'bg-blue' : 'bg-blue/10'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          getValues('cadence') === option.id ? 'text-white' : 'text-blue'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mt-4 space-y-4">
                <Controller
                  control={control}
                  name="rent"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Rent or mortgage"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ''))}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="utilities"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Utilities"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ''))}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="subscriptions"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Subscriptions"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ''))}
                    />
                  )}
                />
              </View>

              <View className="mt-6">
                <Button title="Build my forecast" onPress={handleSubmit(onManualSubmit)} />
                {Object.keys(errors).length ? (
                  <FormMessage tone="error" message="Please double-check the numbers above." />
                ) : null}
              </View>
            </Card>
          )}
        </Section>
      </View>

      <View className="px-6 pb-24 md:px-12 lg:px-24">
        <Section
          eyebrow="Step 3"
          title="Explore your forecast"
          description="You’ll land on a 90 day view with runway, confidence bands, and SmartSave suggestions. Adjust scenarios any time."
        >
          <Card className="bg-blue/5">
            <Text className="text-base text-gray">
              Ready to continue later? You can always finish onboarding on the web or mobile app. We’ll keep your place
              and your data secure.
            </Text>
          </Card>
        </Section>
      </View>
    </ScrollView>
  );
}
