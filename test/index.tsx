import {expect} from 'chai';
import * as React from 'react';
import {compose, createStore} from 'redux';
import {serverHelper, renderAsync} from '../index';
import {renderToStaticMarkup} from 'react-dom/server';

describe('redux-async-render', () => {
  it('warns when serverHelper is forgotten', () => {
    const store = createStore(v => v, null);
    const App = (store) => <noscript />;
    const render = store => renderToStaticMarkup(<App store={store} />);

    try {
      renderAsync(store, render);
      expect.fail('shouldn\'t render when serverHelper isn\'t used');
    } catch(err) {
      // ok
    }
  });

  it('renders', () => {
    const create = serverHelper(createStore);
    const store = create(v => v, null);
    const App = (store) => <noscript />;
    const render = store => renderToStaticMarkup(<App store={store} />);

    return renderAsync(store, render).catch(err => {
      expect.fail(err);
    }).then(rendered => {
      expect(rendered).to.equal('<noscript></noscript>');
    });
  });
});
