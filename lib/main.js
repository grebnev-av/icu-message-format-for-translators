'use strict';

const h = require('react').createElement;
const render = require('react-dom').render;
const Form = require('./form');
const createStore = require('redux').createStore;
const query = location.search
  .slice(1).split('&')
  .reduce(function (query, param) {
    const parts = param.split('=');
    query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]) || true;
    return query
  }, {});

const store = createStore(function (state = {}, action) {
  switch (action.type) {
    case 'INIT':
      const pattern = state.pattern ? state.pattern : query.m || '';
      return {
        pattern: pattern,
        params: query,
        locale: query.l || 'en',
        isRich: true
      };
    case 'CHANGE_PATTERN':
      return {
        pattern: action.pattern,
        params: state.params,
        locale: state.locale,
        isRich: state.isRich
      };
    case 'CHANGE_PARAM':
      const params = Object.keys(state.params)
        .reduce(function (params, key) {
          params[key] = state.params[key];
          return params
        }, {});
      params[action.name] = action.value;
      return {
        pattern: state.pattern,
        params: params,
        locale: state.locale,
        isRich: state.isRich
      };
    case 'CHANGE_LOCALE':
      return {
        pattern: state.pattern,
        params: state.params,
        locale: action.locale,
        isRich: state.isRich
      };
    case 'CHANGE_IS_RICH':
      return {
        pattern: state.pattern,
        params: state.params,
        locale: state.locale,
        isRich: action.isRich
      };
    default:
      return state
  }
});

function changePattern (evt) {
  store.dispatch({ type: 'CHANGE_PATTERN', pattern: evt.target.value });
  const message = {
    name: 'changeTargetDataInPreview',
    payload: {
      text: evt.target.value,
    },
  };
  postMessage(message);
}

function changeParam (evt) {
  store.dispatch({ type: 'CHANGE_PARAM', name: evt.target.name, value: evt.target.value })
}

function changeLocale (evt) {
  store.dispatch({ type: 'CHANGE_LOCALE', locale: evt.target.value })
}

function changeIsRich (evt) {
  store.dispatch({ type: 'CHANGE_IS_RICH', isRich: evt.target.checked })
}

function postMessage(message) {
  const parentWindow = window.opener || window.parent;

  parentWindow.postMessage(message, '*');
}

function handleIncomingMessage(evt) {
  const { name, payload } = evt.data;

  if (name === 'updateContent') {
    const { items } = payload;
    const item = items[0];
  
    if (item) {
      store.dispatch({ type: 'CHANGE_PATTERN', pattern: item.target });
      store.dispatch({ type: 'CHANGE_LOCALE', locale: item.targetLanguage });
    }
  }
}

function init() {
  store.dispatch({ type: 'INIT' });
}

function onDOMContentLoaded() {
  confirmNavigation(window.location.href);
  window.addEventListener('message', handleIncomingMessage);
  init();
  draw(store.getState());
}

function confirmNavigation(url) {
  const message = {
    name: 'navigationHandled',
    payload: {
      url,
    },
  };
  postMessage(message);
}

function handleChange() {
  draw(store.getState());
}

function draw(state) {
  render(h(Form, {
    pattern: state.pattern,
    params: state.params,
    locale: state.locale,
    isRich: state.isRich,
    onChangePattern: changePattern,
    onChangeParam: changeParam,
    onChangeLocale: changeLocale,
    onChangeIsRich: changeIsRich
  }), document.getElementById('editor'));
}
store.subscribe(handleChange);

if (document.readyState !== 'loading') {
  onDOMContentLoaded();
} else {
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
}
