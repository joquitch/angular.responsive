describe('angular.responsive', function() {

  beforeEach(module('angular.responsive'));


  describe('Range', function() {
    var DEVICE_NAME = 'device', DEVICE_LOWER = 640, DEVICE_UPPER = 1280;

    var Range;

    beforeEach(inject(function(_Range_) {
      Range = _Range_;
    }));

    it('can set name', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER);
      expect(range.name).toBe(DEVICE_NAME);
    });

    it('must have name', function() {
      expect(function() {
        new Range();
      }).toThrowError();
    });

    it('can set lower', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER);
      expect(range.lower).toBe(DEVICE_LOWER);
    });

    it('must have lower', function() {
      expect(function() {
        new Range(DEVICE_NAME);
      }).toThrowError();
    });

    it('can set upper', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER, DEVICE_UPPER);
      expect(range.upper).toBe(DEVICE_UPPER);
    });

    it('should set upper to MAX_SAFE_INTEGER, if missing', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER);
      expect(range.upper).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('has range if lower exclusive', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER, DEVICE_UPPER);
      expect(range.has(DEVICE_LOWER + 1)).toBeTruthy();
    });

    it('has not range if lower than lower exclusive', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER, DEVICE_UPPER);
      expect(range.has(DEVICE_LOWER)).toBeFalsy();
    });

    it('has range of upper inclusive', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER, DEVICE_UPPER);
      expect(range.has(DEVICE_UPPER)).toBeTruthy();
    });

    it('has not range if higher than upper inclusive', function() {
      var range = new Range(DEVICE_NAME, DEVICE_LOWER, DEVICE_UPPER);
      expect(range.has(DEVICE_UPPER + 1)).toBeFalsy();
    });

  });

});