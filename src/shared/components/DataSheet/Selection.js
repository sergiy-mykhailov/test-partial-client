import React from 'react';
import * as utils from './utils';
import * as styles from './styles.css';

export default class selection extends React.Component<Props> {
  render() {
    let cord = utils.generateCellCoordinates(
      this.props.selection[1][1],
      this.props.selection[1][0]
    );
    let cord2 = utils.generateCellCoordinates(
      this.props.selection[2][1],
      this.props.selection[2][0]
    );
    return this.props.selection[0] === this.props.activeSheet ? (
      <div
        style={{
          boxSizing: 'border-box',
          border: (() => {
            return this.props.color ? '2px solid ' + this.props.color : '2px solid #5dc160';
          })(),
          position: 'absolute',
          pointerEvents: (() => {
            return this.props.mouseDownCell ? 'none' : 'auto';
          })(),
          top: cord[0] - (this.props.rowOffset - 1) * utils.CellDimensions.Height,
          left: cord[1] - this.props.columnOffset * utils.CellDimensions.Width + 50,
          height: cord2[0] - cord[0] + utils.CellDimensions.Height,
          width: cord2[1] - cord[1] + utils.CellDimensions.Width
        }}
        onContextMenu={this.props.handleContextMenu}
        onMouseUp={this.props.onMouseUp}
      />
    ) : (
      ''
    );
  }
}
