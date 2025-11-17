import { useCallback, useMemo, useRef } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CalendarRange, PiggyBank, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { FeatureList } from '@/components/FeatureList';
import { FormMessage } from '@/components/FormMessage';
import { Input } from '@/components/Input';
import { Section } from '@/components/Section';
import { waitlistSchema, type WaitlistInput } from '@/lib/validators';
import { apiRequest } from '@/lib/api/client';
import { useAnalytics } from '@/lib/analytics/provider';

type WaitlistFormValues = z.input<typeof waitlistSchema>;

export default function LandingScreen() {
  const router = useRouter();
  const { track } = useAnalytics();
  const scrollRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: '', email: '', intent: 'waitlist', honeypot: '' },
  });

  const waitlistMutation = useMutation({
    mutationFn: async (values: WaitlistInput) => {
      return apiRequest<{ ok: boolean; duplicate?: boolean }>({
        path: '/api/waitlist',
        method: 'POST',
        data: values,
      });
    },
    onSuccess: (response) => {
      track('waitlist_submit', { duplicate: response.duplicate ?? false });
      reset({ name: '', email: '', intent: 'waitlist', honeypot: '' });
    },
  });

  const features = useMemo(
    () => [
      {
        id: 'connect',
        title: 'Connect safely',
        description: 'Read-only links to your accounts. Bank-grade encryption and no access to move your money.',
        icon: <ShieldCheck color="#4A90E2" size={24} />,
      },
      {
        id: 'forecast',
        title: 'See your forecast',
        description: 'A 90 day view with confidence bands so you can spot dry spells before they hit.',
        icon: <CalendarRange color="#4A90E2" size={24} />,
      },
      {
        id: 'smartsave',
        title: 'Save smarter',
        description: 'Gentle nudges for small transfers that stretch your runway and build cushions.',
        icon: <PiggyBank color="#4A90E2" size={24} />,
      },
    ],
    [],
  );

  const onJoinWaitlist = useCallback(
    (data: WaitlistFormValues) => {
      const parsed = waitlistSchema.parse(data);
      waitlistMutation.mutate(parsed);
    },
    [waitlistMutation],
  );

  const handleScrollToWaitlist = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 720, animated: true });
  }, []);

  return (
    <ScrollView ref={scrollRef} contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="w-full bg-navy px-6 pb-24 pt-20 md:px-12 lg:px-24">
        <View className="max-w-5xl">
          <Text className="text-sm font-medium uppercase tracking-[0.2em] text-lime">Feel calm again</Text>
          <Text className="mt-4 text-4xl font-semibold leading-tight text-offwhite md:text-6xl">
            See your next 90 days of money before it happens.
          </Text>
          <Text className="mt-6 max-w-2xl text-lg leading-relaxed text-blue/80">
            SaverFlow shows your future balance, predicts expenses, and offers small saving suggestions so you never have
            to guess. No spreadsheets. No guilt. Just clarity.
          </Text>
          <View className="mt-10 flex-row flex-wrap items-center gap-4">
            <Button
              title="Start free"
              onPress={() => {
                track('start_trial');
                router.push('/onboarding');
              }}
              size="lg"
            />
            <Button title="Join the waitlist" variant="outline" size="lg" onPress={handleScrollToWaitlist} />
          </View>
          <Text className="mt-6 text-sm text-blue/60">Secure read only. We never move your money.</Text>
        </View>
      </View>

      <View className="px-6 py-16 md:px-12 lg:px-24">
        <Section
          eyebrow="How it works"
          title="No guesswork. Just a clear view of what is coming."
          description="SaverFlow brings your cash flow, forecast, and smart saving prompts together in one calm place."
        >
          <FeatureList items={features} />
        </Section>
      </View>

      <View className="bg-white px-6 py-16 md:px-12 lg:px-24">
        <Section
          eyebrow="Get early access"
          title="Feel good about your money again."
          description="Leave your email and we’ll let you know as soon as the trial is ready. No spam. We promise."
        >
          <View className="max-w-xl">
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Name"
                  placeholder="Taylor Reed"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />
            <View className="mt-4" />
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="honeypot"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Leave this empty"
                  value={value}
                  onChangeText={onChange}
                  className="hidden"
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              )}
            />

            <View className="mt-6 flex-row items-center gap-3">
              <Button
                title="Join the waitlist"
                onPress={handleSubmit(onJoinWaitlist)}
                loading={waitlistMutation.isPending}
                iconRight={<ArrowRight color="#FAFAFA" size={18} />}
              />
              <Pressable
                accessibilityRole="button"
                className="rounded-full bg-blue/10 px-4 py-2"
                onPress={() => router.push('/pricing')}
              >
                <Text className="text-sm font-medium text-blue">See pricing</Text>
              </Pressable>
            </View>

            {waitlistMutation.isSuccess ? (
              <FormMessage
                tone="success"
                message={
                  waitlistMutation.data?.duplicate
                    ? 'You are already on the list. We will keep you posted.'
                    : 'Thanks! We will invite you as soon as we open the doors.'
                }
              />
            ) : null}

            {waitlistMutation.isError ? (
              <FormMessage tone="error" message="Something went wrong. Please try again in a moment." />
            ) : null}
          </View>
        </Section>
      </View>

      <View className="px-6 pb-24 md:px-12 lg:px-24">
        <View className="max-w-4xl rounded-3xl bg-navy px-8 py-12 text-center shadow-card">
          <Text className="text-3xl font-semibold text-offwhite">You deserve to sleep well at night.</Text>
          <Text className="mt-4 text-lg leading-relaxed text-blue/70">
            Not wondering if you have enough. Not stressing about surprise expenses. Just knowing what’s ahead and how
            to stay ready.
          </Text>
          <View className="mt-8 flex-row justify-center">
            <Button title="Get started" size="lg" onPress={() => router.push('/onboarding')} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
