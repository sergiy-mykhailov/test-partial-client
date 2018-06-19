import * as React from 'react';
import { RouteComponentProps, Link, Switch, Route } from 'react-router-dom';
// import * as styles from './styles.css';
import SaleService from '../../services/sales';
import { Sale as ISale, File as IFile, Cell } from '../../types';
import { labels } from '../../shared/components/labels';
import { makeCell } from '../../shared/components/DataSheet/utils';
import DataSheet from '../../shared/components/DataSheet';
import * as styles from '../styles.css';

interface SalesState {
  isLoading: boolean;
  sale: ISale;
  appData: Cell[][][];
}

interface Params {
  saleId: string;
}

export class SaleAnalysis extends React.Component<RouteComponentProps<Params>, SalesState> {
  state = { isLoading: true, sale: null, appData: null };

  componentDidMount() {
    this.loadSale(this.props.match.params.saleId);
  }

  generateAppData() {
    let appData = [];
    appData['sale'] = [];

    for (let i = 0; i < labels.length; i++) {
      appData['sale'].push([makeCell(labels[i].label), makeCell(this.state.sale[labels[i].key])]);
    }

    this.setState({ appData, isLoading: false });
  }

  async loadSale(saleId: string) {
    this.setState({
      isLoading: true
    });

    const sale = await SaleService.getSale(parseInt(saleId));

    if (sale.id.toString() !== this.props.match.params.saleId) return;

    this.setState(
      {
        sale
      },
      this.generateAppData
    );
  }

  render() {
    let userSheets = [];
    userSheets['sheet2'] = [[{ value: 'Hello World', error: null, formula: null }]];
    return (
      !this.state.isLoading && (
        <div className={styles.AnalysisContainer}>
          <h1>Analysis</h1>
          <DataSheet appSheets={this.state.appData} userSheets={userSheets} onUpdate={() => {}} />
        </div>
      )
    );
  }
}
