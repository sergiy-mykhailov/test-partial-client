import React from 'react';
import * as styles from './styles.css';

export default class ContextMenu extends React.Component {
  render() {
    return (
      <div
        className={styles.contextMenu}
        style={{
          top: this.props.top,
          left: this.props.left,
          display: (() => {
            if (this.props.show) {
              return 'block';
            } else {
              return 'none';
            }
          })()
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
