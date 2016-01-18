// Type definitions for Redux v1.0.0
// Project: https://github.com/rackt/redux

declare module Redux {
  interface ActionCreator extends Function {
    (...args: any[]): any;
  }

  interface Reducer extends Function {
    (state: any, action: any): any;
  }

  interface Dispatch extends Function {
    (action: any): any;
  }

  interface StoreMethods {
    dispatch: Dispatch;
    getState(): any;
  }

  interface MiddlewareArg {
    dispatch: Dispatch;
    getState: Function;
  }

  interface Middleware extends Function {
    (obj: MiddlewareArg): Function;
  }

  interface Dispatch {
    (action: Action): any;
  }

  interface Action {
    type: string;
    [key: string]: any;
  }

  interface Store {
    dispatch: Dispatch;
    getReducer(): Reducer;
    replaceReducer(nextReducer: Reducer): void;
    getState(): any;
    subscribe(listener: Function): Function;
  }

  interface StoreCreator { (reducer: Reducer, initialState?: any): Store; }
  interface StoreEnhancer { (next: StoreCreator): StoreCreator }

  var createStore: StoreCreator;
  function bindActionCreators<T>(actionCreators: T, dispatch: Dispatch): T;
  function combineReducers(reducers: any): Reducer;
  function applyMiddleware<T extends Function>(...middlewares: Middleware[]): (T) => T;
  function compose<T extends Function>(...functions: Function[]): (arg: T) => T;
}

declare module "redux" {
  export = Redux;
}
