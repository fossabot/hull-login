import assign from 'object-assign';
import { EventEmitter } from 'events';
import IntlMessageFormat from 'intl-messageformat';

const USER_SECTIONS = [
  'showProfile',
  'editProfile',
  'thanks'
];

const VISITOR_SECTIONS = [
  'logIn',
  'signUp',
  'resetPassword'
];

const SECTIONS = USER_SECTIONS.concat(VISITOR_SECTIONS);

const ACTIONS = [
  'showDialog',
  'hideDialog',

  'signUp',
  'logIn',
  'logOut',
  'linkIdentity',
  'unlinkIdentity',

  'resetPassword',
  'updateProfile',

  'activateLogInSection',
  'activateSignUpSection',
  'activateResetPasswordSection',
  'activateShowProfileSection',
  'activateEditProfileSection'
];

const STATUS = {
  login: 'isLogingIn',
  logout: 'isLogingOut',
  logIn: 'isLogingIn',
  logOut: 'isLogingOut',
  linkIdentity: 'isLinking',
  unlinkIdentity: 'isUnlinking'
};

const EVENT = 'CHANGE';

function Engine(deployment) {
  this._ship = deployment.ship;
  this._platform = deployment.platform;
  this._settings = deployment.settings;
  this._organization = deployment.organization;
  this._form = this._ship.resources.profile_form;

  this.resetState();
  this.resetUser();

  Hull.on('hull.user.**', (user) => {
    let nextUser = user || {};
    let previousUser = this._user || {};

    if (nextUser.id !== previousUser.id) { this.reset(); }
  });

  this.emitChange();
}

assign(Engine.prototype, EventEmitter.prototype, {
  getActions() {
    if (this._actions) { return this._actions; }

    this._actions = ACTIONS.reduce((m, a) => {
      m[a] = this[a].bind(this);
      return m;
    }, {});

    return this._actions;
  },

  getState() {
    return {
      user: this._user,
      settings: this._settings,
      shipSettings: this._ship.settings,
      organization: this._organization,
      platform: this._platform,
      ship: this._ship,
      form: this._form,
      formIsSubmitted: this.formIsSubmitted(),
      identities: this._identities,
      providers: this.getProviders(),
      error: this._error,
      isWorking: this._isLogingIn || this._isLogingOut || this._isLinking || this._isUnlinking,
      isLogingIn: this._isLogingIn,
      isLogingOut: this._isLogingOut,
      isLinking: this._isLinking,
      isUnlinking: this._isUnlinking,
      dialogIsVisible: this._dialogIsVisible,
      activeSection: this.getActiveSection()
    };
  },

  addChangeListener(listener) {
    this.addListener(EVENT, listener)
  },

  removeChangeListener(listener) {
    this.removeListener(EVENT, listener);
  },

  emitChange() {
    this.emit(EVENT);
  },

  resetState() {
    this.resetUser();

    this._error = null;
    this._isLogingIn = false;
    this._isLogingOut = false;
    this._isLinking = false;
    this._isUnlinking = false;
    this._dialogIsVisible = false;
    this._activeSection = 'logIn';
  },

  resetUser() {
    this._user = Hull.currentUser();

    let identities = {}
    if (this._user != null) {
      this._user.identities.forEach(function(identity) {
        identities[identity.provider] = true;
      });
    }

    this._identities = identities;
  },

  reset() {
    this.resetUser();
    this.emitChange();

    this.fetchShip()
  },

  fetchShip() {
    return Hull.api(this._ship.id).then((ship) => {
      this._ship = ship;
      this._form = this._ship.resources.profile_form;

      this.resetUser();
      this.emitChange();
    });
  },

  getProviders() {
    let providers = [];

    const services = Hull.config().services.auth;

    for (let k in services) {
      if (services.hasOwnProperty(k) && k !== 'hull') {
        let provider = { name: k };
        provider.isLinked = !!this._identities[k];
        provider.isUnlinkable = provider.isLinked && this._user.main_identity !== k;

        providers.push(provider);
      }
    }

    return providers;
  },

  getActiveSection() {
    let sections;
    let defaultSection;

    if (this._user) {
      if (!this.formIsSubmitted()) { return 'editProfile'; }

      sections = USER_SECTIONS;
      defaultSection = 'showProfile';
    } else {
      sections = VISITOR_SECTIONS;
      defaultSection = sections[0];
    }

    return sections.indexOf(this._activeSection) > -1 ? this._activeSection : defaultSection;
  },

  showDialog() {
    this._dialogIsVisible = true;
    this.emitChange();
  },

  hideDialog() {
    this._dialogIsVisible = false;
    this.emitChange();
  },

  signUp(credentials) {
    return this.performAndRedirect('signup', credentials);
  },

  logIn(providerOrCredentials) {
    return this.performAndRedirect('login', providerOrCredentials);
  },

  logOut() {
    return Hull.logout().then(() => { this.reset(); });
  },

  linkIdentity(provider) {
    return this.perform('linkIdentity', provider);
  },

  unlinkIdentity(provider) {
    return this.perform('unlinkIdentity', provider);
  },

  performAndRedirect(action, provider) {
    let p = this.perform(action, provider);

    let location = this._settings.redirect_url;
    if (this.isShopify()) {
      location = location || '/account';
    }
    if (location) {
      p.done(() => { document.location = location; });
    }

    return p.then((user) => { return this.fetchShip(); });
  },

  perform(method, provider) {
    const s = STATUS[method];

    let options;
    if (typeof provider === 'string') {
      options = { provider: provider };
    } else {
      options = provider;
      provider = 'classic';
    }

    this['_' + s] = provider;
    this._error = null;

    this.emitChange();

    if (this.isShopify()) {
      let proxy = document.location.origin + '/a/hull-callback';
      proxy += this._settings.redirect_url ? '?redirect_url=' + this._settings.redirect_url : '';

      options.redirect_url = proxy;
    }

    let promise = Hull[method](options);

    promise.then(() => {
      this.resetUser();

      this['_' + s] = false;
      this._error = null;

      this.emitChange();
    }, (error) => {
      this['_' + s] = false;

      error.provider = provider;
      this._error = error;

      this.emitChange();
    });

    return promise;
  },

  resetPassword: function(email) {
    return Hull.api('/users/request_password_reset', 'post', { email });
  },

  updateProfile: function(profile) {
    let r = Hull.api(this._form.id + '/submit' ,'put', { data: profile });
    const showThanksSection = !this.formIsSubmitted();

    r.then((form) => {
      this._form = form;

      // TODO show thanks section after complete registration flow
      //this._activeSection = showThanksSection ? 'thanks' : 'showProfile';
      if (showThanksSection) {
        this._dialogIsVisible = false;
        this._activeSection = null;
      } else {
        this._activeSection = 'showProfile';
      }

      this.emitChange();
    });

    return r;
  },

  activateLogInSection: function() {
    this.activateSection('logIn');
  },

  activateSignUpSection: function() {
    this.activateSection('signUp');
  },

  activateResetPasswordSection: function() {
    this.activateSection('resetPassword');
  },

  activateShowProfileSection: function() {
    this.activateSection('showProfile');
  },

  activateEditProfileSection: function() {
    this.activateSection('editProfile');
  },

  activateSection: function(name) {
    if (SECTIONS.indexOf(name) > -1) {
      this._dialogIsVisible = true;
      this._activeSection = name;
      this.emitChange();
    } else {
      throw new Error('"' + name + '" is not a valid section name');
    }
  },

  formIsSubmitted() {
    return this._form.user_data && !!this._form.user_data.created_at;
  },

  isShopify: function() {
    return this._platform.type === 'platforms/shopify';
  }
});

module.exports = Engine;

