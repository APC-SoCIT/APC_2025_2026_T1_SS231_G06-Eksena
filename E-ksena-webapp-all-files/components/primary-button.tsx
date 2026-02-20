import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { BRAND_RED, BRAND_RED_HOVER, Spacing, FontSizes, WHITE, Radius } from '@/constants/theme';
import { useRoleTheme } from '@/context/role-theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, style, textStyle, disabled }: PrimaryButtonProps) {
  const theme = useRoleTheme();

  const btnBg = theme.primary;
  const btnPressed = theme.primaryHover;
  const glowColor = theme.glow;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: btnBg,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 3,
        },
        pressed && [styles.buttonPressed, { backgroundColor: btnPressed }],
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text style={[styles.label, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  buttonPressed: {
    opacity: 0.95,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    color: WHITE,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
});
