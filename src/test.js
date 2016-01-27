import React from 'react';
import ReactDOM from 'react-dom';
import { start } from './lib';
import Main from './main';

function onReady(hull, user, platform, organization) {
  const deployment = platform.deployments[0];
  deployment.organization = organization;

  const element = document.querySelector('#ship');

  const engine = start(deployment);
  ReactDOM.render(<Main engine={engine} actions={engine.getActions()} />, element);
}

Hull.ready(onReady);