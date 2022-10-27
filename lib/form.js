'use strict';

const h = require('react').createElement;
const parse = require('format-message-parse');
const TokenArea = require('./token-area');
const Params = require('./params');

module.exports = function Form (props) {
  const pattern = props.pattern;
  const params = props.params;
  const locale = props.locale;
  const isRich = props.isRich;
  const tokens = [];
  let error;
  let ast;

  try {
    ast = parse(pattern, { tagsType: isRich ? '<>' : null, tokens: tokens })
  } catch (e) {
    error = e
  }

  return (
    h('form', { className: 'Form' },
      h('label', { htmlFor: 'pattern' }, 'Message'),
      h('div', { className: 'Form-pattern' },
        h('textarea', {
          className: 'Form-text',
          id: 'pattern',
          name: 'pattern',
          onChange: props.onChangePattern,
          value: pattern
        }),
        h(TokenArea, {
          className: 'Form-message',
          error: error,
          pattern: pattern,
          tokens: tokens
        })
      ),
      h('label', null,
        h('input', {
          className: 'p-checkbox',
          id: 'isRich',
          name: 'isRich',
          onChange: props.onChangeIsRich,
          type: 'checkbox',
          checked: isRich
        }),
        'Parse simple xml/html tags like ',
        h('code', null, '<a><b/></a>')
      ),
      h('label', { htmlFor: 'locale' },
        'Language',
        h('span', {
          className: 'p-tooltip',
          'data-tooltip': 'IETF Language Tag'
        },
          h('a', {
            className: 'button button-primary help-button',
            href: 'http://www.i18nguy.com/unicode/language-identifiers.html',
            target: '_blank'
          }, '?')
        )
      ),
      h('input', {
        className: 'p-value',
        id: 'locale',
        name: 'locale',
        onChange: props.onChangeLocale,
        type: 'text',
        value: locale,
        disabled: true
      }),
      ast && h(Params, {
        pattern: pattern,
        ast: ast,
        params: params,
        locale: locale,
        onChange: props.onChangeParam
      })
    )
  )
}
