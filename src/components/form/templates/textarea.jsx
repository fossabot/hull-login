'use strict';

import React from 'react';
import styles from '../styles';
import { StyleResolverMixin, BrowserStateMixin } from 'radium';

export default React.createClass({
  displayName: 'Textarea',

  mixins: [
    StyleResolverMixin,
    BrowserStateMixin
  ],

  handleChange(e) {
    this.props.onChange(e.target.value);
  },

  render() {
    const s = this.buildStyles(styles.formTextarea);

    return (
      <textarea style={s} {...this.getBrowserStateEvents()} {...this.props} onChange={this.handleChange} />
    );
  }
});
