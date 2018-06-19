import * as React from 'react';
import * as styles from './styles.css';
import { Link } from 'react-router-dom';
import { Button } from '../shared/components/Button';

export const Home = () => {
  return (
    <div className={styles.HomePage}>
      <div className={styles.Content}>
        <div className={styles.Welcome}>Welcome To TerraceAg</div>

        <Link to="/workfiles" className={styles.WorkfileLink}>
          Check out Workfiles
        </Link>
      </div>
    </div>
  );
};
