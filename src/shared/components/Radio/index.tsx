import * as React from 'react';
import * as styles from './styles.css';

interface RadioProps {
  onChange: React.EventHandler<React.ChangeEvent<HTMLInputElement>>;
  children?: any;
  id: string;
  checked: boolean;
  name: string;
}

export const Radio = ({ onChange, checked, id, children, name }: RadioProps) => {
  return (
    <label className={styles.Radio} htmlFor={id}>
      <input type="radio" name={name} id={id} checked={checked} onChange={onChange} />

      <div className={styles.RadioBox}>{checked && <div className={styles.RadioFill} />}</div>

      <div className={styles.RadioLabel}>{children}</div>
    </label>
  );
};
