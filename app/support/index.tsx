import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormMessage } from '@/components/FormMessage';
import { Input } from '@/components/Input';
import { Section } from '@/components/Section';
import { apiRequest } from '@/lib/api/client';
import { contactSchema, type ContactInput } from '@/lib/validators';

type ContactFormValues = ContactInput;

const faqs = [
  {
    question: 'Is SaverFlow read only?',
    answer: 'Yes. We can see balances and transactions but we never move money or initiate transfers.',
  },
  {
    question: 'How do I cancel?',
    answer: 'You can cancel in Settings at any time. Billing stops immediately and you keep access through the period.',
  },
  {
    question: 'Do you support joint accounts?',
    answer: 'Invite a partner by sharing your forecast via the export feature. Shared login support is on the roadmap.',
  },
];

export default function SupportScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const supportMutation = useMutation({
    mutationFn: async (values: ContactFormValues) =>
      apiRequest<{ ok: boolean }>({
        path: '/api/support',
        method: 'POST',
        data: values,
      }),
    onSuccess: () => {
      setStatusMessage('Thanks for reaching out. We’ll reply within one business day.');
      reset({ name: '', email: '', message: '' });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    supportMutation.mutate(data);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
        <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Support</Text>
        <Text className="mt-2 text-4xl font-semibold text-navy md:text-5xl">Here when you need us</Text>
        <Text className="mt-4 max-w-3xl text-lg text-gray">
          Get a quick answer or send us a note. We’re a small team, but we read every message.
        </Text>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section eyebrow="Contact" title="Send a message">
          <Card className="bg-white/90">
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Name"
                  placeholder="Taylor Reed"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
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
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />
            <View className="mt-4" />
            <Controller
              control={control}
              name="message"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="How can we help?"
                  placeholder="Tell us what you’re noticing..."
                  multiline
                  numberOfLines={5}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.message?.message}
                  className="min-h-[120px]"
                />
              )}
            />
            <View className="mt-6">
              <Button
                title="Send message"
                onPress={handleSubmit(onSubmit)}
                loading={supportMutation.isPending}
              />
            </View>
            {statusMessage ? <FormMessage tone="success" message={statusMessage} /> : null}
            {supportMutation.isError ? (
              <FormMessage tone="error" message="Something went wrong. Please try again soon." />
            ) : null}
          </Card>
        </Section>
      </View>

      <View className="px-6 pb-24 pt-4 md:px-12 lg:px-24">
        <Section eyebrow="FAQ" title="Quick answers">
          <View className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} title={faq.question} description={faq.answer} />
            ))}
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}
