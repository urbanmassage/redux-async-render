# Redux Async Render
A server-side rendering helper for redux.

## So what's this?
Simply a [StoreEnhancer][1] for redux that catches all promises from "dispatch" calls and stores them in "store.promises".
It also provides a function called `renderAsync` that awaits all promises before returning a final rendered version.

This is not an alternative to [redux-promise][2] and it does nothing on the client-side.

[1]: https://github.com/rackt/redux/blob/master/docs/Glossary.md#store-enhancer
[2]: https://github.com/acdlite/redux-promise

## Example Usage

### store.js

```js
import {createStore} from 'redux';
import reducers from 'reducers';

export default function configureStore(initialState) {
  const store = createStore(reducers, initialState);
  return store;
}
```

### server-store.js
```js
import {serverHelper} from 'redux-async-render';
import {createStore, compose} from 'redux';
import reducers from 'reducers';

const finalCreateStore = compose(
  serverHelper
)(createStore);

export default function configureStore(initialState) {
  const store = finalCreateStore(reducers, initialState);
  return store;
}
```

### server-render.jsx
```jsx
import {renderToString} from 'react-dom';
import {renderAsync} from 'redux-async-render';
import configureStore from './server-store';

const html = `
<html>
  <head>
    <title><!-- TITLE --></title>
  </head>
  <body>
    <div id="root"><!-- CONTENT --></div>
  </body>
  <script>
    window.initialStoreData = "-- STORES --";
  </script>
  <script src="/bundle.js"></script>
</html>
`;

export function express(req, res, next) {
  const store = configureStore();
  const renderFn = () => renderToString(<App store={store} />);

  renderAsync(store, renderFn).then(rendered => {
    const state = store.getState();
    res.status(200).send(
      html
        .replace('<!-- CONTENT -->', rendered)
        .replace('"-- STORES --"', JSON.stringify(state))
    );
  }).catch(next);
}
```

## Notes
- It's suggested that you use a custom ajax fetch function that calls the express server (or whatever you use) internally.

## Known issues
- Calling `ReactDOMServer.renderToString` will only cause `componentWillMount` to be called. `componentDidMount` won't be called.
Moreover, `componentWillMount` will be called multiple times in each server-render so make sure you don't fetch data twice or you might be stuck in an infinite loop.
This is a limitation of `ReactDOMServer` but hopefully it will change in the future.
