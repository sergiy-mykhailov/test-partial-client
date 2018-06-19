import * as React from 'react';
import './styles.css';
import { BrowserRouter, Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { Workfiles } from '../Workfiles';
import { Workfile } from '../Workfile';
import { Home } from '../Home';
import { SignUp } from '../SignUp';
import { LogIn } from '../LogIn';
import { LogOut } from '../LogOut';
import { Sales } from '../Sales';
import { NewSale } from '../Sales/NewSale';
import { AuthenticatedRoute } from './AuthenticatedRoute';

export const Shell = (): React.ReactElement<any> => {
  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route path="/signup" exact component={SignUp} />
          <Route path="/login" exact component={LogIn} />
          <Route path="/logout" exact component={LogOut} />
          <AuthenticatedRoute path="/" exact component={Home} />
          <AuthenticatedRoute exact path="/workfiles" component={Workfiles} />
          <AuthenticatedRoute path="/workfiles/:workfileId" component={Workfile} />
          <AuthenticatedRoute path="/sales" component={Sales} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
