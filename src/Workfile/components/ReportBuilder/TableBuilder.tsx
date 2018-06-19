import * as React from 'react';
import * as styles from './styles.css';
import { Tract as ITract, File as IFile, Sale as ISale } from '../../../types';
import { CloseFunction } from '../../../types/Report';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import WorkfileService from '../../../services/workfiles';

export interface TableBuilderProps {
  closeModal: CloseFunction;
  workfileId: string;
  show: boolean;
}

export interface TableBuilderState {
  sales: ISale[];
  reportSaleIds: number[];
  table: Array<Array<Cell>>;
  analysis: any;
  activeTable: string;
  selection: {
    rows: boolean[];
    columns: boolean[];
  };
}

interface Cell {
  formula: string | null;
  value: string | null;
  error: string | null;
}

export class TableBuilder extends React.Component<TableBuilderProps, TableBuilderState> {
  state: TableBuilderState = {
    sales: [],
    reportSaleIds: [],
    selection: {
      columns: [],
      rows: []
    },
    activeTable: 'data',
    table: null,
    analysis: null
  };

  constructor(props: TableBuilderProps) {
    super(props);
    this.setSelection = this.setSelection.bind(this);
    this.fetchWorkfileAnalysis = this.fetchWorkfileAnalysis.bind(this);
    this.insertTable = this.insertTable.bind(this);
  }

  componentDidMount() {
    this.fetchWorkfileAnalysis();
  }

  async fetchWorkfileAnalysis() {
    const workfileId = this.props.workfileId;

    try {
      const analysis: any = await WorkfileService.getSubjectAnalysis(workfileId);
      var rows = [];
      for (let i = 0; i < analysis['data'].length; i++) {
        rows[i] = true;
      }
      var columns = [];
      for (let i = 0; i < analysis['data'][0].length; i++) {
        columns[i] = true;
      }
      this.setState({
        table: analysis,
        selection: { columns: columns, rows: rows }
      });
    } catch (e) {
      console.log(e);
    }
  }

  setSelection(evt: any) {
    var selection = this.state.selection;
    if (evt.target.dataset.column) {
      if (evt.target.checked) {
        selection.columns[evt.target.dataset.column] = true;
      } else {
        selection.columns[evt.target.dataset.column] = false;
      }
    } else {
      if (evt.target.checked) {
        selection.rows[evt.target.dataset.row] = true;
      } else {
        selection.rows[evt.target.dataset.row] = false;
      }
    }
    this.setState({
      selection
    });
  }

  insertTable() {
    let filterString = '';

    let rows = this.getAllIndexes(this.state.selection.rows, false).join(',');
    let columns = this.getAllIndexes(this.state.selection.columns, false).join(',');

    if (rows || columns) {
      filterString += '?';
      if (rows) filterString += 'hideRow=' + rows + ';';
      if (columns) filterString += 'hideCol=' + columns + ';';
    }

    let html = '{{' + this.state.activeTable + filterString + '}}';

    this.props.closeModal();
    document.execCommand('insertHTML', false, html);
  }

  getAllIndexes(arr, val) {
    var indexes = [],
      i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
      indexes.push(i);
    }
    return indexes;
  }

  render() {
    var rows = [];
    var cells = [];
    cells.push(<td key="blank" />);
    if (this.state.table && this.state.table[this.state.activeTable]) {
      for (var a = 0; a < this.state.table[this.state.activeTable][0].length; a++) {
        cells.push(
          <td key={a}>
            <input
              data-column={a}
              onChange={this.setSelection}
              type="checkbox"
              checked={this.state.selection.columns[a]}
            />
          </td>
        );
      }
      rows.push(<tr key="checkboxes">{cells}</tr>);
      for (var i = 0; i < this.state.table[this.state.activeTable].length; i++) {
        var cells = [];
        cells.push(
          <td key={i}>
            <input
              data-row={i}
              type="checkbox"
              onChange={this.setSelection}
              checked={this.state.selection.rows[i]}
            />
          </td>
        );
        for (var a = 0; a < this.state.table[this.state.activeTable][i].length; a++) {
          if (this.state.table[this.state.activeTable][i][a]) {
            cells.push(
              <td key={i + ':' + a}>{this.state.table[this.state.activeTable][i][a].value}</td>
            );
          } else {
            cells.push(<td key={i + ':' + a} />);
          }
        }
        rows.push(<tr key={i}>{cells}</tr>);
      }
    }

    var Tabs = [];
    if (this.state.table) {
      Object.keys(this.state.table).map((key, index) => {
        var selected = this.state.activeTable === key ? styles.selected : '';
        Tabs.push(
          <li key={'sheet ' + key}>
            <button
              className={selected}
              onClick={() => {
                this.setState({ activeTable: key });
              }}
            >
              {key}
            </button>
          </li>
        );
      });
    }
    return (
      <Modal
        show={this.props.show}
        showOk={true}
        okText="Insert Table"
        showCancel={true}
        onCancel={this.props.closeModal}
        onOk={this.insertTable}
      >
        <div className={styles.mediaLibrary}>
          <ul className={styles.tabMenu}>{Tabs}</ul>
          <table>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </Modal>
    );
  }
}
