import React from 'react';
import { translate } from '../../lib/i18n';
import Button from '../button';
import Icon from '../icon';
import Help from '../help';
import TranslatedMessage from '../translated-message';
import { hasTranslation } from '../../lib/i18n';

import cssModules from 'react-css-modules';
import styles from './social-buttons.css';


export default function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

const SocialButtons = React.createClass({

  propTypes: {
    errors: React.PropTypes.object,
    styles: React.PropTypes.object,
    user: React.PropTypes.object,
    providers: React.PropTypes.array,
    activeSection: React.PropTypes.string,
    isWorking: React.PropTypes.bool,
  },

  getErrorMessage() {
    const error = this.props.errors.signUp || this.props.errors.logIn;
    if (error && error.provider && error.provider !== 'classic') {
      const { reason, message } = error;
      let errorMessage;
      if (reason) {
        const msg = 'social-login error ' + reason;
        if (hasTranslation(msg)) {
          errorMessage = <TranslatedMessage message={msg} variables={error} />;
        } else {
          errorMessage = message || reason;
        }
      } else {
        errorMessage = message;
      }
      return errorMessage;
    }
  },

  renderButton(provider, index) {
    let actionName;
    let status;
    let button;
    let help;
    if (!this.props.user) {
      actionName = 'logIn';
      status = 'isLoggingIn';
      if (this.props.activeSection === 'signUp') {
        button = ['sign-up social button text', 'sign-up social button text when attempting sign-up'];
        help = 'sign-up help text';
      } else {
        button = ['log-in social button text', 'log-in social button text when attempting login'];
        help = 'log-in help text';
      }
    } else if (provider.isLinked && provider.isUnlinkable) {
      actionName = 'unlinkIdentity';
      status = 'isUnlinking';
      help = 'unlinking help text';
      button = ['Unlink your {provider} account', 'Unlinking {provider} account'];
    } else if (!provider.isLinked) {
      actionName = 'linkIdentity';
      status = 'isLinking';
      help = 'linking help text';
      button = ['Link your {provider} account', 'Linking {provider} account'];
    } else {
      return null;
    }

    const m = this.props[status] === provider.name ? button[1] : button[0];
    const providerName = capitalize(provider.name);
    const wording = translate(m, { provider: providerName });
    const helpText = <TranslatedMessage message={help + ' for ' + providerName} />;
    const handler = this.props[actionName].bind(null, provider.name);
    const isLast = this.props.providers.length === index + 1;
    const s = isLast ? {} : { marginBottom: 10 };

    return (
      <span key={provider.name}>
        <Button kind={provider.name} block disabled={this.props.isWorking} onClick={handler}>
          <Icon name={provider.name} colorize/>
          {wording}
        </Button>
        <Help style={s}>{helpText}</Help>
      </span>
    );
  },

  renderErrors() {
    const errorMessage = this.getErrorMessage();
    if (errorMessage) {
      return <div className={this.props.styles.errors}>{errorMessage}</div>;
    }
  },

  render() {
    const { providers } = this.props;
    const buttons = providers && providers.map(this.renderButton, this);
    return (
      <div>
        {this.renderErrors()}
        {buttons}
      </div>
    );
  },
});


export default cssModules(SocialButtons, styles);
