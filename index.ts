/// <reference path="redux.d.ts" />
import { applyMiddleware } from 'redux';
import * as Bluebird from 'bluebird';

const debug = require('debug')('redux-async-render');
const isPromise = (promise: any) => promise && typeof promise.then === 'function';

// istanbul ignore next
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  console.warn('You shouldn\'t include redux-async-render in client-side code');
}

export const serverHelper: Redux.StoreEnhancer = (createStore: Redux.StoreCreator) => {
  return (reducer, initialState) => {
    let promises = new Array<Bluebird<any>>();

    function observePromise(state, promise) {
      if (!isPromise(promise)) {
        return promise;
      }
      // debug('found promise while state is ', state);

      // wrap promises in bluebird.resolve so we can access #isResolved etc.
      promises.push(Bluebird.resolve(promise));

      return promise;
    }

    let middleware = ({ getState }) => next => action => {
      let state = getState();
      // debug('#dispatch(%s) with state (%j)', action && action.type || typeof action, state);
      return observePromise(state, next(observePromise(state, action)));
    };

    let store = applyMiddleware(middleware)(createStore)(reducer, initialState);
    store.promises = promises;

    return store;
  };
};

function _renderAsync<T>(store: Redux.Store, renderFn: (store: Redux.Store) => T, promises: Bluebird<any>[]): Bluebird<T> {
  // render at each loop so we detect promises
  let rendered = renderFn(store);

  // find unresolved promises
  let unresolved = promises.filter(promise => !promise.isResolved());

  debug('we found %s unresolved promises', unresolved.length);
  if (unresolved.length === 0) {
    debug('returning rendered version');
    return Bluebird.resolve(rendered);
  }

  return Bluebird.all(unresolved).then(() =>
    // recursive in case new promises were introduced.
    _renderAsync<T>(store, renderFn, promises)
  );
}

export function renderAsync<T>(store: Redux.Store, renderFn: (store: Redux.Store) => T): Bluebird<T> {
  let promises = store.promises;
  if (!promises) {
    throw new Error('You need to create the store with serverHelper before calling renderAsync');
  }
  debug('renderAsync: %d promise(s)', promises.length);
  return _renderAsync<T>(store, renderFn, promises)
}
