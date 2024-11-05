'use client';

import React from 'react';

export interface FlexProps {
  gap?: number;
  style?: React.CSSProperties;
  bg?: React.CSSProperties['background'];
  align?: React.CSSProperties['alignItems'];
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  padding?: React.CSSProperties['padding'];
  margin?: React.CSSProperties['margin'];
  radius?: React.CSSProperties['borderRadius'];
  justify?: React.CSSProperties['justifyContent'];
  onClick?: () => void;
  children?: React.ReactNode;
  direction?: React.CSSProperties['flexDirection'];
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  noFlex? : boolean
}

export const Flex = React.forwardRef<any, FlexProps>((props, ref) => {
  const optionsStyles: React.CSSProperties = {
    gap: props.gap,
    width: props.width,
    borderRadius: props.radius,
    height: props.height,
    padding: props.padding,
    margin: props.margin,
    background: props.bg,
    alignItems: props.align,
    flexDirection: props.direction,
    justifyContent: props.justify,
    ...props.style,
    display: props.noFlex ? 'block' : 'flex',
  };

  return (
    <div ref={ref} style={optionsStyles} onScroll={props.onScroll} onClick={props.onClick} className={props?.className}>
      {props.children}
    </div>
  );
});
