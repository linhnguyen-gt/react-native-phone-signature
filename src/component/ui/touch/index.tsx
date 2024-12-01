import React from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

type StyleProps = Omit<ViewStyle, 'transform'>;

export type ITouchableProps = Omit<TouchableOpacityProps, keyof StyleProps> &
  StyleProps;

const createStyleFromProps = (props: StyleProps): ViewStyle => {
  const styleKeys = Object.keys(props).filter(
    (key) => props[key as keyof StyleProps] !== undefined
  );
  return Object.fromEntries(
    styleKeys.map((key) => [key, props[key as keyof StyleProps]])
  ) as ViewStyle;
};

const Touchable = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ITouchableProps
>(({ style, ...props }, ref) => {
  const styleProps = createStyleFromProps(props as StyleProps);

  return <TouchableOpacity style={[styleProps, style]} {...props} ref={ref} />;
});

Touchable.displayName = 'Touchable';
export default Touchable;
