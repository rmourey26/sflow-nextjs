import { View, Text, Image } from 'react-native';

type TestimonialProps = {
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
};

export function Testimonial({ quote, name, role, avatar }: TestimonialProps) {
  return (
    <View className="rounded-3xl border border-[#E8EDF5] bg-white p-8 shadow-card">
      <Text className="text-lg leading-relaxed text-navy">&ldquo;{quote}&rdquo;</Text>
      <View className="mt-6 flex-row items-center gap-4">
        {avatar ? (
          <Image source={{ uri: avatar }} className="h-12 w-12 rounded-full" accessibilityIgnoresInvertColors />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-blue/10">
            <Text className="text-lg font-semibold text-blue">{name.charAt(0)}</Text>
          </View>
        )}
        <View>
          <Text className="text-base font-semibold text-navy">{name}</Text>
          {role ? <Text className="text-sm text-gray">{role}</Text> : null}
        </View>
      </View>
    </View>
  );
}
