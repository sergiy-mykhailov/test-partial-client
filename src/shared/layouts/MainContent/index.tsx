import * as React from 'react';
import * as styles from './styles.css';

export class MainContent extends React.Component {
  render() {
    return (
      <div className={styles.MainContent} id="MainContent">
        {this.props.children}
      </div>
    );
  }
}
