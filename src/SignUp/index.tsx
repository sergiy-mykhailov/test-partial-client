import * as React from 'react';
import { AuthForm } from '../shared/components/AuthForm';
import * as styles from './styles.css';
import AuthService, { AuthResponse } from '../services/auth';
import { Link } from 'react-router-dom';

export class SignUp extends React.Component {
  async handleSubmit(username: string, password: string): Promise<AuthResponse> {
    return await AuthService.signup(username, password);
  }

  render() {
    return (
      <div className={styles.SignUp}>
        <AuthForm title="Sign Up" onSubmit={this.handleSubmit} />

        <div className={styles.LogInCTA}>
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    );
  }
}
