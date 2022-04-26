import { createPinia, defineStore, setActivePinia } from "pinia"
import { PiniaStorage } from './index';

const delay = (t?: number) => new Promise((r) => setTimeout(r, t))

interface Storage {
  bar?: string
  baz?: number
  foo?: {
    bar: number
    baz: string
    foo: boolean
  } | null
}

const storage1Store = defineStore<'storage1', Storage>('storage1', {
  state: () => ({ bar: '', baz: 0, foo: null }),
  storage: {
    session: {
      baz: {
        read: (baz) => {
          return Number(baz);
        }
      },
      foo: {
        write: (foo: object) => {
          return JSON.stringify(foo);
        },
        read: (foo) => {
          try {
            if (!foo) return null;
            return JSON.parse(foo);
          } catch (error) {
            return null
          }
        }
      },
    },
    local: ['bar'],
  }
});

const storage2Store = defineStore<'storage2', Storage>('storage2', {
  state: () => ({ bar: '', baz: 0, foo: null }),
  storage: {
    'local': {
      'baz': {
        read: (baz) => {
          return Number(baz);
        }
      },
      'foo': {
        write: (foo: object) => {
          return JSON.stringify(foo);
        },
        read: (foo) => {
          try {
            if (!foo) return null;
            return JSON.parse(foo);
          } catch (error) {
            return null
          }
        }
      },
    },
    'session': ['bar'],
  }
});


describe('storage write', () => {

  beforeEach(() => {
    const pinia = createPinia()
    //@ts-ignore
    pinia._p.push(PiniaStorage())
    setActivePinia(pinia)
  })



  it('example', async () => {
    const store1 = storage1Store();
    const store2 = storage2Store();

    store1.bar = 'store1_bar';
    store2.bar = 'store2_bar';
    store1.baz = 1;
    store2.baz = 2;

    const obj1 = { bar: 1, baz: '1', foo: true };
    const obj2 = { bar: 2, baz: '2', foo: false };

    store1.foo = obj1;
    store2.foo = obj2;

    await delay();

    expect(window.sessionStorage.getItem(store1.$id + '_foo')).toBe(JSON.stringify(obj1));
    expect(window.sessionStorage.getItem(store1.$id + '_baz')).toBe('1');
    expect(window.localStorage.getItem(store1.$id + '_bar')).toBe('store1_bar');

    expect(window.sessionStorage.getItem(store2.$id + '_bar')).toBe('store2_bar');
    expect(window.localStorage.getItem(store2.$id + '_foo')).toBe(JSON.stringify(obj2));
    expect(window.localStorage.getItem(store2.$id + '_baz')).toBe('2');
  });
})

describe('storage write prefix', () => {

  beforeEach(() => {
    const pinia = createPinia()
    //@ts-ignore
    pinia._p.push(PiniaStorage({ prefix: 'storage-' }))
    setActivePinia(pinia)
  })

  it('example', async () => {
    const store1 = storage1Store();
    store1.bar = 'store1_bar';
    store1.baz = 1;
    const obj1 = { bar: 1, baz: '1', foo: true };

    store1.foo = obj1;

    await delay();

    expect(window.localStorage.getItem('storage-' + store1.$id + '_bar')).toBe('store1_bar');
    expect(window.sessionStorage.getItem('storage-' + store1.$id + '_foo')).toBe(JSON.stringify(obj1));
    expect(window.sessionStorage.getItem('storage-' + store1.$id + '_baz')).toBe('1');

  });
})


describe('storage read', () => {

  beforeEach(() => {
    const pinia = createPinia()
    //@ts-ignore
    pinia._p.push(PiniaStorage())
    setActivePinia(pinia)
  })

  it('example', async () => {
    const store1 = storage1Store();
    const store2 = storage2Store();

    const obj1 = { bar: 1, baz: '1', foo: true };
    const obj2 = { bar: 2, baz: '2', foo: false };

    await delay();

    expect(store1.bar).toBe('store1_bar');
    expect(store1.baz).toBe(1);
    expect(store1.foo).toEqual(obj1);

    expect(store2.bar).toBe('store2_bar');
    expect(store2.baz).toBe(2);
    expect(store2.foo).toEqual(obj2)

  });
})