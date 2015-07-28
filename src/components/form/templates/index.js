'use strict';

import React from 'react';
import Input from './input';
import Textarea from './textarea';
import Select from './select';
import Help from '../../help';

function render(Component, locals) {
  if (locals.config.kind === 'compact') {
    return <label style={s}>
      <Component {...locals} />
      <Help>{locals.help}</Help>
    </label>;
  }

  const s = { width: '100%' };
  return (
    <label style={s}>
      {locals.label}
      <Component {...locals} />
      <Help>{locals.help}</Help>
    </label>
  );
}

export default {
  checkbox() {
    // TODO
  },

  list() {
    // TODO
  },

  radio() {
    // TODO
  },

  select(locals) {
    return render(Select, locals);
  },

  struct(locals) {
    const l = locals.order.length;
    let inputs = locals.order.map(function(n, i) {
      const isLast = i === l - 1;
      const s = isLast ? null : { marginBottom: 10 };

      return <div key={locals.inputs[n].key} style={s}>{locals.inputs[n]}</div>;
    });

    return <div>{inputs}</div>;
  },

  textbox(locals) {
    let C = locals.type === 'textarea' ? Textarea : Input;

    return render(C, locals);
  }
};

