# node-mw

>  Middleware factory

## Install

```bash
npm install node-mw --save
```

## Usage

```javascript
var Mw = require('node-mw');

Mw({foo:'bar'})
  .use(function (a, next, end) {
    console.log('CP1', this, arguments);
    next(null, 'X');
  })
  .use(function (x, next, end) {
    console.log('CP2', this, arguments);
    next(undefined, 'Y');
  })
  .use(function (y, next, end) {
    console.log('CP3', this, arguments);
    next(null, 'Z')
  })
  .run('a', function () {
    console.log('END', this, arguments);
  });

// output
// CP1 { foo: 'bar' } { '0': 'a', '1': [Function: bound ], '2': [Function: bound ] }
// CP2 { foo: 'bar' } { '0': 'X', '1': [Function: bound ], '2': [Function: bound ] }
// CP3 { foo: 'bar' } { '0': 'Y', '1': [Function: bound ], '2': [Function: bound ] }
// END { foo: 'bar' } { '0': null, '1': 'Z' }
```

## License

MIT
