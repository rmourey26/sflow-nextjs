import { useState } from 'react';
import { ScrollView, View, Text, Switch, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { FormMessage } from '@/components/FormMessage';
import { apiRequest } from '@/lib/api/client';
import { useAnalytics } from '@/lib/analytics/provider';
import { useAuthStore } from '@/store/useAuthStore';
import { useFlowStore } from '@/store/useFlowStore';

export default function SettingsScreen() {
  const auth = useAuthStore();
  const flow = useFlowStore((state) => state.flow);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailReportsEnabled, setEmailReportsEnabled] = useState(true);
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const { track } = useAnalytics();

  const deleteMutation = useMutation({
    mutationFn: async () =>
      apiRequest<{ ok: boolean }>({
        path: '/api/account',
        method: 'DELETE',
        headers: { 'x-saverflow-email': auth.email ?? '' },
      }),
    onSuccess: () => {
      setDeleteMessage('Your data has been queued for deletion. We will confirm within 24 hours.');
      track('connect_bank_fail', { reason: 'account_deleted' });
      auth.clear();
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () =>
      apiRequest<{ ok: boolean; exportId: string }>({
        path: '/api/account',
        method: 'POST',
        data: { email: auth.email },
      }),
    onSuccess: (response) => {
      setExportMessage(`Export requested. We’ll email a secure link (request ${response.exportId}).`);
      track('pricing_view', { action: 'export_requested' });
    },
  });

  const handleDeleteData = () => {
    Alert.alert(
      'Delete your data?',
      'This will remove your connections, forecast history, and insights. You can always start fresh later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ],
    );
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
        <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Account & Settings</Text>
        <Text className="mt-2 text-4xl font-semibold text-navy md:text-5xl">Stay in control</Text>
        <Text className="mt-4 max-w-3xl text-lg text-gray">
          Update your profile, manage notifications, and handle privacy in one calm place.
        </Text>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section eyebrow="Profile" title="You’re signed in with">
          <Card className="bg-white/90">
            <Text className="text-base font-medium text-navy">{auth.email ?? 'guest@saverflow.app'}</Text>
            <Text className="mt-1 text-sm text-gray">Plan: SaverFlow Pro (trial)</Text>
            <View className="mt-4 flex-row flex-wrap items-center gap-3">
              <Button
                title="Manage subscription"
                variant="outline"
                onPress={() => track('pricing_view', { source: 'settings_manage_subscription' })}
              />
              <Button title="Sign out" variant="ghost" onPress={auth.clear} />
            </View>
          </Card>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section eyebrow="Security" title="Security & access">
          <Card className="bg-white/90">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-medium text-navy">Two-factor authentication</Text>
                <Text className="text-sm text-gray">
                  Add a second step at sign-in for extra peace of mind. App and SMS options coming soon.
                </Text>
              </View>
              <Switch value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} />
            </View>
            <View className="mt-6">
              <Text className="text-sm font-medium text-gray">Connected devices</Text>
              <View className="mt-2 space-y-2">
                <Text className="text-sm text-gray">iPhone 15 • Last active 3 hours ago</Text>
                <Text className="text-sm text-gray">MacBook Air • Last active yesterday</Text>
              </View>
            </View>
          </Card>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Connections"
          title="Linked institutions"
          description="Revoke access anytime. We only read balances and transactions."
        >
          <Card className="bg-white/90">
            <View className="space-y-3">
              {(flow?.accounts ?? []).map((account) => (
                <View key={account.id} className="flex-row items-center justify-between rounded-2xl bg-blue/5 px-4 py-3">
                  <View>
                    <Text className="text-base font-medium text-navy">{account.name}</Text>
                    <Text className="text-sm text-gray">{account.type}</Text>
                  </View>
                  <Text className="text-base font-semibold text-navy">${account.currentBalance.toLocaleString()}</Text>
                </View>
              ))}
              {!flow?.accounts?.length ? (
                <Text className="text-sm text-gray">No accounts linked yet. Add one from the dashboard.</Text>
              ) : null}
            </View>
          </Card>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section eyebrow="Notifications" title="Keep me posted">
          <Card className="bg-white/90">
            <View className="flex-row items-center justify-between border-b border-blue/10 pb-4">
              <View>
                <Text className="text-base font-medium text-navy">Weekly Flow Report</Text>
                <Text className="text-sm text-gray">A calm summary every Monday morning.</Text>
              </View>
              <Switch value={emailReportsEnabled} onValueChange={setEmailReportsEnabled} />
            </View>
            <View className="mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-base font-medium text-navy">Runway alerts</Text>
                <Text className="text-sm text-gray">Get a ping if runway slips under 14 days.</Text>
              </View>
              <Switch value={pushAlertsEnabled} onValueChange={setPushAlertsEnabled} />
            </View>
          </Card>
        </Section>
      </View>

      <View className="px-6 pb-24 pt-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Privacy"
          title="Your data, your call"
          description="Access copies or delete everything without waiting on support."
        >
          <Card className="bg-white/90">
            <View className="flex-row flex-wrap items-center gap-3">
              <Button
                title="Request export"
                variant="outline"
                onPress={() => exportMutation.mutate()}
                loading={exportMutation.isPending}
              />
              <Button
                title="Delete my data"
                variant="ghost"
                onPress={handleDeleteData}
                loading={deleteMutation.isPending}
              />
            </View>
            {exportMessage ? <FormMessage tone="info" message={exportMessage} /> : null}
            {deleteMessage ? <FormMessage tone="success" message={deleteMessage} /> : null}
            <View className="mt-4">
              <Text className="text-sm text-gray">
                When you delete your data we immediately sever connections, clear stored transactions, and anonymise
                analytics. Exports are available for 7 days and encrypted at rest.
              </Text>
            </View>
          </Card>
          <View className="mt-6 flex-row flex-wrap gap-3">
            <Button title="Privacy policy" variant="outline" onPress={() => track('pricing_view', { link: 'privacy' })} />
            <Button title="Terms of use" variant="outline" onPress={() => track('pricing_view', { link: 'terms' })} />
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}
