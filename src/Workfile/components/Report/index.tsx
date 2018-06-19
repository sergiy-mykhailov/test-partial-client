import * as React from 'react';
import { RouteComponentProps, Redirect, Link } from 'react-router-dom';
import { AutoSizer } from 'react-virtualized';
import { Sale as ISale, SaleFilter as ISaleFilter } from '../../../types';
import WorkfileService from '../../../services/workfiles';
import SaleService from '../../../services/sales';
import { Button } from '../../../shared/components/Button';
import { LeftChevron } from '../../../shared/components/Icons/LeftChevron';
import { RightChevron } from '../../../shared/components/Icons/RightChevron';
import { SalesComparison } from './SalesComparison';
import * as styles from './reportStyles.css';

const SALES_PER_PAGE = 6;

export interface ReportProps {
  workfileId: string;
}

export interface ReportState {
  sales: ISale[];
  reportSaleIds: number[];
  page: number;
}

export class Report extends React.Component<RouteComponentProps<ReportProps>, ReportState> {
  state: ReportState = {
    sales: [],
    reportSaleIds: [],
    page: 1
  };

  componentWillMount() {
    this.fetchSales();
  }

  async fetchSales() {
    Promise.all([
      SaleService.getSales(),
      WorkfileService.getWorkfileSales(this.props.match.params.workfileId)
    ]).then(([sales, reportSaleIds]) => {
      this.setState(() => ({
        sales,
        reportSaleIds
      }));
    });
  }

  isSaleSelected = ({ id }: ISale): boolean => this.state.reportSaleIds.indexOf(id) > -1;

  reportSales = (): ISale[] => this.state.sales.filter(this.isSaleSelected);

  pageCount = (): number => Math.ceil(this.state.reportSaleIds.length / SALES_PER_PAGE);

  reportsForPage(page: number): ISale[] {
    const first = (page - 1) * SALES_PER_PAGE;
    const last = (page - 1) * SALES_PER_PAGE + SALES_PER_PAGE;

    return this.reportSales().slice(first, last);
  }

  setPage = (pageDif: number) =>
    this.setState(() => ({
      page: this.state.page + pageDif
    }));

  hasNextPage() {
    const newPage = this.state.page + 1;

    return newPage <= this.pageCount();
  }

  hasPrevPage() {
    const newPage = this.state.page - 1;

    return newPage > 0;
  }

  headerSaleMin() {
    return SALES_PER_PAGE * (this.state.page - 1) + 1;
  }

  headerSaleMax() {
    const { page, sales, reportSaleIds } = this.state;
    const saleCount = reportSaleIds.length;
    const previousSales = (page - 1) * SALES_PER_PAGE;

    const remainingSales = Math.min(saleCount - previousSales, SALES_PER_PAGE);
    return this.headerSaleMin() - 1 + remainingSales;
  }

  render() {
    const { page } = this.state;

    return (
      <div className={styles.Report}>
        <div className={styles.ReportHeader}>
          <h1>Report</h1>

          <div className={styles.PagePicker}>
            <Button disabled={!this.hasPrevPage()} onClick={() => this.setPage(-1)} type="light">
              <LeftChevron />
            </Button>

            <div className={styles.PagePickerText}>
              Page {page} of {this.pageCount()}
            </div>

            <Button disabled={!this.hasNextPage()} onClick={() => this.setPage(1)} type="light">
              <RightChevron />
            </Button>
          </div>
        </div>

        <h3 className={styles.PageHeader}>
          Sales {this.headerSaleMin()} - {this.headerSaleMax()}
        </h3>
        <SalesComparison
          key={`page-${page}`}
          sales={this.reportsForPage(page)}
          page={page}
          salesPerPage={SALES_PER_PAGE}
        />
      </div>
    );
  }
}
