/**
 * Collapsible Component - AttendX Dark Pro Theme
 */
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { spacing } from '../../constants/theme';
import { IconSymbol } from './icon-symbol';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);

  const toggleOpen = () => {
    setIsOpen((value) => !value);
    rotation.value = withTiming(isOpen ? 0 : 90, { duration: 200 });
  };

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={toggleOpen}
        activeOpacity={0.7}
      >
        <Animated.View style={animatedChevronStyle}>
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color="#5C5C5C"
          />
        </Animated.View>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <Animated.View style={styles.content} entering={FadeIn} exiting={FadeOut}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141828',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: '#F0F2FF',
  },
  content: {
    marginTop: spacing.md,
    marginLeft: spacing.lg,
  },
});
