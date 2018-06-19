import * as React from 'react';
import { RouteComponentProps, Link, Switch, Route, matchPath } from 'react-router-dom';
import * as styles from './styles.css';
import { LeftChevron } from '../../../shared/components/Icons/LeftChevron';

interface MenuItem {
  href: string;
  title: string;
}

interface SidebarMenuProps {
  menuitems: MenuItem[];
  pathname: string;
}

export class SidebarMenu extends React.Component<SidebarMenuProps, null> {
  isRoutedToSection = (path: string): boolean => {
    const { pathname } = this.props;
    const match = matchPath(pathname, {
      path: `${path}*`,
      exact: false
    });

    return !!match && match.isExact;
  };
  render() {
    return (
      <div>
        {this.props.menuitems.map((e, i) => {
          return (
            <div
              key={i}
              className={
                this.isRoutedToSection(e.href)
                  ? styles.SidebarSectionSelected
                  : styles.SidebarSection
              }
            >
              <Link className={styles.SidebarSectionHeader} to={e.href}>
                {e.title}
              </Link>
            </div>
          );
        })}
      </div>
    );
  }
}
