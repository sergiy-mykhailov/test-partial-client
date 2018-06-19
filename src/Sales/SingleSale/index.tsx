import * as React from 'react';
import { RouteComponentProps, Link, Switch, Route, matchPath } from 'react-router-dom';
import * as styles from '../styles.css';
import { Sidebar } from '../../shared/layouts/Sidebar';
import { MainContent } from '../../shared/layouts/MainContent';
import { OuterWrapper } from '../../shared/layouts/OuterWrapper';
import { UpdateSale } from '../UpdateSale';
import { SaleAnalysis } from '../SaleAnalysis';
import { LeftChevron } from '../../shared/components/Icons/LeftChevron';
import { SidebarMenu } from '../../shared/components/SidebarMenu';

interface Params {
  saleId: string;
}

export class SingleSale extends React.Component<RouteComponentProps<Params>, null> {
  isRoutedToSection = (path: string): boolean => {
    const { pathname } = this.props.location;

    const match = matchPath(pathname, {
      path: `/sales/:saleId/${path}`,
      exact: false
    });

    return !!match && match.isExact;
  };
  render() {
    const { saleId } = this.props.match.params;

    return (
      <OuterWrapper>
        <Sidebar>
          <div className={styles.NavigateBackSection}>
            <Link className={styles.NavigateBackLink} to="/sales">
              <LeftChevron className={styles.BackIcon} /> Sales
            </Link>
          </div>
          <SidebarMenu
            menuitems={[
              { href: '/sales/' + saleId + '/update', title: 'Update' },
              /* { href: '/sales/' + saleId + '/map', title: 'Map' }, */
              { href: '/sales/' + saleId + '/analysis', title: 'Analysis' }
            ]}
            pathname={this.props.location.pathname}
          />
        </Sidebar>
        <MainContent>
          <Switch>
            <Route exact path="/sales/:saleId(\\d+)/update" component={UpdateSale} />
            <Route exact path="/sales/:saleId(\\d+)/analysis" component={SaleAnalysis} />
          </Switch>
        </MainContent>
      </OuterWrapper>
    );
  }
}
