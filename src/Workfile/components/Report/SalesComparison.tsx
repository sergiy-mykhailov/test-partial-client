import * as React from 'react';
import { Sale as ISale, SaleFilter as ISaleFilter } from '../../../types';
import { cellContentPerKey } from '../../utils/cellContentPerKey';
import { labels } from '../../../shared/components/labels';
import * as styles from './reportStyles.css';

interface SalesComparisonProps {
  sales: ISale[];
  salesPerPage: number;
  page: number;
}

export class SalesComparison extends React.Component<SalesComparisonProps> {
  saleCount() {
    return this.props.sales.length;
  }

  headerSaleMin() {
    return this.props.salesPerPage * (this.props.page - 1) + 1;
  }

  headerSaleMax() {
    return this.headerSaleMin() - 1 + this.saleCount();
  }

  columnWidth() {
    return 100 / (this.saleCount() + 2);
  }

  saleNumber(i: number) {
    return this.headerSaleMin() + i;
  }

  render() {
    const { sales } = this.props;
    const columnWidthStyles = { style: { width: this.columnWidth() + '%' } };

    return (
      <table className={styles.SalesComparison}>
        <thead>
          <tr>
            <th {...columnWidthStyles}>Sales Data</th>

            {sales.map((s, i) => {
              return (
                <th {...columnWidthStyles} key={`sale-header-${s.id}`}>
                  Sale #{this.saleNumber(i)}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td colSpan={this.saleCount() + 2} className={styles.SubHeader}>
              Sale Data
            </td>
          </tr>
          {labels.map(label => {
            return (
              <tr key={`sale-row-${label.key}`}>
                <td {...columnWidthStyles} className={styles.LabelColumn}>
                  {label.label}
                </td>

                {sales.map(sale => {
                  return (
                    <td {...columnWidthStyles} key={`sale-data-${label.key}-${sale.id}`}>
                      {cellContentPerKey(sale, label.key)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
