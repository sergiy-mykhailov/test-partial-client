import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as styles from './styles.css';
import { Button } from '../Button';
import * as classnames from 'classnames';

interface ModalProps {
  show: boolean;
  children: any;
  showCancel?: boolean;
  showOk?: boolean;
  onCancel?: Function;
  onOk?: Function;
  okText?: string;
  cancelText?: string;
  className?: string;
}

export class Modal extends React.Component<ModalProps, {}> {
  public static defaultProps: Partial<ModalProps> = {
    showCancel: false,
    showOk: true,
    okText: 'Ok',
    cancelText: 'Cancel'
  };

  onOkClick(e: any) {
    if (this.props.onOk) this.props.onOk();
  }

  onCancelClick(e: any) {
    if (this.props.onCancel) this.props.onCancel();
  }

  okButton = this.props.showOk ? (
    <Button type="primary" onClick={this.onOkClick.bind(this)}>
      {this.props.okText}
    </Button>
  ) : null;

  cancelButton = this.props.showCancel ? (
    <Button type="secondary" onClick={this.onCancelClick.bind(this)}>
      {this.props.cancelText}
    </Button>
  ) : null;

  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <div className={styles.Modal}>
        <div className={classnames(styles.ModalInner, this.props.className)}>
          {this.props.children}
          <div className={styles.ModalButtons}>
            {this.cancelButton}
            {this.okButton}
          </div>
        </div>
      </div>
    );
  }
}
