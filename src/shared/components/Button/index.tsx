import * as React from 'react';
import * as styles from './styles.css';
import * as classnames from 'classnames';

type ButtonTypes = 'primary' | 'secondary' | 'default' | 'light' | 'danger';

export interface ButtonProps {
  children: any;
  onClick?: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
  type?: ButtonTypes;
  disabled?: boolean;
  form?: string;
  buttonType?: string;
}

const buttonClassname = (buttonType: ButtonTypes): string =>
  classnames(styles.Button, {
    [styles.ButtonDefault]: buttonType === 'default',
    [styles.ButtonPrimary]: buttonType === 'primary',
    [styles.ButtonSecondary]: buttonType === 'secondary',
    [styles.ButtonLight]: buttonType === 'light',
    [styles.ButtonDanger]: buttonType === 'danger'
  });

export const Button = ({
  buttonType = 'button',
  form,
  children,
  disabled,
  onClick,
  type = 'default'
}: ButtonProps) => {
  return (
    <button
      type={buttonType}
      form={form}
      className={buttonClassname(type)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
