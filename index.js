'use strict';

module.exports = MiddlewareFactory;
module.exports.Middleware = Middleware;
module.exports.MiddlewareProcess = MiddlewareProcess;

function MiddlewareFactory() {
  var args, mw;
  args = slice(arguments);
  mw = new Middleware();
  if (args.length && !isArrayOrFunction(args[args.length-1])) {
    mw.context = args.pop();
  }
  if (args.length) {
    mw.use.apply(mw, args);
  }
  return mw;
}

function Middleware() {
  this.context = {};
  this.stack = [];
}

Middleware.prototype = {
  use: function () {
    var args = slice(arguments);
    while (args.length) {
      if (isArray(args[0])) {
        this.use.apply(this, args.shift());
        continue;
      }
      if (!isFunction(args[0])) {
        throw new TypeError();
      }
      this.stack.push(args.shift());
    }
    return this;
  },
  run: function () {
    var mw, args, done;
    mw = this;
    args = slice(arguments);
    if (isFunction(args[args.length-1])) {
      done = args.pop();
    }
    setTimeout(function () {
      new MiddlewareProcess(mw, done).exec(args);
    }, 0);
    return this;
  }
};

function MiddlewareProcess(mw, done) {
  this.context = mw.context;
  this.stack = deepClone(mw.stack);
  this.done = done;
}

MiddlewareProcess.prototype = {
  exec: function (args) {
    if (!this.stack.length) {
      end();
    } else {
      args.push(this.next.bind(this));
      args.push(this.end.bind(this));
      try {
        this.stack.shift().apply(this.context, args);
      } catch (err) {
        this.end(err);
      }
    }
  },
  end: function () {
    if (this.done) {
      this.done.apply(this.context, slice(arguments));
    }
  },
  next: function (err) {
    if (err || !this.stack.length) {
      this.end.apply(this, slice(arguments));
      return;
    }
    this.exec(slice(arguments, 1));
  }
};

function deepClone(obj) {
  var copy, i;
  if (!obj || !isObject(obj)) {
    return obj;
  }
  if (isArray(obj)) {
    copy = [];
    for (i = 0; i < obj.length; ++i) {
      copy[i] = deepClone(obj[i]);
    }
    return copy;
  }
  copy = {};
  for (i in obj) {
    if (obj.hasOwnProperty(i)) {
      copy[i] = deepClone(obj[i]);
    }
  }
  return copy;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isArrayOrFunction(obj) {
  return isArray(obj) || isFunction(obj);
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function isObject(obj) {
  return typeof obj === 'object';
}

function slice(obj, start, end) {
  return Array.prototype.slice.call(obj, start, end);
}
