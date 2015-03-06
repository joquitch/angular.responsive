# Angular.Responsive

Register callbacks to be executed when the width of the viewport changes or is within user-defined constraints.

Original idea by [joquitch](https://github.com/joquitch).

## Usage

```js
  var DEVICE_SMALL = 'small';
  var DEVICE_LARGE = 'large';

  angular.module('sample', ['angular.responsive']);

  angular.module('sample')
         .config(['responsiveProvider', config]);

  // define two devices:
  //    * small 0 < x <= 640
  //    * large 640 < x
  function config(responsive) {
    responsive.registerDevice(DEVICE_SMALL, 0, 640)
              .registerDevice(DEVICE_LARGE, 640);
  }

  angular.module('sample')
         .controller('app', ['$scope', 'responsive', controller]);

  function controller($scope, responsive) {
    responsive.on(DEVICE_SMALL, $scope, function() {
      // this callback will trigger when the size of the viewport is
      // within the range of the small device.
    });

    responsive.on(DEVICE_LARGE, $scope, function() {
      // this callback will trigger when the size of the viewport is
      // within the range of the large device.
    });
  }
```

## License

Licensed under [MIT](http://opensource.org/licenses/mit-license.php). Please refer to LICENSE for more information.