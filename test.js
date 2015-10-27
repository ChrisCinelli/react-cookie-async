var reactCookie = require('./index');

describe('ReactCookie', function() {
  beforeEach(function() {
    reactCookie.setRawCookie('');
  });

  describe('load', function() {
    it('should not crash if cookies undefined', function() {
      expect(function() {
        reactCookie.setRawCookie(undefined);
      }).not.toThrow();

      expect(reactCookie.load('test')).toBe(undefined);
    });

    it('should read the cookie', function() {
      reactCookie.setRawCookie('test=test');
      expect(reactCookie.load('test')).toBe('test');
    });

    it('should parse if an object', function() {
      reactCookie.setRawCookie('test={"test": true}');
      expect(reactCookie.load('test').test).toBe(true);
    });

    it('should not parse if we ask not to', function() {
      reactCookie.setRawCookie('test={"test": true}');
      expect(typeof reactCookie.load('test', true)).toBe('string');
    });
  });

  describe('save', function() {
    it('should not crash if not in the browser', function() {
      expect(function() {
        reactCookie.save('test', 'test');
      }).not.toThrow();
    });

    it('should update the value', function() {
      reactCookie.setRawCookie('test=test');
      expect(reactCookie.load('test')).toBe('test');

      reactCookie.save('test', 'other');
      expect(reactCookie.load('test')).not.toBe('test');
    });

    it('should stringify an object', function() {
      reactCookie.setRawCookie('test=test');
      expect(reactCookie.load('test')).toBe('test');

      reactCookie.save('test', { test: true });
      expect(typeof reactCookie.load('test')).toBe('object');
    });
  });

  describe('remove', function() {
    it('should do nothing if not in the browser', function() {
      expect(function() {
        reactCookie.remove('test');
      }).not.toThrow();
    });
  });

  describe('plugToRequest', function() {
    it('should load the request cookies', function() {
      reactCookie.plugToRequest({ cookie: { test: 123 } });
      expect(reactCookie.load('test')).toBe(123);
    });

    it('should load the raw cookie header', function() {
      reactCookie.plugToRequest({ headers: { cookie: 'test=123' } });
      expect(reactCookie.load('test')).toBe(123);
    });

    it('should clear the cookies if their is none', function() {
      reactCookie.setRawCookie('test=123');
      expect(reactCookie.load('test')).toBe(123);

      reactCookie.plugToRequest({});
      expect(reactCookie.load('test')).toBeUndefined();
    });
  });
});

describe('ReactCookie with Handles', function() {
  var handle;

  beforeEach(function() {
    var _handle = reactCookie.plugToRequest(
      { cookie: { anotherTest: 123 } }, 
      null, 
      {useHandles : true
    });
    handle = _handle;
    reactCookie.setRawCookie('', {handle : handle});
  });

  afterEach(function() {

  });


  describe('load', function() {
    it('should not crash if cookies undefined', function() {
      expect(function() {
        reactCookie.setRawCookie(undefined, {handle : handle});
      }).not.toThrow();

      expect(reactCookie.load('test')).toBe(undefined);
    });

    it('should read the cookie', function() {
      reactCookie.setRawCookie('test=test', {handle : handle});
      expect(reactCookie.load('test', {handle : handle})).toBe('test');
    });

    it('should parse if an object', function() {
      reactCookie.setRawCookie('test={"test": true}', {handle : handle});
      expect(reactCookie.load('test', {handle : handle}).test).toBe(true);
    });

    it('should not parse if we ask not to', function() {
      reactCookie.setRawCookie('test={"test": true}', {handle : handle});
      expect(typeof reactCookie.load('test', {handle : handle, doNotParse : true})).toBe('string');
    });
  });

  describe('save', function() {
    it('should not crash if not in the browser', function() {
      expect(function() {
        reactCookie.save('test', 'test', {handle : handle});
      }).not.toThrow();
    });

    it('should update the value', function() {
      reactCookie.setRawCookie('test=test', {handle : handle});
      expect(reactCookie.load('test', {handle : handle})).toBe('test');

      reactCookie.save('test', 'other', {handle : handle});
      expect(reactCookie.load('test', {handle : handle})).not.toBe('test');
    });

    it('should stringify an object', function() {
      reactCookie.setRawCookie('test=test', {handle : handle});
      expect(reactCookie.load('test', {handle : handle})).toBe('test');

      reactCookie.save('test', { test: true }, {handle : handle});
      expect(typeof reactCookie.load('test', {handle : handle})).toBe('object');
    });
  });

  describe('remove', function() {
    it('should do nothing if not in the browser', function() {
      expect(function() {
        reactCookie.remove('test', {handle : handle});
      }).not.toThrow();
    });
  });

  describe('plugToRequest', function() {
    it('should load the request cookies', function() {
      var _h = reactCookie.plugToRequest({ cookie: { test: 123 } });
      expect(reactCookie.load('test', {handle : _h})).toBe(123);
    });

    it('should load the raw cookie header', function() {
      var _h = reactCookie.plugToRequest({ headers: { cookie: 'test=123' } });
      expect(reactCookie.load('test', {handle : _h})).toBe(123);
    });

    it('should clear the cookies if their is none', function() {
      reactCookie.setRawCookie('test=123', {handle : handle});
      expect(reactCookie.load('test', {handle : handle})).toBe(123);

      var _h = reactCookie.plugToRequest({});
      expect(reactCookie.load('test', {handle : _h})).toBeUndefined();
    });
  });
});

