import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import {
  ACCENT_AMBER,
  ACCENT_AMBER_HOVER,
  BG_BASE,
  TEXT_PRIMARY,
  BORDER,
  Spacing,
  FontSizes,
  Fonts,
  Radius,
} from '@/constants/theme';
import { useRoleTheme } from '@/context/role-theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  /** Ghost = outline-only variant (for secondary/destructive actions) */
  ghost?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  ghost,
}: PrimaryButtonProps) {
  const theme = useRoleTheme();

  if (ghost) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          styles.ghostButton,
          { borderColor: theme.primary },
          pressed && { backgroundColor: 'rgba(255,255,255,0.04)' },
          disabled && styles.buttonDisabled,
          style,
        ]}
      >
        <Text style={[styles.label, styles.ghostLabel, { color: theme.primary }, textStyle]}>
          {title}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: ACCENT_AMBER,
          shadowColor: 'rgba(255,107,43,0.4)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 4,
        },
        pressed && {
          backgroundColor: ACCENT_AMBER_HOVER,
          transform: [{ translateY: -1 }],
          shadowOpacity: 0.7,
          shadowRadius: 16,
        },
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: BG_BASE }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  ghostLabel: {
    // color set dynamically
  },
});
