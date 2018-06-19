import {
  Parser as FormulaParser,
  columnIndexToLabel,
  rowIndexToLabel,
  extractLabel,
  SUPPORTED_FORMULAS
} from 'hot-formula-parser';
import uniq from 'lodash.uniq';
import eq from 'lodash.eq';
import difference from 'lodash.difference';
import toposort from 'toposort';

const varReg = /([A-Za-z0-9]+)(!)?([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const cellReg = /(?![A-Za-z]+[0-9]+[!])([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const rangeReg = /([A-Za-z0-9]+)(!)?([$])?([A-Za-z]+)([$])?([0-9]+)(:)([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const sheetReg = /([A-Za-z0-9]+)(!)/g;

export default class DataSource {
  MAX_ROWS = 50;
  MAX_COLUMNS = 50;

  dependencies = {};

  constructor(appDataSheets, userDataSheets, listener) {
    this.userDataSheets = this.fillData(userDataSheets);
    this.appDataSheets = this.fillData(appDataSheets);

    this.buildDatasheet();

    this.generateInitialDependencies(this.data);

    this.initializeParser();

    this.updateAllDependencies();

    this.listener = listener;
    console.log(SUPPORTED_FORMULAS);
  }

  buildDatasheet = () => {
    this.data = Object.assign(this.userDataSheets, this.appDataSheets);
  };

  updateData(data) {
    this.userDataSheets = this.fillData(data);
    this.buildDatasheet();
    this.updateAllDependencies();
  }

  updateAppDataSheets(appDataSheets) {
    this.appDataSheets = this.fillData(appDataSheets);
    this.buildDatasheet();
    this.updateAllDependencies();
  }

  addSheet(sheetName) {
    this.userDataSheets[sheetName] = [];
    this.emitUpdates();
  }

  initializeParser() {
    this.parser = new FormulaParser();

    this.parser.setFunction('ALL_SALES', this.getAllSalesColumns);

    this.parser.on('callCellValue', this.onCallCellValue);
    this.parser.on('callRangeValue', this.onCallRangeValue);
  }

  onCallRangeValue = (startCellCoord, endCellCoord, done) => {
    var fragment = [];
    for (var row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
      var rowData = this.data[startCellCoord.sheet][row];
      var colFragment = [];

      for (var col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
        colFragment.push(rowData[col].value);
      }
      fragment.push(colFragment);
    }

    if (fragment) {
      done(fragment);
    }
  };

  getAllSalesColumns = params => {
    let sales = [];
    for (var i = 0; i < this.appDataSheets.length; i++) {
      sales.push(this.getCellValue('Properties', params[0] - 1, i + 2).value);
    }
    return sales;
  };

  onCallCellValue = (data, done) => {
    const { sheet, row, column, label } = data;
    const refCell = this.getCellValue(sheet, row.index, column.index);
    done(refCell.value);
  };

  getCellVariableRefs = cell => {
    if (!cell) return [];

    let { formula } = cell;
    formula = this.formulaFromString(formula || '');
    let allMatches = [];

    let rangeMatches = formula.match(rangeReg) || [];
    for (var i = 0; i < rangeMatches.length; i++) {
      let endPoints = rangeMatches[i].split(':');
      endPoints[0] = extractLabel(endPoints[0]);
      endPoints[1] = extractLabel(endPoints[1]);
      for (var i = endPoints[0][0].index; i < endPoints[1][0].index + 1; i++) {
        for (var b = endPoints[0][1].index; b < endPoints[1][1].index + 1; b++) {
          allMatches.push(this.toLabel(endPoints[0][2], i, b));
        }
      }
    }

    let matches = formula.match(varReg);
    allMatches = matches && allMatches ? allMatches.concat(matches) : matches || allMatches;

    if (!allMatches) return [];
    return uniq(allMatches.map(v => v.replace('$', '')));
  };

  addSubscriptionsToCell(subscribedCell, subscribedToCells = []) {
    this.dependencies = subscribedToCells.reduce((deps, cell) => {
      const cellSubscriptions = deps[cell] || [];

      const newCellSubscriptions = [...cellSubscriptions, subscribedCell];

      return {
        ...deps,
        [cell]: newCellSubscriptions
      };
    }, this.dependencies);
  }

  removeCellDependencies(cellLabel, removeCellDependencies = []) {
    if (removeCellDependencies.length === 0) return;

    this.dependencies = removeCellDependencies.reduce((deps, dep) => {
      const cellSubscriptions = deps[dep].filter(cell => cell !== cellLabel);

      if (cellSubscriptions.length === 0) {
        delete deps[dep];

        return deps;
      }

      return {
        ...deps,
        [dep]: cellSubscriptions
      };
    }, this.dependencies);
  }

  evaluateCell(value) {
    if (!value) return null;
    if (typeof value === 'string') {
      // look for strings that are valid numbers and turn them into numbers.
      if (value.match(/^-{0,1}\d+$/)) {
        value = parseInt(value);
      } else if (value.match(/^\d+\.\d+$/)) {
        value = parseFloat(value);
      }
    }
    return this.valueIsFormula(value)
      ? this.generateFormulaCell(value)
      : {
          forumla: null,
          value,
          error: null
        };
  }

  updateCell(sheetIndex, rowIndex, columnIndex, value, update) {
    update = update === undefined ? true : update;
    // debugger;
    const cell = this.evaluateCell(value);

    const prevCell = this.getCellValue(sheetIndex, rowIndex, columnIndex);

    this.setCellValue(sheetIndex, rowIndex, columnIndex, cell);
    this.updateSubscriptionsForCell(sheetIndex, rowIndex, columnIndex, cell, prevCell);

    if (update) {
      this.emitUpdates();
    }
  }

  updateSubscriptionsForCell(sheetIndex, rowIndex, columnIndex, cell, prevCell) {
    const varRefs = this.getCellVariableRefs(cell);
    const prevVarRefs = this.getCellVariableRefs(prevCell);

    const thisCellLabel = this.toLabel(sheetIndex, rowIndex, columnIndex);

    const depsToAdd = difference(varRefs, prevVarRefs);
    const depsToRemove = difference(prevVarRefs, varRefs);

    this.addSubscriptionsToCell(thisCellLabel, depsToAdd);
    this.removeCellDependencies(thisCellLabel, depsToRemove);

    const deps = this.generateDependencyGraphStartingAt(thisCellLabel);
    this.topologicallyUpdateDependencies(deps);
  }

  topologicallyUpdateDependencies(deps) {
    const top = toposort(deps);
    while (top.length) {
      this.evaluateAndUpdateDataForCell(top[0]);

      top.shift();
    }
  }

  evaluateAndUpdateDataForCell = cellLabel => {
    const [{ index: rowIndex }, { index: colIndex }, sheet] = extractLabel(cellLabel);

    const cell = this.getCellValue(sheet, rowIndex, colIndex);

    const newCell = this.evaluateCell(this.isCellBlank(cell) ? null : cell.formula || cell.value);

    this.setCellValue(sheet, rowIndex, colIndex, newCell);
  };

  generateDependencyGraphStartingAt(cellLabel, graph = []) {
    const deps = this.dependencies[cellLabel];

    if (!deps) return graph;

    const thisDeps = deps.map(dep => [cellLabel, dep]);

    const updatedGraph = [...graph, ...thisDeps];

    const nextGraph = deps.reduce((d, dep) => {
      return [...d, ...this.generateDependencyGraphStartingAt(dep)];
    }, updatedGraph);

    return nextGraph;
  }

  generateFormulaCell(value) {
    var matches = value.match(cellReg);
    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        value = value.replace(matches[i], matches[i].toUpperCase());
      }
    }

    let formula = this.formulaFromString(value);

    const parsed = this.parser.parse(formula);

    return {
      formula: value,
      value: parsed.result,
      error: parsed.error
    };
  }

  valueIsFormula = value => {
    return value[0] === '=';
  };

  formulaFromString = (value = '') => {
    if (!this.valueIsFormula(value)) return value;

    return value.substr(1);
  };

  setCellValue(sheetIndex, rowIndex, columnIndex, cell) {
    if (!this.data[sheetIndex] || rowIndex < 0 || columnIndex < 0) return;
    this.data[sheetIndex][rowIndex][columnIndex] = cell;
  }

  toLabel(sheet, row, column) {
    return sheet + '!' + columnIndexToLabel(column) + rowIndexToLabel(row);
  }

  columnIndexToLabel(column) {
    return columnIndexToLabel(column);
  }

  rowIndexToLabel(row) {
    return rowIndexToLabel(row);
  }

  getCellValue(sheet, row, column) {
    if (!this.data[sheet]) {
      return '';
    }
    if (this.data[sheet][row]) {
      return this.data[sheet][row][column];
    } else {
      return '';
    }
  }

  isCellBlank(cell) {
    if (!cell) return true;

    return !cell.value && !cell.formula;
  }

  longestRow = data => {
    const longestRow = data.reduce((max, row) => {
      let i = row.length - 1;

      for (i; i >= 0; i--) {
        if (!this.isCellBlank(row[i])) {
          break;
        }
      }

      return Math.max(i, max);
    }, 0);

    return longestRow;
  };

  lastNonEmptyRow = (data, maxRowLength) => {
    let i = data.length - 1;

    for (i; i >= 0; i--) {
      const upperJ = maxRowLength || data[i].length;
      let isRowBlank = false;

      for (let j = 0; j < upperJ; j++) {
        const cell = data[i][j];

        if (!this.isCellBlank(cell)) {
          isRowBlank = true;
          break;
        }
      }

      if (isRowBlank) break;
    }

    return i;
  };

  getData = () => {
    return this.data;
  };

  pruneData = () => {
    var prunedData = {};
    Object.keys(this.data).forEach(
      function(key) {
        const longestRow = this.longestRow(this.data[key]);
        const lastNonEmptyRow = this.lastNonEmptyRow(this.data[key], longestRow + 1);

        const pruned = this.data[key]
          .slice(0, lastNonEmptyRow + 1)
          .map(row => row.slice(0, longestRow + 1));

        prunedData[key] = pruned;
      }.bind(this)
    );

    Object.keys(this.appDataSheets).forEach(key => {
      delete prunedData[key];
    });

    return prunedData;
  };

  fillData = data => {
    var returnData = {};
    Object.keys(data).forEach(
      function(key) {
        const dataWithFilledRows = data[key].map(this.fillRow);

        const rowCount = dataWithFilledRows.length;
        const rowsToAdd = this.MAX_ROWS - rowCount;

        const emptyRow = this.generateEmptyRow();

        const newRows = [];

        for (let i = 0; i < rowsToAdd; i++) {
          newRows.push(emptyRow.slice());
        }

        const dataWithRows = dataWithFilledRows.concat(newRows);

        returnData[key] = dataWithRows;
      }.bind(this)
    );

    return returnData;
  };

  fillRow = row => {
    const columnCount = row.length;
    const columnsToAdd = this.MAX_COLUMNS - columnCount;

    if (columnsToAdd === 0) return row;

    const emptyColumns = Array(columnsToAdd).fill(null);

    return row.concat(emptyColumns);
  };

  generateEmptyRow() {
    return Array(this.MAX_COLUMNS).fill(null);
  }

  rowCount() {
    return this.MAX_ROWS;
  }

  columnCount() {
    return this.MAX_COLUMNS;
  }

  generateInitialDependencies(data) {
    Object.keys(data).forEach(sheet => {
      for (let rowIndex = 0; rowIndex < data[sheet].length; rowIndex++) {
        const row = data[sheet][rowIndex];

        for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
          const cell = row[columnIndex];

          const cellLabel = this.toLabel(sheet, rowIndex, columnIndex);
          const varRefs = this.getCellVariableRefs(cell);

          this.addSubscriptionsToCell(cellLabel, varRefs);
        }
      }
    });
  }

  findDependencyOrigin() {
    let origins = [];
    Object.keys(this.dependencies).forEach(dep => {
      Object.keys(this.dependencies).forEach(dep2 => {
        for (var i = 0; i < this.dependencies[dep2].length; i++) {
          if (this.dependencies[dep2][i] === dep) {
            dep = false;
          }
        }
      });
      if (dep) origins.push(dep);
    });
    return origins;
  }

  updateAllDependencies() {
    var origins = this.findDependencyOrigin();
    for (var i = 0; i < origins.length; i++) {
      const deps = this.generateDependencyGraphStartingAt(origins[i]);
      this.topologicallyUpdateDependencies(deps);
    }
  }

  addRow = (sheet, num) => {
    var row = [];
    for (var i = 0; i < this.MAX_ROWS; i++) {
      row[i] = '';
    }
    this.data[sheet].splice(num, 0, row);
  };

  addColumn = (sheet, num) => {
    for (var i = 0; i < this.MAX_COLUMNS; i++) {
      this.data[sheet][i].splice(num, 0, '');
    }
  };

  emitUpdates() {
    if (!this.listener) return;

    this.listener({ getData: this.pruneData });
  }
}
