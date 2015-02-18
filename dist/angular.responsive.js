/*
   Angular.Responsive
   ------------------
   v0.1.0
   Copyright (c) 2015 Mattias Rydengren <mattias.rydengren@coderesque.com>
   Distributed under MIT license
*/
!function(angular) {
  'use strict';

  angular.module('angular.responsive', [])
    .provider('responsive', [provider]);


  function provider() {

    this.ranges = [];

    this.registerDevice = function(name /* string */, lower /* number */, upper /* number */) /* responsive */ {
      var range = new Range(name, lower, upper);
      this.ranges.push(range);

      return this;
    };

    this.$get = ['$document', '$rootScope', '$window', function($document, $rootScope, $window) {
      var callbacks = new Callbacks();
      var device = new Device($document, $rootScope, $window, callbacks, this.ranges);

      return new Responsive(callbacks, device);
    }];
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


  function Device($document /* angular.IDocumentService */, $rootScope /* anguar.IRootScopeService */, $window /* angular.IWindowService */, callbacks /* Callbacks */, ranges /* Range[] */) {
    this.$document = $document;
    this.$rootScope = $rootScope;
    this.$window = $window;

    this.callbacks = callbacks;
    this.ranges = ranges;

    this.current = this.previous = this.get();

    this.$window.onresize = throttle(angular.bind(this, this.check), 250);
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


  function Range(name /* string */, lower /* number */, upper /* ?: number */) {
    this.name = name;
    this.lower = lower;
    this.upper = upper || Number.MAX_VALUE;
  }

  angular.extend(Range.prototype, {

    has: function(value /* number */) /* boolean */ {
      return this.lower < value && value <= this.upper;
    }

  });


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

}(angular);