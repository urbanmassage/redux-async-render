import {expect} from 'chai';
import * as React from 'react';
import * as Bluebird from 'bluebird';
import {compose, createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider, connect} from 'react-redux';
import * as thunk from 'redux-thunk';
import {serverHelper, renderAsync} from '../index';
import {renderToStaticMarkup} from 'react-dom/server';

describe('redux-async-render', () => {
  it('awaits for promises', () => {
    const create = compose(serverHelper, applyMiddleware(thunk))(createStore);
    const value = (v = null, action) => action.value || v;
    const dispatch = () => (dispatch) => Bluebird.resolve({type: 'TEST', value: 'test'}).delay(100).then(dispatch);
    const store = create(combineReducers({ value }));

    // TODO: get rid of this.
    let called = false;
    @connect(({value}) => ({value}), {dispatch})
    class App extends React.Component<{
      dispatch?: Function;
      value?: string;
    }, void> {
      componentWillMount() {
        if (!called) {
          called = true
          this.props.dispatch();
        }
      }
      render() {
        return <div>{this.props.value}</div>
      }
    }

    const render = (store: Redux.Store) => renderToStaticMarkup(
      <Provider store={store}><App /></Provider>
    );

    return renderAsync(store, render).then(rendered => {
      expect(rendered).to.equal('<div>test</div>');
    });
  });
});
