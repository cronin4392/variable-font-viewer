import React, { Component, Fragment } from 'react';

class VariableSlider extends Component {
  onChange(event) {
    const { onChange } = this.props;
    onChange(event.target.value);
  }

  render() {
    const {
      label,
      max,
      min,
      value,
      step = 1
    } = this.props;

    return (
      <Fragment>
        <td>{label}</td>
        <td>{min}</td>
        <td><input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={this.onChange.bind(this)}
        /></td>
        <td>{max}</td>
      </Fragment>
    );
  }
}

export default VariableSlider;
