import * as React from 'react';
import * as styles from './styles.css';
import * as classnames from 'classnames';

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <input {...props} className={classnames(styles.Input, props.className)} />;
};
