import Selection from './Selection';

const cellReg = /(([A-Za-z0-9]+)(!))?([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const rangeReg = /([A-Za-z0-9]+)(!)?([$])?([A-Za-z]+)([$])?([0-9]+)(:)([$])?([A-Za-z]+)([$])?([0-9]+)/g;
const sheetReg = /([A-Za-z0-9]+)(!)/g;

const ARROW_KEY_CODES = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

const ARROW_KEY_CODES_LIST = Object.keys(ARROW_KEY_CODES).map(key => ARROW_KEY_CODES[key]);

const TAB_KEY_CODE = 9;

export function makeCell(value) {
  if (value) value = typeof value !== 'object' ? value : '#ERROR:(Invalid Cell Value):[Object]';
  return {
    formula: null,
    value,
    error: null
  };
}

export function updateFormulaBar() {
  let formulaBar = this.dataSource.getCellValue(
    this.state.selection[0],
    this.state.selection[1][1],
    this.state.selection[1][0]
  );
  formulaBar = formulaBar ? formulaBar.formula || formulaBar.value : '';
  this.setState({ formulaBar });
}

export function getFormulaBarSelections() {
  let selections;
  if (this.state.formulaBar) {
    let formula = this.state.formulaBar;
    if (typeof formula !== 'number' && this.dataSource.valueIsFormula(formula)) {
      let ranges = formula.match(rangeReg);

      if (ranges) {
        for (var i = 0; i < ranges.length; i++) {
          formula = formula.replace(ranges[i], '');
        }
      }
      let cells = formula.match(cellReg);

      if (cells) {
        selections = ranges ? cells.concat(ranges) : cells;
      } else if (ranges) {
        selections = ranges;
      }
    }
  }
  return selections || [];
}

export function getRangeCoordinates() {
  let selections = this.getFormulaBarSelections();
  for (var i = 0; i < selections.length; i++) {
    if (selections[i].indexOf(':') < 0) {
      const [{ index: rowIndex }, { index: colIndex }, sheet] = extractLabel(selections[i]);
      selections[i] = [sheet, [colIndex, rowIndex], [colIndex, rowIndex]];
    } else {
      let labels = selections[i].split(':');
      const [{ index: rowIndex }, { index: colIndex }, sheet] = extractLabel(labels[0]);
      const [{ index: rowIndex2 }, { index: colIndex2 }] = extractLabel(labels[1]);
      selections[i] = [sheet, [colIndex, rowIndex], [colIndex2, rowIndex2]];
    }
  }
  return selections;
}

export function getSelections() {
  console.log(this);
  let selections = this.getRangeCoordinates();
  let elements = [];
  for (var i = 0; i < selections.length; i++) {
    elements.push(
      <Selection
        key={i}
        selection={selections[i]}
        activeSheet={this.state.activeSheet}
        mouseDownCell={this.state.mouseDownCell}
        rowOffset={this.state.rowOffset}
        columnOffset={this.state.columnOffset}
        handleContextMenu={this.handleContextMenu}
        onMouseUp={e => {
          this.setState({ mouseDownCell: null });
        }}
        color="#9fdcdc"
      />
    );
  }
  return elements;
}

export function addSheetModal() {
  this.setState({ showAddSheetModal: !this.state.showAddSheetModal });
}

export function pasteSelection() {
  var copied = this.state.copied.selection;
  let start = [this.state.selection[1][1], this.state.selection[1][0]];
  var cells = [];
  for (var b = 0; b < copied[2][0] - copied[1][0] + 1; b++) {
    cells[b] = [];
    for (var i = 0; i < copied[2][1] - copied[1][1] + 1; i++) {
      this.dataSource.updateCell(
        this.state.activeSheet,
        start[0] + i,
        start[1] + b,
        '=' + this.dataSource.toLabel(copied[0], copied[1][1] + i, copied[1][0] + b),
        i === copied[2][1] - copied[1][1] && b === copied[2][0] - copied[1][0]
      );
    }
  }
  this.forceUpdate();
}

export function copySelection() {
  this.setState({
    copied: { selection: this.state.selection }
  });
}

export function clearSelection() {
  let start = [this.state.selection[1][1], this.state.selection[1][0]];
  var cells = [];
  for (var b = 0; b < this.state.selection[2][0] - this.state.selection[1][0] + 1; b++) {
    cells[b] = [];
    for (var i = 0; i < this.state.selection[2][1] - this.state.selection[1][1] + 1; i++) {
      this.dataSource.updateCell(
        this.state.activeSheet,
        start[0] + i,
        start[1] + b,
        null,
        b === this.state.selection[2][0] - this.state.selection[1][0] &&
          i === this.state.selection[2][1] - this.state.selection[1][1]
      );
    }
  }
}
//barf

export function bindArrowKeys() {
  document.addEventListener('keydown', this.onKeyDown);
}

export function unbindArrowKeys() {
  document.removeEventListener('keydown', this.onKeyDown);
}

export function bindResize() {
  window.addEventListener('resize', this.onResize);
}

export function unbindResize() {
  window.removeEventListener('resize', this.onResize);
}

export function onResize() {
  const width = this.d.offsetWidth;
  const height = this.d.offsetHeight;
  this.setState(
    () => ({
      width,
      height
    }),
    () => {
      this.maxScrollX = this.maxHorizontalScroll(this.state.width, this.dataSource.columnCount());
      this.maxScrollY = this.maxVerticalScroll(this.state.height, this.dataSource.columnCount());
    }
  );
}

export function onKeyDown(e) {
  const { isSelectedCellEditing, isSelectedSheetLocked } = this.state;

  if (
    (ARROW_KEY_CODES_LIST.indexOf(e.keyCode) > -1 && !isSelectedCellEditing) ||
    e.keyCode === TAB_KEY_CODE
  ) {
    this.handleArrowNav(e);
    return;
  }

  // ENTER
  if (e.keyCode === 13) {
    !isSelectedSheetLocked
      ? this.setIsSelectedCellEditing(!isSelectedCellEditing)
      : this.handleArrowNav(e);
    return;
  }

  // COPY
  if (e.keyCode === 67 && e.metaKey === true) {
    this.copySelection();
    return;
  }

  // PASTE
  if (e.keyCode === 86 && e.metaKey === true) {
    this.pasteSelection();
    return;
  }

  // Delete
  if (e.keyCode === 8) {
    this.clearSelection();
    return;
  }

  if (e.key.length === 1) {
    !isSelectedCellEditing &&
      !isSelectedSheetLocked &&
      this.setIsSelectedCellEditing(!isSelectedCellEditing);
  }
}

export function setIsSelectedCellEditing(isSelectedCellEditing) {
  this.setState(
    () => ({ isSelectedCellEditing }),
    () => {
      if (this.state.isSelectedCellEditing) {
        this.formulaBarRef.focus();
      } else {
        this.formulaBarRef.blur();
      }
    }
  );
}

export function handleArrowNav(e) {
  const { keyCode } = e;
  const { selection } = this.state;

  var x = selection[1][0];
  var y = selection[1][1];

  switch (keyCode) {
    case ARROW_KEY_CODES.LEFT:
      x = x - 1;
      break;

    case ARROW_KEY_CODES.UP:
      y = y - 1;
      break;

    case TAB_KEY_CODE:
      x = x + 1;
      e.preventDefault();
      break;

    case ARROW_KEY_CODES.RIGHT:
      x = x + 1;
      break;

    case 13:
    case ARROW_KEY_CODES.DOWN:
      y = y + 1;
      break;

    default:
      return;
  }

  const newSelectedCoords = [x, y].map(c => Math.max(0, c));

  this.selectCell([selection[0], newSelectedCoords, newSelectedCoords]);
}

export function generateNewScrollState(delta) {
  const adjustX = Math.abs(delta.x) >= Math.abs(delta.y);
  const scrollToAdjust = adjustX ? 'x' : 'y';
  const currentAdjust = this.scroll[scrollToAdjust];
  const adjustDelta = delta[scrollToAdjust]; // / 1.5

  const maxAdjust = adjustX ? this.maxScrollX : this.maxScrollY;

  const newAdjustAmountUnrestricted = currentAdjust + adjustDelta;

  const newMinAdjust = Math.max(0, newAdjustAmountUnrestricted);

  this.scroll[scrollToAdjust] = Math.min(maxAdjust, newMinAdjust);
}

export function onScroll(x, y) {
  this.generateNewScrollState({ x, y });

  this.cancelIsScrolling();

  if (!this.state.isScrolling) {
    this.setState(() => ({ isScrolling: true }));
  }

  this.updateScrollState();
}

export function cancelIsScrolling() {
  if (this.cancelScrollTimeout) {
    clearTimeout(this.cancelScrollTimeout);
    this.cancelScrollTimeout = null;
  }

  this.cancelScrollTimeout = setTimeout(() => this.setState({ isScrolling: false }), 60);
}

export function updateScrollState() {
  const { x, y } = this.scroll;
  const { rowOffset, columnOffset } = this.state;

  const nextVerticalOffset = this.rowOffset(y);
  const nextHorizontalOffset = this.columnOffset(x);

  if (nextHorizontalOffset === columnOffset && nextVerticalOffset === rowOffset) return;

  this.setState(() => ({
    rowOffset: nextVerticalOffset,
    columnOffset: nextHorizontalOffset
  }));

  if (this.state.isScrolling) {
    this.scrollAnim = requestAnimationFrame(this.updateScrollState);
  }
}

export function setSelection(rowIndex, columnIndex) {
  if (this.state.mouseDownCell) {
    var max = [
      Math.max(this.state.mouseDownCell[1], columnIndex),
      Math.max(this.state.mouseDownCell[0], rowIndex)
    ];
    var min = [
      Math.min(this.state.mouseDownCell[1], columnIndex),
      Math.min(this.state.mouseDownCell[0], rowIndex)
    ];
    this.selectCell([this.state.activeSheet, min, max]);
  }
}

export function closeContextMenu() {
  this.setState({ showContextMenu: false });
}

export function handleContextMenu(e) {
  e.preventDefault();
  var dataSheetRect = this.d.getBoundingClientRect();
  this.setState({
    showContextMenu: true,
    contextMenuX: e.clientX - dataSheetRect.left,
    contextMenuY: e.clientY - dataSheetRect.top
  });
}

export function selectCell(selection) {
  this.setState(
    () => ({
      selection,
      isSelectedCellEditing: false
    }),
    () => {
      this.updateFormulaBar();
    }
  );
}

export function isCellSelected(col, row) {
  const { selection } = this.state;
  if (!selection) return false;

  return selection[1] === col && selection[2] === row;
}

export function insertIntoFormulaBarAtCursor(text) {
  let newString = '';
  //IE support
  if (document.selection) {
    this.formulaBarRef.focus();
    sel = document.selection.createRange();
    sel.text = text;
  } else if (this.formulaBarRef.selectionStart || this.formulaBarRef.selectionStart == '0') {
    //MOZILLA and others
    var startPos = this.formulaBarRef.selectionStart;
    var endPos = this.formulaBarRef.selectionEnd;
    newString =
      this.formulaBarRef.value.substring(0, startPos) +
      text +
      this.formulaBarRef.value.substring(endPos, this.formulaBarRef.value.length);
  } else {
    newString = this.formulaBarRef.value + myValue;
  }
  this.setState(
    {
      formulaBar: newString
    },
    () => {
      this.dataSource.updateCell(
        this.state.selection[0],
        this.state.selection[1][1],
        this.state.selection[1][0],
        newString,
        true
      );
      this.forceUpdate();
      this.formulaBarRef.selectionStart = startPos + text.length;
      this.formulaBarRef.selectionEnd = startPos + text.length;
    }
  );
}

export function changeActiveSheet(activeSheet) {
  this.setState({ activeSheet }, () => {
    if (Object.keys(this.props.appSheets).indexOf(this.state.activeSheet) > -1) {
      this.setState({ isSelectedSheetLocked: true });
    } else {
      this.setState({ isSelectedSheetLocked: false });
    }
  });
}

//barf
export const CellDimensions = {
  Height: 30,
  Width: 140
};

export const CellDimensionPixelValues = {
  Height: CellDimensions.Height + 'px',
  Width: CellDimensions.Width + 'px'
};

export function rowOffset(verticalOffset) {
  return Math.round(verticalOffset / CellDimensions.Height);
}

export function columnOffset(horizontalOffset) {
  return Math.round(horizontalOffset / CellDimensions.Width);
}
export function cellsInView(tableDimension, cellDimension) {
  return Math.ceil(tableDimension / cellDimension);
}
export function rowsInView(tableHeight) {
  return this.cellsInView(tableHeight, CellDimensions.Height);
}
export function columnsInView(tableWidth) {
  return this.cellsInView(tableWidth, CellDimensions.Width);
}

export function rowRangeToRender(offset, tableHeight) {
  return offset + this.rowsInView(tableHeight);
}
export function columnRangeToRender(offset, tableWidth) {
  return offset + this.columnsInView(tableWidth);
}
export function maxHorizontalScroll(tableWidth, totalColumnCount) {
  const viewColumnCount = this.columnsInView(tableWidth) - 1;
  const maxOffset = totalColumnCount - viewColumnCount;
  const maxScroll = CellDimensions.Width * maxOffset;

  return maxScroll;
}

export function maxVerticalScroll(tableHeight, totalRowCount) {
  const viewRowCount = this.rowsInView(tableHeight) - 1;
  const maxOffset = totalRowCount - viewRowCount;
  const maxScroll = CellDimensions.Height * maxOffset;

  return maxScroll;
}

export function generateCellCoordinates(rowIndex, columnIndex) {
  return [rowIndex * CellDimensions.Height, columnIndex * CellDimensions.Width];
}

export function generateCellStyles(cellCoordinates) {
  // width: CellDimensionPixelValues.Width,
  // height: CellDimensionPixelValues.Height,
  return {
    top: cellCoordinates[0],
    left: cellCoordinates[1]
  };
  // position: 'absolute',
}

// to here

export function isSelected(selection, sheet, row, col) {
  if (!selection) return false;

  return selection[0] === sheet && selection[1][0] === col && selection[1][1] === row;
}

export function topRowRange({
  horizontalOffset,
  tableWidth,
  labelRenderer,
  styleCache,
  columnCount,
  renderedCells,
  selectedCell
}) {
  const columnStopIndex = Math.min(
    this.columnRangeToRender(horizontalOffset, tableWidth) + 1,
    columnCount - 1
  );

  console.log(
    this.columnRangeToRender(horizontalOffset, tableWidth) + 1,
    horizontalOffset,
    columnCount,
    tableWidth
  );

  for (let columnIndex = horizontalOffset + 1; columnIndex <= columnStopIndex; columnIndex++) {
    const key = `0:${columnIndex}`;

    const xCord = columnIndex - horizontalOffset;
    const cordKey = `0:${xCord}`;

    if (!styleCache[cordKey]) {
      styleCache[cordKey] = generateCellStyles(generateCellCoordinates(0, xCord));
      styleCache[cordKey].left -= 90;
    }

    const style = styleCache[cordKey];

    const cellParams = {
      style,
      rowIndex: 0,
      columnIndex,
      key,
      isSelected: isSelected(selectedCell, 0, columnIndex)
    };

    renderedCells.push(labelRenderer(cellParams));
  }
}

export function leftColumnRange({
  verticalOffset,
  tableHeight,
  labelRenderer,
  styleCache,
  rowCount,
  renderedCells,
  selectedCell
}) {
  const verticalStopIndex = Math.min(
    this.rowRangeToRender(verticalOffset, tableHeight) + 1,
    rowCount - 1
  );

  for (let rowIndex = verticalOffset + 1; rowIndex <= verticalStopIndex; rowIndex++) {
    const key = `${rowIndex}:0`;

    const yCord = rowIndex - verticalOffset;
    const cordKey = `${yCord}:0`;

    if (!styleCache[cordKey]) {
      styleCache[cordKey] = this.generateCellStyles(this.generateCellCoordinates(yCord, 0));
      styleCache[cordKey].width = 50;
    }

    // const style = generateCellStyles(generateCellCoordinates(0, xCord));
    const style = styleCache[cordKey];

    renderedCells.push(
      this.labelRenderer({
        style,
        rowIndex,
        columnIndex: 0,
        key,
        isSelected: this.isSelected(selectedCell, rowIndex, 0)
      })
    );
  }
}

export function cellRange({
  verticalOffset,
  horizontalOffset,
  tableHeight,
  tableWidth,
  cellRenderer,
  labelRenderer,
  styleCache,
  rowCount,
  columnCount,
  selection,
  isSelectedCellEditing,
  activeSheet
}) {
  const renderedCells = [];
  let selectedCellHasRendered = false;

  this.topRowRange({
    horizontalOffset,
    tableWidth,
    labelRenderer,
    styleCache,
    columnCount,
    renderedCells,
    selection
  });

  this.leftColumnRange({
    verticalOffset,
    tableHeight,
    labelRenderer,
    styleCache,
    rowCount,
    renderedCells,
    selection
  });

  const contentVerticalOffset = verticalOffset;
  const contentHorizontalOffset = horizontalOffset;

  const verticalStopIndex = Math.min(
    this.rowRangeToRender(contentVerticalOffset, tableHeight),
    rowCount - 1
  );

  const columnStopIndex = Math.min(
    this.columnRangeToRender(contentHorizontalOffset, tableWidth),
    columnCount - 1
  );

  for (let rowIndex = contentVerticalOffset; rowIndex <= verticalStopIndex; rowIndex++) {
    const yCord = rowIndex - contentVerticalOffset + 1;

    for (let columnIndex = contentHorizontalOffset; columnIndex <= columnStopIndex; columnIndex++) {
      const key = `${rowIndex}:${columnIndex}`;

      const xCord = columnIndex - contentHorizontalOffset + 1;
      const cordKey = `${yCord}:${xCord}`;

      if (!styleCache[cordKey]) {
        styleCache[cordKey] = generateCellStyles(generateCellCoordinates(yCord, xCord));
        styleCache[cordKey].left -= 90;
      }

      let isCellSelected = false;

      if (!selectedCellHasRendered) {
        isCellSelected = selectedCellHasRendered = isSelected(
          selection,
          activeSheet,
          rowIndex,
          columnIndex
        );
      }
      const style = styleCache[cordKey];

      const cellParams = {
        style,
        activeSheet,
        rowIndex,
        columnIndex,
        key,
        isSelected: isCellSelected,
        isSelectedCellEditing: isCellSelected && isSelectedCellEditing
      };

      renderedCells.push(cellRenderer(cellParams));
    }
  }

  return renderedCells;
}
