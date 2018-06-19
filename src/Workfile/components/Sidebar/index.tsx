import * as React from 'react';
import * as styles from './styles.css';
import { RouteComponentProps, Link, matchPath } from 'react-router-dom';
import TractService from '../../../services/tracts';
import { LeftChevron } from '../../../shared/components/Icons/LeftChevron';
import { Sidebar as SidebarContainer } from '../../../shared/layouts/Sidebar';
import { SidebarMenu } from '../../../shared/components/SidebarMenu';
import { Tract as ITract } from '../../../types';
import * as classnames from 'classnames';

export interface SidebarProps {
  workfileId: string;
}

export interface SidebarState {
  isOpen: boolean;
  selectedId: number;
  tracts: Array<ITract>;
  isLoading: boolean;
}

export class Sidebar extends React.Component<RouteComponentProps<SidebarProps>, SidebarState> {
  unsubscribeFromTracts: Function;
  mounted: boolean;

  constructor(props: RouteComponentProps<SidebarProps>) {
    super(props);

    this.state = {
      isOpen: true,
      selectedId: 1,
      tracts: [],
      isLoading: false
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadTracts();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.unsubscribeFromTracts && this.unsubscribeFromTracts();
  }

  async loadTracts(): Promise<void> {
    this.setState({
      isLoading: true
    });

    const { workfileId } = this.props.match.params;

    try {
      const tracts = await TractService.getTracts(workfileId);

      if (!this.mounted) return;

      this.setState({
        tracts,
        isLoading: false
      });

      this.unsubscribeFromTracts = TractService.subscribeToTractsForWorkfile(
        workfileId,
        this.handleTractsUpdate
      );
    } catch (e) {
      this.setState({
        isLoading: false
      });
    }
  }

  handleTractsUpdate = (tracts: Array<ITract>): void => {
    this.setState({
      tracts
    });
  };

  itemClassName(isSelected: boolean): string {
    return classnames(styles.SidebarSectionItem, {
      [styles.SidebarSectionItemSelected]: isSelected
    });
  }

  isRoutedToSection = (path: string): boolean => {
    const { pathname } = this.props.location;

    const match = matchPath(pathname, {
      path: `/workfiles/:workfileId/${path}`,
      exact: false
    });

    return !!match && match.isExact;
  };

  isRoutedToOneOfSections(...sections: Array<string>) {
    return sections.map(this.isRoutedToSection).some(isRouted => isRouted);
  }

  sortTracts(tracts: Array<ITract>): Array<ITract> {
    return tracts.sort((a, b) => a.id - b.id);
  }

  render() {
    const { tracts, isLoading } = this.state;
    const { url } = this.props.match;

    return (
      <SidebarContainer>
        <div className={styles.NavigateBackSection}>
          <Link className={styles.NavigateBackLink} to="/workfiles">
            <LeftChevron className={styles.BackIcon} /> Workfiles
          </Link>
        </div>
        <SidebarMenu
          menuitems={[
            {
              href: this.props.match.url + '/appraiser',
              title: 'Appraiser Info'
            },
            { href: this.props.match.url + '/client', title: 'Client Info' }
          ]}
          pathname={this.props.location.pathname}
        />

        <div
          className={
            this.isRoutedToOneOfSections('tracts/:tractId', 'summary', 'map')
              ? styles.SidebarSectionSelected
              : styles.SidebarSection
          }
        >
          <div className={styles.SidebarSectionHeader}>Subject Property</div>

          {isLoading && <div className={this.itemClassName(false)}>Loading Tracts...</div>}

          {!isLoading &&
            this.sortTracts(tracts)
              .map((tract, i) => {
                const tractNumber = i + 1;
                const tractRoute = `tracts/${tract.id}`;

                return (
                  <Link
                    className={this.itemClassName(this.isRoutedToSection(tractRoute))}
                    key={`tract-${tract.id}`}
                    to={`${url}/${tractRoute}`}
                  >
                    Tract {tractNumber}
                  </Link>
                );
              })
              .concat(
                [
                  !!tracts.length && (
                    <Link
                      key="map"
                      className={this.itemClassName(this.isRoutedToSection('map'))}
                      to={`${url}/map`}
                    >
                      Map
                    </Link>
                  ),
                  !!tracts.length && (
                    <Link
                      key="summary"
                      className={this.itemClassName(this.isRoutedToSection('summary'))}
                      to={`${url}/summary`}
                    >
                      Summary
                    </Link>
                  ),
                  <Link
                    key="new-tract"
                    className={this.itemClassName(this.isRoutedToSection('tracts/new'))}
                    to={`${url}/tracts/new`}
                  >
                    + New Tract
                  </Link>
                ].filter(comp => !!comp)
              )}
        </div>

        <SidebarMenu
          menuitems={[
            {
              href: this.props.match.url + '/comp-sales',
              title: 'Comparable Sales'
            },
            { href: this.props.match.url + '/analysis', title: 'Analysis' },
            { href: this.props.match.url + '/report-builder', title: 'Reports' }
          ]}
          pathname={this.props.location.pathname}
        />
      </SidebarContainer>
    );
  }
}
