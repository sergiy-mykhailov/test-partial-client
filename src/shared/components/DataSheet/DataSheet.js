import React from 'react';
import Cell from './Cell';
import classnames from 'classnames';
import * as utils from './utils';
import * as styles from './styles.css';
import DataSource from './DataSource';
import ContextMenu from './ContextMenu';
import { Button } from '../Button';
import { Sale as ISale } from '../../../types';
import Selection from './Selection';
import { extractLabel } from 'hot-formula-parser';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';

const cellReg = /(([A-Za-z0-9]+)(!))?([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const rangeReg = /([A-Za-z0-9]+)(!)?([$])?([A-Za-z]+)([$])?([0-9]+)(:)([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const sheetReg = /([A-Za-z0-9]+)(!)/g;

const datasheetClassnames = isScrolling =>
  classnames(styles.DataSheet, {
    [styles.isScrolling]: isScrolling
  });

type ICell = {
  formula: string | null,
  value: string | null,
  error: string | null
};

type TableData = ICell[][][];

type GetData = () => TableData;

type Props = {
  userSheets: TableData,
  appSheets: ISales[],
  activeSheet?: string,
  onUpdate: ({ getData: GetData }) => void
};

export default class DataSheet extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.dataSource = new DataSource(props.appSheets, props.userSheets, props.onUpdate);
    let activeSheet =
      this.props.activeSheet || Object.keys(props.appSheets)[0] || Object.keys(props.userSheets)[0];
    this.state.selection = [activeSheet, [0, 0], [0, 0]];
    this.state.activeSheet = activeSheet;

    Object.keys(utils).forEach(
      function(key) {
        if (typeof utils[key] === 'function') this[key] = utils[key].bind(this);
        console.log(key);
      }.bind(this)
    );
  }

  state = {
    isScrolling: false,
    mouseDownCell: null,
    isSelectedCellEditing: false,
    isSelectedSheetLocked: true,
    rowOffset: 0,
    columnOffset: 0,
    width: 0,
    height: 0,
    visibleRows: 0,
    visibleColumns: 0,
    copied: null,
    showContextMenu: false,
    contextMenuX: 0,
    contextMenuY: 0,
    formulaBar: '',
    addSheetModal: false,
    newSheetName: 'New Sheet Name'
  };

  scroll = {
    x: 0,
    y: 0
  };

  width = 0;
  height = 0;

  maxScrollX = 0;
  maxScrollY = 0;

  styleCache = {};

  componentWillReceiveProps(nextProps) {
    this.dataSource.updateData(nextProps.userSheets);
    if (JSON.stringify(nextProps.appSheets) !== JSON.stringify(this.props.appSheets)) {
      this.dataSource.updateAppDataSheets(nextProps.appSheets);
    }
    if (this.state.isSelectedCellEditing) this.formulaBarRef.focus();
  }

  componentWillUpdate(nextProps, nextState) {
    this.calculateCells(nextState);
  }

  componentDidMount() {
    this.bindArrowKeys();
    this.bindResize();

    this.onResize();
  }

  componentWillUnmount() {
    this.unbindArrowKeys();
    this.unbindResize();
  }

  calculateCells(state = this.state) {
    const {
      isScrolling,
      selection,
      activeSheet,
      rowOffset,
      columnOffset,
      width,
      height,
      isSelectedCellEditing,
      visibleColumns,
      visibleRows
    } = state;

    this.cells = this.cellRange({
      isSelectedCellEditing,
      isScrolling,
      verticalOffset: rowOffset,
      horizontalOffset: columnOffset,
      tableHeight: height,
      tableWidth: width,
      cellRenderer: this.cellRenderer,
      labelRenderer: this.labelRenderer,
      styleCache: this.styleCache,
      rowCount: this.dataSource.rowCount(),
      columnCount: this.dataSource.columnCount(),
      selection,
      activeSheet: activeSheet
    });
  }

  cellRenderer = ({
    style,
    activeSheet,
    rowIndex,
    columnIndex,
    key,
    isSelected,
    isSelectedCellEditing
  }) => {
    const val = this.dataSource.getCellValue(activeSheet, rowIndex, columnIndex);
    return (
      <div
        className={styles.CellContainer}
        style={style}
        key={key}
        onMouseMove={() => {
          if (!this.state.isSelectedCellEditing) this.setSelection(rowIndex, columnIndex);
        }}
        onMouseUp={e => {
          if (!this.state.isSelectedCellEditing) {
            this.setSelection(rowIndex, columnIndex);
          } else {
            if (
              this.state.mouseDownCell[0] !== rowIndex ||
              this.state.mouseDownCell[1] !== columnIndex
            ) {
              this.insertIntoFormulaBarAtCursor(
                ':' +
                  this.dataSource
                    .toLabel(activeSheet, rowIndex, columnIndex)
                    .replace(this.state.activeSheet + '!', '')
              );
            }
          }
          this.setState({ mouseDownCell: null });
        }}
        onMouseDown={e => {
          e.preventDefault();
          this.setState({ mouseDownCell: [rowIndex, columnIndex] });
          if (!this.state.isSelectedCellEditing) {
            this.closeContextMenu();
          } else {
            this.insertIntoFormulaBarAtCursor(
              this.dataSource.toLabel(activeSheet, rowIndex, columnIndex)
            );
          }
        }}
        onContextMenu={this.handleContextMenu}
      >
        <Cell
          value={val}
          isSelected={isSelected}
          col={columnIndex}
          row={rowIndex}
          sheet={activeSheet}
        />
      </div>
    );
  };

  labelRenderer = ({
    style,
    activeSheet,
    rowIndex,
    columnIndex,
    key,
    isSelected,
    isSelectedCellEditing
  }) => {
    if (rowIndex === 0) {
      var val = this.dataSource.columnIndexToLabel(columnIndex - 1);
    } else {
      var val = this.dataSource.rowIndexToLabel(rowIndex - 1);
    }

    return (
      <div
        className={styles.CellContainer}
        style={style}
        key={'label' + key}
        onContextMenu={this.handleContextMenu}
      >
        <Cell
          value={{ value: val }}
          col={columnIndex}
          row={rowIndex}
          sheet={activeSheet}
          isEditing={false}
          isLabel={true}
        />
      </div>
    );
  };

  render() {
    return (
      <div className={styles.AnalysisContent}>
        <div className={styles.AnalysisContainer}>
          <div className={styles.SheetContainer}>
            <div>
              <div className={styles.toolBar}>
                <input
                  value={this.state.formulaBar}
                  placeholder="=Fx"
                  ref={inputRef => {
                    this.formulaBarRef = inputRef;
                  }}
                  onChange={e => {
                    this.dataSource.updateCell(
                      this.state.selection[0],
                      this.state.selection[1][1],
                      this.state.selection[1][0],
                      e.target.value,
                      true
                    );
                    this.updateFormulaBar();
                    this.forceUpdate();
                  }}
                  disabled={!this.state.isSelectedCellEditing}
                />
              </div>
              <div
                className={datasheetClassnames(this.state.isScrolling)}
                onWheel={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.onScroll(e.deltaX, e.deltaY);
                }}
                ref={ds => (this.d = ds)}
              >
                {this.cells}
                {this.getSelections()}
                {
                  <Selection
                    selection={this.state.selection}
                    activeSheet={this.state.activeSheet}
                    mouseDownCell={this.state.mouseDownCell}
                    rowOffset={this.state.rowOffset}
                    columnOffset={this.state.columnOffset}
                    handleContextMenu={this.handleContextMenu}
                    onMouseUp={e => {
                      this.setState({ mouseDownCell: null });
                    }}
                  />
                }
                <ContextMenu
                  show={this.state.showContextMenu}
                  top={this.state.contextMenuY}
                  left={this.state.contextMenuX}
                >
                  <button
                    onClick={() => {
                      this.copySelection();
                      this.closeContextMenu();
                    }}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      this.pasteSelection();
                      this.closeContextMenu();
                    }}
                  >
                    Paste
                  </button>
                  <hr />
                  <button
                    onClick={() => {
                      this.dataSource.addColumn(this.state.activeSheet, this.state.selection[1][0]);
                      this.closeContextMenu();
                      this.forceUpdate();
                    }}
                  >
                    Insert Column Before
                  </button>
                  <button
                    onClick={() => {
                      this.dataSource.addColumn(
                        this.state.activeSheet,
                        this.state.selection[2][0] + 1
                      );
                      this.closeContextMenu();
                      this.forceUpdate();
                    }}
                  >
                    Insert Column After
                  </button>
                  <button
                    onClick={() => {
                      this.dataSource.addRow(this.state.activeSheet, this.state.selection[1][1]);
                      this.closeContextMenu();
                      this.forceUpdate();
                    }}
                  >
                    Insert Row Before
                  </button>
                  <button
                    onClick={() => {
                      this.dataSource.addRow(
                        this.state.activeSheet,
                        this.state.selection[2][1] + 1
                      );
                      this.closeContextMenu();
                      this.forceUpdate();
                    }}
                  >
                    Insert Row After
                  </button>
                  <hr />
                  <button
                    onClick={() => {
                      this.clearSelection();
                      this.closeContextMenu();
                    }}
                  >
                    Clear Cells
                  </button>
                </ContextMenu>
              </div>
            </div>
          </div>
          <ul className={styles.tabMenu}>
            {Object.keys(this.props.appSheets).map((key, index) => {
              var selected = this.state.activeTable === key ? styles.selected : '';
              return (
                <li key={'sheet ' + key}>
                  <button
                    className={selected + ' ' + styles.locked}
                    onClick={() => {
                      this.changeActiveSheet(key);
                    }}
                  >
                    {key}
                  </button>
                </li>
              );
            })}
            {Object.keys(this.props.userSheets).map((key, index) => {
              var selected = this.state.activeTable === key ? styles.selected : '';
              return (
                <li key={'sheet ' + key}>
                  <button
                    className={selected}
                    onClick={() => {
                      this.changeActiveSheet(key);
                    }}
                  >
                    {key}
                  </button>
                </li>
              );
            })}
            <li>
              <button onClick={this.addSheetModal}>Add Sheet+</button>
            </li>
          </ul>
        </div>
        <Modal
          show={this.state.showAddSheetModal}
          showCancel={true}
          showOk={true}
          onCancel={() => {
            this.setState({ showAddSheetModal: false });
          }}
          onOk={() => {
            this.dataSource.addSheet(this.state.newSheetName.replace(/ /g, '').replace(/_/g, ''));
            this.setState({ showAddSheetModal: false, newSheetName: '' });
          }}
        >
          <Input
            value={this.state.newSheetName}
            type="text"
            name="SheetName"
            onChange={event => {
              this.setState({ newSheetName: event.target.value });
            }}
          />
          <br />
          <br />
          <small>please only use numbers, letters, and spaces. ('test sheet 1')</small>
        </Modal>
      </div>
    );
  }
}
