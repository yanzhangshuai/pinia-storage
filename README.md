<h1>
  <img height="64" src="https://pinia.esm.dev/logo.svg" alt="Pinia logo">
  Pinia Storage
</h1>

<a href="https://npmjs.com/package/@mwjz/pinia-storage">
  <img src="https://badgen.net/npm/v/@mwjz/pinia-storage/latest" alt="npm package">
</a>
<a href="https://github.com/posva/pinia-plugin-debounce/actions/workflows/test.yml">
  <img src="https://github.com/posva/pinia-plugin-debounce/workflows/test/badge.svg" alt="build status">
</a>
<a href="https://codecov.io/gh/posva/pinia-plugin-debounce">
  <img src="https://codecov.io/gh/posva/pinia-plugin-debounce/branch/main/graph/badge.svg?token=9WqnRrLf1Q"/>
</a>

Persistence state in your pinia 🍍 store!

## Installation

```sh
npm install @mwjz/pinia-storage
```

## Usage

```js
import { PiniaStorage } from '@mwjz/pinia-debounce'

// Pass the plugin to your application's pinia plugin
pinia.use(PiniaStorage())
```

You can then use  `storage` option in your stores:

```js
defineStore('id', {
  state: () => ({ bar: '', baz: 0, foo: null }),
  storage: {
    local: ['bar'],
    session: {
      baz: {
        read: (baz) => Number(baz)
      },
      foo: {
        write: (foo: object) => JSON.stringify(foo),
        read: (foo) => {
          try {
            if (!foo) return null;
            return JSON.parse(foo);
          } catch (error) {
            return null
          }
        }
      },
    }
  }
})
```

## License

[MIT](http://opensource.org/licenses/MIT)