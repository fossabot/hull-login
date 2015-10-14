import React from 'react';
import cssModules from 'react-css-modules';
import styles from '../form.css';

const Select = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    options: React.PropTypes.object.isRequired,
  },

  handleChange(e) {
    this.props.onChange(e.target.value);
  },

  renderOptionsGroup() {
    // TODO
  },

  renderOption(o, i) {
    return (
      <option key={o.value + o.text + i} value={o.value}>{o.text}</option>
    );
  },

  render() {
    const options = this.props.options.map((o, i) => {
      return o.label ? this.renderOptionsGroup(o, i) : this.renderOption(o, i);
    });

    return (
      <select styleName="select" {...this.getBrowserStateEvents()} {...this.props} onChange={this.handleChange}>{options}</select>
    );
  },
});

export default cssModules(Select, styles);
