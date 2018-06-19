import * as React from 'react';
import * as styles from './styles.css';

export class Sidebar extends React.Component {
  render() {
    return (
      <div className={styles.Sidebar} id="sidebar">
        {this.props.children}
      </div>
    );
  }
}
