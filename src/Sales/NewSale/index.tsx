import * as React from 'react';
import { RouteComponentProps, Link, Redirect } from 'react-router-dom';
// import * as styles from './styles.css';
import SaleService from '../../services/sales';
import { Sale as ISale, NewSale as INewSale } from '../../types';
import { SaleForm } from '../SaleForm';
import { Button } from '../../shared/components/Button';

type IEditable<T> = { [P in keyof T]?: T[P] };

interface NewSaleState {
  sale: INewSale;
  newSale?: ISale;
  isSaving: boolean;
}

export class NewSale extends React.Component<{}, NewSaleState> {
  constructor(props: any) {
    super(props);

    const newSale = {
      parcel_id: '',
      description: '',
      grantor: '',
      grantee: '',
      sale_date: '',
      county: '',
      section: '',
      township: '',
      range: '',
      total_acres: 0,
      cost_per_acre: 0,
      comments: '',
      sales_adjustments_land: 0,
      sales_adjustments_improvements: 0,
      sales_adjustments_net: 0,
      sales_adjustments_gross: 0,
      income_analysis_cap_rate: 0,
      income_analysis_improvement: 0,
      income_analysis_expense_ratio: 0,
      verification: '',
      sale_state: ''
    };

    this.state = {
      sale: newSale,
      isSaving: false,
      newSale: null
    };
  }

  updateSale(key: keyof INewSale, value: string): void {
    this.setState({
      sale: {
        ...this.state.sale,
        [key]: value
      }
    });
  }

  async handleSubmit(): Promise<void> {
    const { sale } = this.state;

    this.setState({
      isSaving: true
    });

    const newSale = await SaleService.createSale(sale);

    this.setState({
      newSale,
      isSaving: false
    });
  }

  render() {
    let { sale, newSale, isSaving } = this.state;

    if (newSale && newSale.id) {
      return <Redirect to={`/sales/${newSale.id}`} />;
    }

    return (
      <div>
        <SaleForm
          sale={sale}
          onUpdate={this.updateSale.bind(this)}
          isSaving={isSaving}
          onSave={this.handleSubmit.bind(this)}
          buttonText="Create Sale"
        />
      </div>
    );
  }
}
