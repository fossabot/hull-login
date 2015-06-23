'use strict';

import _ from 'underscore';
import React from 'react';
import assign from 'object-assign';

import { translate } from '../../lib/i18n';
import { getStyles } from './styles';
import { toType } from 'tcomb-json-schema';
import AsyncActionsMixin from '../../mixins/async-actions';

import Form from '../form';
import UserImage from './user-image';

/* eslint-disable quotes */
const DEFAULT_SCHEMA = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name",
      "scope": "app",
      "format": "string"
    },
    "password": {
      "type": "string",
      "title": "Password",
      "scope": "app",
      "format": "password",
      "help": "Leave blank to keep your old password"
    },
    "email": {
      "type": "string",
      "title": "Email",
      "scope": "app",
      "format": "email"
    }
  },
  "required": [
    "name"
  ]
};
/* eslint-enable quotes */


export default React.createClass({
  displayName: 'LogInSection',

  mixins: [
    AsyncActionsMixin
  ],

  getAsyncActions() {
    return {
      updateProfile: this.props.updateProfile
    };
  },

  getType() {
    let type;
    if (this.props.formIsExistent) {
      if (this.props.formIsSubmitted) {
        let props = assign({}, DEFAULT_SCHEMA.properties, this.props.form.fields_schema.properties);
        type = toType(assign({}, DEFAULT_SCHEMA, this.props.form.fields_schema, { properties: props }));
      } else {
        type = toType(this.props.form.fields_schema);
      }
    } else {
      type = toType(DEFAULT_SCHEMA);
    }

    return type;
  },

  getFields() {
    let props;
    if (this.props.formIsExistent) {
      if (this.props.formIsSubmitted) {
        props = assign({}, DEFAULT_SCHEMA.properties, this.props.form.fields_schema.properties);
      } else {
        props = this.props.form.fields_schema.properties;
      }
    } else {
      props = DEFAULT_SCHEMA.properties;
    }

    return _.reduce(props, function(m, v, k) {
      let f = { label: v.title, help: v.help };

      if (v.type === 'string') {
        f.type = v.format === 'uri' ? 'url' : (v.format || 'text');
      }

      m[k] = f;

      return m;
    }, {});
  },

  handleLogOut(e) {
    e.preventDefault();

    this.props.logOut();
    this.props.hideDialog();
  },

  handleSubmit(value) {
    let userValue = { name: value.name, password: value.password, email: value.email };
    let extraValue = _.without(value, 'name', 'password', 'email');
    console.log(userValue);
    debugger;
    this.getAsyncAction('updateProfile')(extraValue);
  },

  render() {
    let title = '';
    let subtitle = '';
    let button = '';
    let disabled = false;

    if (this.props.formIsSubmitted || !this.props.formIsExistent) {
      title = translate('Edit your profile');
      subtitle = <a href='javascript: void 0;' onClick={this.props.activateShowProfileSection}>{translate('Cancel')}</a>
      button = translate('Edit profile');
    } else {
      title = translate('Complete your profile');
      subtitle = <a href='javascript: void 0;' onClick={this.props.hideDialog}>{translate('Skip this step')}</a>
      button = translate('Complete profile');
    }

    if (this.state.updateProfileState === 'pending') {
      button = translate('Saving...');
      disabled = true;
    }

    const u = this.props.user;
    const value = assign({}, u, this.props.form.user_data && this.props.form.user_data.data);
    const styles = getStyles();
    const form = <Form type={this.getType()} fields={this.getFields()} value={value} submitMessage={button} onSubmit={this.handleSubmit} disabled={disabled} />;

    return (
      <div>
        <div style={styles.sectionHeader}>
          <UserImage style={styles.sectionUserImage} src={u.picture} />
          <h1 style={styles.sectionTitle}>{title}</h1>
          <p style={styles.sectionText}>{subtitle}</p>
        </div>

        {form}
      </div>
    );
  }
});

