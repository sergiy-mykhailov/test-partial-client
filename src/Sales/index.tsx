import * as React from 'react';
import { RouteComponentProps, Link, Switch, Route } from 'react-router-dom';
import * as styles from './styles.css';
import SaleService from '../services/sales';
import { Sale as ISale, File as IFile } from '../types';
import { SaleForm } from './SaleForm';
import { NewSale } from './NewSale';
import { AllSales } from './AllSales';
import { SingleSale } from './SingleSale';
import { Button } from '../shared/components/Button';
import { FileUpload } from '../shared/components/FileUpload';
import { ImageList } from '../shared/components/FileList';
import { Modal } from '../shared/components/Modal';
import { SaleImportForm } from './SaleImport';

type IEditable<T> = { [P in keyof T]?: T[P] };

interface SalesState {
  sales: ISale[];
}

interface Params {
  saleId: string;
}

export class Sales extends React.Component<RouteComponentProps<Params>, SalesState> {
  state = {
    sales: []
  };
  unsubscribeFromSales: Function;

  async componentDidMount() {
    await this.fetchSales();
  }

  componentWillUnmount() {
    this.unsubscribeFromSales && this.unsubscribeFromSales();
  }

  async fetchSales() {
    let sales = await SaleService.getSales();
    this.setState({ sales: sales });

    this.unsubscribeFromSales = SaleService.subscribeToSales(this.handleSalesUpdate);
  }

  handleSalesUpdate = (sales: Array<ISale>): void => {
    this.setState({
      sales
    });
  };

  render() {
    let { sales } = this.state;
    let { url } = this.props.match;
    return (
      <Switch>
        <Route exact path="/sales/" component={AllSales} />
        <Route exact path="/sales/new" component={NewSale} />
        <Route exact path="/sales/:saleId(\\d+)/*" component={SingleSale} />
        <Route path="/sales/import" exact component={SaleImportForm} />
      </Switch>
    );
  }
}
