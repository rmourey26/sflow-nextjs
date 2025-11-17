import type { ReactNode } from 'react';
import { Modal, Pressable, View, Text, Platform } from 'react-native';
import { X } from 'lucide-react-native';

type TooltipSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
};

export function TooltipSheet({ visible, onClose, title, description, children }: TooltipSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.select({ ios: 'slide', default: 'fade' })}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <Pressable className="flex-1 bg-black/40" accessibilityRole="button" accessibilityLabel="Close overlay" onPress={onClose}>
        <Pressable
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-offwhite px-6 py-8 shadow-2xl md:mx-auto md:max-w-3xl"
          accessibilityViewIsModal
          onPress={() => undefined}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-8">
              {title ? <Text className="text-2xl font-semibold text-navy">{title}</Text> : null}
              {description ? <Text className="mt-2 text-base text-gray">{description}</Text> : null}
            </View>
            <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} className="rounded-full bg-blue/10 p-2">
              <X color="#0A1930" size={20} />
            </Pressable>
          </View>
          <View className="mt-6">{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
