import * as React from 'react';
import { RouteComponentProps, Link, Switch, Route } from 'react-router-dom';
// import * as styles from './styles.css';
import SaleService from '../../services/sales';
import { Sale as ISale, File as IFile } from '../../types';
import { SaleForm } from '../SaleForm';

type IEditable<T> = { [P in keyof T]?: T[P] };

interface SalesState {
  sale: ISale;
  editableSale?: IEditable<ISale>;
  isLoading: boolean;
  isSaving: boolean;
}

interface Params {
  saleId: string;
}

export class UpdateSale extends React.Component<RouteComponentProps<Params>, SalesState> {
  state = {
    sale: null,
    editableSale: null,
    isLoading: true,
    isSaving: false
  };

  componentDidMount() {
    const { saleId } = this.props.match.params;

    this.loadSale(saleId);
  }

  componentWillReceiveProps(nextProps: RouteComponentProps<Params>) {
    const { saleId } = nextProps.match.params;

    if (this.props.match.params.saleId !== saleId) this.loadSale(saleId);
  }

  async loadSale(saleId: string) {
    this.setState({
      isLoading: true
    });

    const sale = await SaleService.getSale(parseInt(saleId));

    if (sale.id.toString() !== this.props.match.params.saleId) return;

    this.setState({
      sale,
      editableSale: null,
      isLoading: false
    });
  }

  async deleteSale() {
    let { sale } = this.state;
    await SaleService.deleteSale(this.state.sale.id);
    this.props.history.push('/sales');
  }

  handleUpdateSale(key: keyof ISale, value: string): void {
    const { editableSale = {} } = this.state;

    this.setState({
      editableSale: {
        ...editableSale,
        [key]: value
      }
    });
  }

  updatedSale(): ISale {
    const { sale, editableSale = {} } = this.state;

    return {
      ...sale,
      ...editableSale
    };
  }

  async handleSubmit(): Promise<void> {
    const sale = this.updatedSale();

    this.setState({
      isSaving: true
    });

    const updatedSale = await SaleService.updateSale(sale);

    this.setState({
      editableSale: null,
      isSaving: false,
      sale: updatedSale
    });
  }

  render() {
    let { sale, isSaving } = this.state;
    const { saleId } = this.props.match.params;
    return (
      <div>
        <h1>Update Sale: {saleId}</h1>
        <SaleForm
          sale={this.updatedSale()}
          onUpdate={this.handleUpdateSale.bind(this)}
          isSaving={isSaving}
          onSave={this.handleSubmit.bind(this)}
          buttonText="Update Sale"
          onDelete={this.deleteSale.bind(this)}
        />
      </div>
    );
  }
}
