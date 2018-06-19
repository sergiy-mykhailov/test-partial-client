import * as React from 'react';
import * as styles from './styles.css';
import * as classnames from 'classnames';

export interface LoadingIndicatorProps {
  size?: string;
}

const loadingClassName = (size: string) =>
  classnames(styles.LoadingIndicator, {
    [styles.LoadingIndicatorLarge]: size === 'large',
    [styles.LoadingIndicatorMedium]: size === 'medium',
    [styles.LoadingIndicatorSmall]: size === 'small'
  });

export const LoadingIndicator = ({ size = 'medium', ...restProps }: LoadingIndicatorProps) => (
  <div className={loadingClassName(size)} />
);
