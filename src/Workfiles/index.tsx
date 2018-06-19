import * as React from 'react';
import * as styles from './styles.css';
import { TabbedTable, Tab, TabBar, TabContent } from '../shared/components/TabbedTable';
import { TabIndicator } from '../shared/components/TabIndicator';
import { WorkfileItem } from './components/WorkfileItem';
import { Workfile, WorkfileStatus } from '../types';
import { LoadingIndicator } from '../shared/components/LoadingIndicator';
import { InnerWrapper } from '../shared/layouts/InnerWrapper';
import { Button } from '../shared/components/Button';
import { Link } from 'react-router-dom';
import WorkfilesService from '../services/workfiles';
import AuthService from '../services/auth';

interface WorkfilesState {
  filterStatus: WorkfileStatus | null;
  workfiles: Array<Workfile>;
  isLoading: boolean;
  error: string;
}

export class Workfiles extends React.Component<undefined, WorkfilesState> {
  constructor(props: any) {
    super(props);

    this.state = {
      filterStatus: null,
      workfiles: [],
      isLoading: false,
      error: ''
    };
  }

  componentWillMount() {
    this.fetchWorkfiles();
  }

  setFilterStatus(filterStatus: WorkfileStatus | null = null): void {
    this.setState({
      filterStatus
    });
  }

  async fetchWorkfiles(): Promise<void> {
    this.toggleIsLoading();

    try {
      WorkfilesService.clearCacheRequest();
      const workfiles = await WorkfilesService.getWorkfiles();

      this.setState({ workfiles }, this.toggleIsLoading);
    } catch (e) {
      const error =
        typeof e === 'string' ? e.toLocaleUpperCase() : 'An error occured while loading workfiles';

      this.setState(
        () => ({
          error
        }),
        this.toggleIsLoading
      );
      // this.toggleIsLoading();
      console.log(e);
    }
  }

  toggleIsLoading(): void {
    this.setState({
      isLoading: !this.state.isLoading
    });
  }

  filterWorkfiles(
    workfiles: Array<Workfile>,
    filterStatus: WorkfileStatus | null = null
  ): Array<Workfile> {
    if (!filterStatus) {
      return workfiles;
    }

    return workfiles.filter(workfile => workfile.status === filterStatus);
  }

  countPerStatus(workfiles: Array<Workfile>, status: WorkfileStatus | null = null): number {
    return this.filterWorkfiles(workfiles, status).length;
  }

  render() {
    const { workfiles, isLoading, filterStatus, error } = this.state;

    const filteredWorkfiles = this.filterWorkfiles(workfiles, filterStatus);

    return (
      <InnerWrapper>
        <div className={styles.CreateButton}>
          <Link to={`/create-workfile`}>
            <Button>&#43; Add Workfile</Button>
          </Link>
        </div>
        <TabbedTable>
          <TabBar>
            <Tab onClick={() => this.setFilterStatus('in-progress')}>
              {(isActive: boolean) => (
                <TabIndicator
                  type="important"
                  count={this.countPerStatus(workfiles, 'in-progress')}
                  isActive={isActive}
                  title="In Progress"
                />
              )}
            </Tab>

            <Tab onClick={() => this.setFilterStatus('revised')}>
              {(isActive: boolean) => (
                <TabIndicator
                  count={this.countPerStatus(workfiles, 'revised')}
                  isActive={isActive}
                  title="In Review"
                />
              )}
            </Tab>

            <Tab onClick={() => this.setFilterStatus('prospective')}>
              {(isActive: boolean) => (
                <TabIndicator
                  count={this.countPerStatus(workfiles, 'prospective')}
                  isActive={isActive}
                  title="Prospective"
                />
              )}
            </Tab>

            <Tab onClick={() => this.setFilterStatus('completed')}>
              {(isActive: boolean) => (
                <TabIndicator
                  type="primary"
                  count={this.countPerStatus(workfiles, 'completed')}
                  isActive={isActive}
                  title="Complete"
                />
              )}
            </Tab>

            <Tab onClick={() => this.setFilterStatus()}>
              {(isActive: boolean) => (
                <TabIndicator
                  type="secondary"
                  count={this.countPerStatus(workfiles)}
                  isActive={isActive}
                  title="All"
                />
              )}
            </Tab>
          </TabBar>

          <TabContent>
            {!isLoading &&
              filteredWorkfiles.length > 0 &&
              filteredWorkfiles.map(workfile => {
                return (
                  <WorkfileItem
                    workfile={workfile}
                    key={workfile.id}
                    updateWorkfiles={this.fetchWorkfiles.bind(this)}
                  />
                );
              })}

            {!isLoading &&
              !error &&
              filteredWorkfiles.length === 0 && (
                <div className={styles.BlankWorkfiles}>
                  <div className={styles.NoWorkfilesText}>No workfiles with this status</div>
                </div>
              )}

            {!!error && <div className={styles.BlankWorkfiles}>{error}</div>}

            {isLoading && (
              <div className={styles.BlankWorkfiles}>
                <LoadingIndicator />
                Loading Workfiles
              </div>
            )}
          </TabContent>
        </TabbedTable>
      </InnerWrapper>
    );
  }
}
