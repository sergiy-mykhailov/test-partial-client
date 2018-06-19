import * as React from 'react';
import { Sale } from '../../types';
import * as styles from './styles.css';
import { format } from 'date-fns';
import { Button } from '../../shared/components/Button';
import { Link } from 'react-router-dom';
import * as classnames from 'classnames';
import SaleService from '../../services/sales';

export interface SaleItemProps {
  sale: Sale;
  updateSales: Function;
}

export interface SaleItemState {
  moreMenuOpen: boolean;
}

export class SaleItem extends React.Component<SaleItemProps, SaleItemState> {
  constructor(props: any) {
    super(props);
    this.state = { moreMenuOpen: false };
  }

  toggleMoreMenu() {
    this.setState({ moreMenuOpen: !this.state.moreMenuOpen });
  }

  onCopyclick() {}

  async onDeleteClick() {
    await SaleService.deleteSale(this.props.sale.id);
    this.props.updateSales();
  }

  render() {
    let { sale } = this.props;

    return (
      <div className={styles.SaleItem}>
        <div className={styles.SaleItemName}>Sale {sale.id}</div>

        <div className={styles.SaleItemPreparedFor}>
          <div className={styles.SaleItemSectionHeader}>Sale Price:</div>

          <div className={styles.SaleItemSectionText}>{sale.sale_price}</div>
        </div>

        <div className={styles.SaleItemDateCreated}>
          <div className={styles.SaleItemSectionHeader}>Sale Date:</div>
          <div className={styles.SaleItemSectionText}>{format(sale.sale_date, 'M / D / YY')}</div>
        </div>

        <div>
          <Link to={`/sales/${sale.id}/update`}>
            <Button type="secondary">Continue</Button>
          </Link>
        </div>

        <div
          className={classnames('fa fa-ellipsis-v', styles.SaleItemMoreButton)}
          onClick={this.toggleMoreMenu.bind(this)}
        />
        <div
          className={classnames(styles.SaleItemMoreMenu, {
            [styles.SaleItemMoreMenuOpen]: this.state.moreMenuOpen
          })}
        >
          <div className={styles.SaleItemMoreMenuItem}>Copy</div>
          <div className={styles.SaleItemMoreMenuItem} onClick={this.onDeleteClick.bind(this)}>
            Delete
          </div>
        </div>
      </div>
    );
  }
}
