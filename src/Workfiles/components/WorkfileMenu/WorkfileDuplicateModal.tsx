import * as React from 'react';
import { Input } from '../../../shared/components/Input';
import { Label } from '../../../shared/components/Label';
import { Sale as ISale, WorkfileDuplicateParams } from '../../../types';
import { Modal } from '../../../shared/components/Modal';
import * as styles from './styles.css';
import * as classnames from 'classnames';
import WorkfileService from '../../../services/workfiles';
import SaleService from '../../../services/sales';

interface State {
  duplicatedParams: WorkfileDuplicateParams;
  sales: ISale[];
}

interface Props {
  workfileId: string | number;
  show: boolean;
  onOk: (params: WorkfileDuplicateParams) => void;
}

export class WorkfileDuplicateModal extends React.Component<Props, State> {
  state = {
    duplicatedParams: {
      appraiser: true,
      client: true,
      subject_property: true,
      selected_sales: []
    },
    sales: []
  };
  paramLabels = [
    { key: 'appraiser', label: 'Appraiser' },
    { key: 'client', label: 'Client' },
    { key: 'subject_property', label: 'Subject Property' }
  ];

  async fetchSales() {
    let saleIds = await WorkfileService.getWorkfileSales(this.props.workfileId);

    let sales = [];
    await Promise.all(
      saleIds.map(async id => {
        sales.push(await SaleService.getSale(id));
      })
    );

    this.setState({ sales: sales });
  }

  componentDidMount() {
    this.fetchSales();
  }

  onChange(e: any) {
    let selected = e.target.checked;
    let duplicatedParams = this.state.duplicatedParams;

    duplicatedParams[e.target.name] = selected;
    this.setState({ duplicatedParams });
  }

  // Change method that handles Selected Sales
  // If issues arise, might convert this to a set.
  onChangeSales(e: any) {
    let selected = e.target.checked;
    let duplicatedParams = this.state.duplicatedParams;

    if (selected) {
      duplicatedParams.selected_sales.push(e.target.name);
    } else {
      let index = duplicatedParams.selected_sales.findIndex(saleId => {
        return (saleId = e.target.name);
      });
      duplicatedParams.selected_sales.splice(index, 1);
    }
    this.setState({ duplicatedParams });
  }

  onOk() {
    this.props.onOk(this.state.duplicatedParams);
  }

  render() {
    return (
      <div>
        <Modal
          show={this.props.show}
          onOk={this.onOk.bind(this)}
          className={styles.WorkfileMenuModal}
        >
          {this.paramLabels.map(item => {
            return (
              <div key={item.key}>
                <Label htmlFor={item.label}>{item.label}</Label>
                <Input
                  type="checkbox"
                  name={item.key}
                  defaultChecked={this.state.duplicatedParams[item.key]}
                  onChange={this.onChange.bind(this)}
                />
              </div>
            );
          })}
          {Boolean(this.state.sales.length) && <h3>Selected Sales</h3>}
          {this.state.sales.map((sale: ISale) => {
            return (
              <div key={sale.id}>
                <Label htmlFor={String(sale.id)}>
                  Parcel ID: {sale.parcel_id} Grantor: {sale.grantor}
                </Label>
                <Input
                  type="checkbox"
                  name={String(sale.id)}
                  defaultChecked={this.state.duplicatedParams.selected_sales.includes(sale.id)}
                  onChange={this.onChangeSales.bind(this)}
                />
              </div>
            );
          })}
        </Modal>
      </div>
    );
  }
}
