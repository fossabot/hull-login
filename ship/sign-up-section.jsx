import React from 'react';
import t from 'tcomb-form';
import { translate } from './i18n';
import { Email } from './types';
import SocialButtons from './social-buttons.jsx';
import Form from './form.jsx';

export default React.createClass({
  getType: function() {
    var type = t.struct({
      name: t.Str,
      email: Email,
      password: t.Str
    });

    return type;
  },

  getOptions: function() {
    var options = {
      auto: 'placeholders',
      fieldset: false,
      fields: {
        name: {
          placeholder: translate('Your name'),
        },
        email: {
          placeholder: translate('Your email'),
        },
        password: {
          placeholder: translate('Your password'),
          type: 'password'
        }
      }
    };

    return options;
  },

  handleSubmit: function(value) {
    this.props.signUp(value && value);
  },

  render: function() {
    return (
      <div>
        <h1>{translate('Join {organization}', { organization: this.props.organization.name })}</h1>
        <p><a href="#" onClick={this.props.activateLogInSection}>{translate('Already have an account? Log in.')}</a></p>

        <Form type={this.getType()} options={this.getOptions()} submitMessage={translate('Sign up')} onSubmit={this.handleSubmit} />
        <SocialButtons {...this.props} />

        <p>{translate("By signing up, you agree to {organization}'s Terms of Service.", { organization: this.props.organization.name })}</p>
      </div>
    );
  }
});

