import React from 'react';
import { Text as RNText, type TextStyle } from 'react-native';

type StyleProps = Omit<TextStyle, 'transform'>;

export type ITextProps = Omit<
  React.ComponentProps<typeof RNText>,
  keyof StyleProps
> &
  StyleProps & {
    className?: string;
  };

const createStyleFromProps = (props: StyleProps): TextStyle => {
  const styleKeys = Object.keys(props).filter(
    (key) => props[key as keyof StyleProps] !== undefined
  );
  return Object.fromEntries(
    styleKeys.map((key) => [key, props[key as keyof StyleProps]])
  ) as TextStyle;
};

const Text = React.forwardRef<React.ElementRef<typeof RNText>, ITextProps>(
  ({ style, ...props }, ref) => {
    const styleProps = createStyleFromProps(props as StyleProps);

    return <RNText style={[styleProps, style]} {...props} ref={ref} />;
  }
);

Text.displayName = 'Text';
export default Text;
