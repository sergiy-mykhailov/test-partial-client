import * as React from 'react';
import * as styles from './styles.css';
import * as classnames from 'classnames';

interface CheckboxProps {
  onChange: React.EventHandler<React.ChangeEvent<HTMLInputElement>>;
  children?: any;
  id: string;
  checked: boolean;
  disabled?: boolean;
}

export const Checkbox = ({ onChange, checked, id, children, disabled }: CheckboxProps) => {
  return (
    <label
      className={classnames(styles.Checkbox, { [styles.Disabled]: disabled && !checked })}
      htmlFor={id}
    >
      <input
        type="checkbox"
        name={id}
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />

      <div className={styles.CheckboxBox}>{checked && <div className={styles.CheckboxFill} />}</div>

      <div className={styles.CheckboxLabel}>{children}</div>
    </label>
  );
};
