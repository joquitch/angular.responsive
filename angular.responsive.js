!function(angular, module) {
  'use strict';

  module.provider('responsive', ['Range', provider]);


  function provider(Range) {

    this.ranges = [];

    this.registerDevice = function(name /* string */, lower /* number */, upper /* number */) /* responsive */ {
      var range = new Range(name, lower, upper);
      this.ranges.push(range);

      return this;
    };

    this.$get = ['Callbacks', 'Device', $get];

  }

  function $get(Callbacks, Device) {
    var callbacks = new Callbacks();
    var device = new Device(callbacks, this.ranges);

    return new Responsive(callbacks, device);
  }


  function Responsive(callbacks, device) {
    this.callbacks = callbacks;
    this.device = device;
  }

  angular.extend(Responsive.prototype, {

    on: function(device /* string */, $scope /* angular.IScope */, callback /* () => void */) /* R */ {
      if (device && callback) {
        if (this.is(device)) {
          callback();
        }

        this.callbacks.on(device, callback);

        $scope.$on('$destroy', angular.bind(this.callbacks, function() {
          this.off(device, callback);
        }));
      }
    },

    is: function(device /* string */) /* boolean */ {
      return this.device.is(device);
    }

  });


  module.constant('Range', Range);

  function Range(name /* string */, lower /* number */, upper /* ?: number */) {
    this.name = ensure(name, 'name').not().empty();
    this.lower = ensure(lower, 'lower').positive();
    this.upper = ensure(upper || Number.MAX_SAFE_INTEGER, 'upper').positive();
  }

  angular.extend(Range.prototype, {

    has: function(value /* number */) /* boolean */ {
      return this.lower < value && value <= this.upper;
    }

  });


  module.constant('Callbacks', Callbacks);

  function Callbacks() {
    this.callbacks = {};
  }

  angular.extend(Callbacks.prototype, {

    off: function(device /* string */, callback /* () => void */) /* void */ {
      if (!device || !callback) {
        return;
      }

      var callbacks = this.callbacks[device];
      if (callbacks) {
        var retain = this.callbacks[device] = [];

        for (var index = 0, length = callbacks.length; index < length; index++) {
          var cb = callbacks[index];
          if (cb !== callback) {
            retain.push(cb);
          }

          if (retain.length === 0) {
            delete this.callbacks[device];
          }
        }
      }
    },

    on: function(device /* string */, callback /* () => void */) /* R */ {
      if (!device || !callback) {
        return;
      }

      var callbacks = (this.callbacks[device] || (this.callbacks[device] = []));
      callbacks.push(callback);
    },

    trigger: function(device /* string */) /* void */ {
      if (!device) {
        return;
      }

      var callbacks = this.callbacks[device] || [];
      for (var index = 0, length = callbacks.length; index < length; index++) {
        callbacks[index]();
      }
    }

  });


  module.factory('Device', ['$document', '$rootScope', '$window', factory]);

  function factory($document, $rootScope, $window) {

    function throttle(func /* () => void */, threshold /* number */) /* () => void */ {
      var timer, previous = +new Date();
      return function() {
        function execute() {
          func.apply(this, arguments);
          previous = current;
        }

        var fn = execute.bind(this, arguments);

        var current = +new Date();
        if (current > (previous + threshold)) {
          fn();
        } else {
          clearTimeout(timer);
          timer = setTimeout(fn, threshold);
        }
      }
    }


    function first(items /* T[] */, predicate /* (T) => boolean */) /* T */ {
      for (var index = 0, length = items.length; index < length; index++) {
        var item = items[index];
        if (predicate(item)) {
          return item;
        }
      }

      return void 0;
    }


    function Device($document /* angular.IDocumentService */, $rootScope /* anguar.IRootScopeService */, $window /* angular.IWindowService */, callbacks /* Callbacks */, ranges /* Range[] */) {
      this.$document = $document;
      this.$rootScope = $rootScope;
      this.$window = $window;

      this.callbacks = callbacks;
      this.ranges = ranges;

      this.current = this.previous = this.get();

      this.$window.addEventListener('resize', throttle(angular.bind(this, this.check), 250));
    }

    angular.extend(Device.prototype, {

      check: function() /* void */ {
        this.previous = this.current;
        this.current = this.get();

        if (this.current !== this.previous) {
          this.callbacks.trigger(this.current);
          this.$rootScope.$apply();
        }
      },

      get: function() /* string */ {
        var width = this.$window.innerWidth || this.$document.prop('documentElement').clientWidth || this.$document.prop('body').clientWidth;
        var range = first(this.ranges, function(r) {
          return r.has(width);
        });

        return range ? range.name : 'unknown';
      },

      is: function(device /* string */) /* boolean */ {
        return this.current === device;
      }

    });


    return Device.bind(Device, $document, $rootScope, $window);
  }


  var toString = Object.prototype.toString;

  var is = {

    empty: function(obj) {
      return obj == null || obj === '';
    },

    nan: function(obj) {
      return obj !== obj;
    },

    number: function(obj) {
      return !this.nan(obj) && toString.call(obj) === '[object Number]';
    },

    positive: function(obj) {
      // meh, 0 is not positive, but will do for now.
      return this.number(obj) & obj >= 0;
    }

  };

  function ensure(value, name) {
    return new Ensure(value, name);
  }

  function Ensure(value, name) {
    this.value = value;
    this.name = name;
    this.negate = false;
  }

  angular.extend(Ensure.prototype, {

    _evaluate: function(condition, message) {
      if (this.negate ? !condition : condition) {
        this.negate = false;
        return this.value;
      }

      throw new Error(message.replace(/\{name\}/g, this.name));
    },

    not: function() {
      this.negate = true;
      return this;
    },

    empty: function(message) {
      return this._evaluate(is.empty(this.value), message || '"{name}" cannot be empty.');
    },

    positive: function(message) {
      return this._evaluate(is.positive(this.value), message || '"{name}" must be a positive number.');
    }

  });


}(angular, angular.module('angular.responsive', []));