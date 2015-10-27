var cookie = require('cookie');

var requestHandle = 1;
var _rawCookies = {};
var _res = {};

var _generalHandle = -1;

//true is used for debugging
var _doNotCleanUp = false;

function checkIfItExists(handle){
  if(!_rawCookies[handle]) {
    throw "The handle '"+handle+"' doesn't exist, the request is probably over";
  }
}

function load(name, opt) {
  var cookies = {};

  opt = opt || {};
  //Back compatibility and shortcut
  if(typeof opt === "boolean"){
    opt = {doNotParse : opt}
  }
  opt.handle = opt.handle || _generalHandle;

  if (typeof document !== 'undefined') {
    cookies = cookie.parse(document.cookie);
  }

  var cookieVal = (cookies && cookies[name]) || (_rawCookies[opt.handle] && _rawCookies[opt.handle][name]);

  if (!opt.doNotParse) {
    try {
      cookieVal = JSON.parse(cookieVal);
    } catch(e) {
      // Not serialized object
    }
  }

  return cookieVal;
}

function save(name, val, opt) {
  opt = opt || {};  
  opt.handle = opt.handle || _generalHandle;

  if(!_rawCookies[opt.handle]){
    _rawCookies[opt.handle] = {};
  }
  _rawCookies[opt.handle][name] = val;

  // allow you to work with cookies as objects.
  if (typeof val === 'object') {
    _rawCookies[opt.handle][name] = JSON.stringify(val);
  }

  // Cookies only work in the browser
  if (typeof document !== 'undefined') {
    document.cookie = cookie.serialize(name, _rawCookies[opt.handle][name], opt);
  }

  if (_res[opt.handle] && _res[opt.handle].cookie) {
    _res[opt.handle].cookie(name, val, opt);
  }
}

function remove(name, opt) {
  opt = opt || {};  
  opt.handle = opt.handle || _generalHandle;

  if(!_rawCookies[opt.handle]){
    _rawCookies[opt.handle] = {};
  }

  if(_rawCookies[opt.handle][name])
    delete _rawCookies[opt.handle][name];

  if (typeof document !== 'undefined') {
    if (typeof opt === 'undefined') {
      opt = {};
    } else if (typeof opt === 'string') {
      // Will be deprecated in future versions
      opt = { path: opt };
    }

    opt.expires = new Date(1970, 1, 1, 0, 0, 1);

    document.cookie = cookie.serialize(name, '', opt);
  }

  if (_res[opt.handle] && _res[opt.handle].clearCookie) {
    var opt = path ? { path: path } : undefined;
    _res[opt.handle].clearCookie(name, opt);
  }
}

function setRawCookie(rawCookie, opt) {
  opt = opt || {};  
  opt.handle = opt.handle || _generalHandle;

  if (rawCookie) {
    _rawCookies[opt.handle] = cookie.parse(rawCookie);
  } else {
    _rawCookies[opt.handle] = {};
  }
}

function _cleanup(handle){
  return function() {
    if(_doNotCleanUp) return;

    if(_rawCookies[handle]) delete _rawCookies[handle];
    if(_res[handle]) delete _res[handle];
  }
};


function plugToRequest(req, res, opt) {
  opt = opt || {};  

  var _requestHandle = opt.useHandles ? opt.handle || requestHandle++ : _generalHandle;

  if (req.cookie) {
    _rawCookies[_requestHandle] = req.cookie;
  } else if (req.headers && req.headers.cookie) {
    setRawCookie(req.headers.cookie, {handle : _requestHandle});
  } else {
    _rawCookies[_requestHandle] = {};
  }

  if(res){
    _res[_requestHandle] = res;

    res.on("finish", _cleanup(_requestHandle));
    res.on("error",  _cleanup(_requestHandle));
  }

  return _requestHandle;
}

var reactCookie = {
  //The generic handle can be used on the browser
  //where there is not problem.
  SYNC_REQ_ID       : _generalHandle,
  BROWSER_REQ_ID    : _generalHandle,
  load: load,
  save: save,
  remove: remove,
  setRawCookie: setRawCookie,
  plugToRequest: plugToRequest
};

if (typeof window !== 'undefined') {
  window['reactCookie'] = reactCookie;
}

module.exports = reactCookie;
