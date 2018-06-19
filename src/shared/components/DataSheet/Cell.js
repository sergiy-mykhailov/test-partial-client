import React from 'react';
import * as styles from './styles.css';
import classnames from 'classnames';

const cellClassName = isSelected =>
  classnames(styles.Cell, {
    [styles.selected]: isSelected
  });

export default class Cell extends React.Component {
  state = {
    currentValue: ''
  };

  shouldComponentUpdate(nextProps, nextState) {
    const editingChanged = nextProps.isEditing !== this.props.isEditing;
    const selectedChanged = nextProps.isSelected !== this.props.isSelected;
    const currentValuedChanged = this.state.currentValue !== nextState.currentValue;

    const activeSheetChanged = nextProps.sheet !== this.props.sheet;

    const valueChanged =
      (nextProps.value ? nextProps.value.value : null) !==
      (this.props.value ? this.props.value.value : null);

    const should =
      editingChanged ||
      selectedChanged ||
      currentValuedChanged ||
      valueChanged ||
      activeSheetChanged;

    return should;
  }

  onInputFocus = i => {
    if (!i) return;

    i.focus();

    const value = this.inputValue();

    const len = String(value).length;

    this.setCurrentValue(value);

    i.setSelectionRange(len, len);
  };

  setCurrentValue = currentValue => {
    this.setState(() => ({ currentValue }));
  };

  inputValue() {
    if (!this.props.value) return '';

    const {
      value: { formula, error, value }
    } = this.props;

    return formula || error || value;
  }

  render() {
    const { value, isSelected, isEditing } = this.props;
    const { currentValue } = this.state;
    var label = this.props.isLabel ? styles.label : '';
    var selected = isSelected ? styles.selected : '';
    // console.log(isLabel, this.props.isLabel);
    return (
      <span className={cellClassName(isSelected) + ' ' + label}>
        <span className={selected}>{value ? value.error || value.value : ''}</span>
      </span>
    );
  }
}
