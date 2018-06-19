import * as React from 'react';
import * as styles from './styles.css';
// import * as classnames from 'classnames';

export const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label {...props} className={styles.Label}>
      {children}
    </label>
  );
};
