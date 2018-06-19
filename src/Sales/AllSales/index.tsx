import * as React from 'react';
import { RouteComponentProps, Link, Switch, Route } from 'react-router-dom';
import { TabbedTable, Tab, TabBar, TabContent } from '../../shared/components/TabbedTable';
import { TabIndicator } from '../../shared/components/TabIndicator';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { Button } from '../../shared/components/Button';
import { InnerWrapper } from '../../shared/layouts/InnerWrapper';
import { SaleItem } from '../SaleItem';
import * as styles from '../styles.css';
import { Sale as ISale, File as IFile } from '../../types';
import SaleService from '../../services/sales';

interface SalesState {
  sales: ISale[];
  isLoading: boolean;
  filterStatus: string | null;
  error: string;
}

interface Params {
  saleId: string;
}

export class AllSales extends React.Component<RouteComponentProps<Params>, SalesState> {
  state = {
    sales: [],
    isLoading: false,
    filterStatus: '',
    error: ''
  };

  async componentDidMount() {
    await this.fetchSales();
  }

  async fetchSales() {
    this.setState({ isLoading: true });
    try {
      let sales = await SaleService.getSales();
      this.setState({ sales: sales }, () => {
        this.setState({ isLoading: false });
      });
    } catch (e) {
      const error =
        typeof e === 'string' ? e.toLocaleUpperCase() : 'An error occured while loading sales';

      this.setState(
        () => ({
          error
        }),
        () => {
          this.setState({ isLoading: false });
        }
      );

      // this.toggleIsLoading();
      console.log(e);
    }
  }

  setFilterStatus(filterStatus = null): void {
    this.setState({
      filterStatus
    });
  }

  filterSales(sales: Array<ISale>, filterStatus: string | null = null): Array<ISale> {
    if (!filterStatus) {
      return sales;
    }

    return sales.filter(sale => sale.status === filterStatus);
  }

  countPerStatus(sales: Array<ISale>, status: string | null = null): number {
    return this.filterSales(sales, status).length;
  }

  render() {
    let { sales, isLoading, filterStatus, error } = this.state;
    const filteredSales = this.filterSales(sales, filterStatus);
    return (
      <InnerWrapper>
        <div className={styles.CreateButton}>
          <Link to={`/sales/import`}>
            <Button>&#43; Import Files</Button>
          </Link>
          <Link to={`/sales/new`}>
            <Button>&#43; Add Sale</Button>
          </Link>
        </div>
        <TabbedTable>
          <TabBar>
            <Tab onClick={() => this.setFilterStatus()}>
              {(isActive: boolean) => (
                <TabIndicator
                  type="secondary"
                  count={this.countPerStatus(sales)}
                  isActive={isActive}
                  title="All"
                />
              )}
            </Tab>
            <Tab onClick={() => this.setFilterStatus('deleted')}>
              {(isActive: boolean) => (
                <TabIndicator
                  type="secondary"
                  count={this.countPerStatus(sales, 'deleted')}
                  isActive={isActive}
                  title="Deleted"
                />
              )}
            </Tab>
          </TabBar>

          <TabContent>
            {!isLoading &&
              filteredSales.length > 0 &&
              filteredSales.map(sale => {
                return (
                  <SaleItem sale={sale} key={sale.id} updateSales={this.fetchSales.bind(this)} />
                );
              })}

            {!isLoading &&
              !error &&
              filteredSales.length === 0 && (
                <div className={styles.BlankSales}>
                  <div className={styles.NoSalesText}>No sales with this status</div>
                </div>
              )}

            {!!error && <div className={styles.BlankSales}>{error}</div>}

            {isLoading && (
              <div className={styles.BlankSales}>
                <LoadingIndicator />
                Loading Sales
              </div>
            )}
          </TabContent>
        </TabbedTable>
      </InnerWrapper>
    );
  }
}
