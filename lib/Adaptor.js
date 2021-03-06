'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.fetch = fetch;
exports.create = create;
exports.update = update;
exports.update75 = update75;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var base64 = require('base-64');
var utf8 = require('utf8');

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Make a GET request and POST it somewhere else
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
function fetch(params) {

  return function (state) {

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        endpoint = _expandReferences.endpoint,
        query = _expandReferences.query,
        postUrl = _expandReferences.postUrl;

    var _state$configuration = state.configuration,
        username = _state$configuration.username,
        password = _state$configuration.password,
        baseUrl = _state$configuration.baseUrl;


    var authy = username + ":" + password;
    // console.log(authy)
    var bytes = utf8.encode(authy);
    var encoded = base64.encode(bytes);
    // console.log(encoded)

    var url = (0, _url.resolve)(baseUrl + '/', endpoint);

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query));

    return new Promise(function (resolve, reject) {

      (0, _request2.default)({
        url: url, //URL to hit
        qs: query, //Query string data
        headers: {
          // Maximo's authentication header
          'maxauth': encoded
        }
      }, function (error, response, getResponseBody) {
        error = assembleError({ error: error, response: response });
        if (error) {
          console.error("GET failed.");
          console.log(response);
          reject(error);
        } else {
          console.log("GET succeeded.");
          // console.log(response)
          console.log("Response body: " + getResponseBody);
          _request2.default.post({
            url: postUrl,
            json: JSON.parse(getResponseBody)
          }, function (error, response, postResponseBody) {
            error = assembleError({ error: error, response: response });
            if (error) {
              console.error("POST failed.");
              reject(error);
            } else {
              console.log("POST succeeded.");
              resolve(getResponseBody);
            }
          });
        }
      });
    }).then(function (response) {
      console.log("Success:", response);
      var result = (typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' ? response : JSON.parse(response);
      return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references)) });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}

/*
* Make a POST request using existing data from state
*/
function create(params) {

  return function (state) {

    function assembleError(_ref2) {
      var response = _ref2.response,
          error = _ref2.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state),
        endpoint = _expandReferences2.endpoint,
        body = _expandReferences2.body;

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        baseUrl = _state$configuration2.baseUrl;


    var authy = username + ":" + password;
    // console.log(authy)
    var bytes = utf8.encode(authy);
    var encoded = base64.encode(bytes);
    // console.log(encoded);

    var url = (0, _url.resolve)(baseUrl + '/', endpoint);

    console.log("Creating data at URL: " + url);
    console.log("Post body:");
    console.log(JSON.stringify(body, null, 4) + "\n");

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        json: body,
        headers: {
          // Maximo's authentication header
          'maxauth': encoded
        }
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
          console.log(body);
        } else {
          console.log(response);
          console.log("Printing response body...\n");
          console.log(JSON.stringify(body, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}

/**
 * Make an update in Maximo 7.6 and beyond
 * @example
 * execute(
 *   update(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the update
 * @returns {Operation}
 */
function update(params) {

  return function (state) {

    function assembleError(_ref3) {
      var response = _ref3.response,
          error = _ref3.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _expandReferences3 = (0, _languageCommon.expandReferences)(params)(state),
        endpoint = _expandReferences3.endpoint,
        body = _expandReferences3.body;

    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        baseUrl = _state$configuration3.baseUrl;


    var authy = username + ":" + password;
    var bytes = utf8.encode(authy);
    var encoded = base64.encode(bytes);

    var url = (0, _url.resolve)(baseUrl + '/', endpoint);

    console.log("Performing update at URL: " + url);
    console.log("Update data:");
    console.log(JSON.stringify(body, null, 4) + "\n");

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        json: body,
        headers: {
          // Maximo's authentication header
          'maxauth': encoded,
          'x-methodoverride': 'PATCH',
          'patchtype': 'MERGE'
        }
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
          console.log(body);
        } else {
          console.log("Printing response body...\n");
          console.log(JSON.stringify(body, null, 4) + "\n");
          console.log("Update succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}

/**
 * Make an upadte in Maximo 7.5
 * @example
 * execute(
 *   update75(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the update
 * @returns {Operation}
 */
function update75(params) {

  return function (state) {

    function assembleError(_ref4) {
      var response = _ref4.response,
          error = _ref4.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _expandReferences4 = (0, _languageCommon.expandReferences)(params)(state),
        endpoint = _expandReferences4.endpoint,
        body = _expandReferences4.body;

    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        baseUrl = _state$configuration4.baseUrl;


    var authy = username + ":" + password;
    var bytes = utf8.encode(authy);
    var encoded = base64.encode(bytes);

    var url = (0, _url.resolve)(baseUrl + '/', endpoint);

    console.log("Performing update at URL: " + url);
    console.log("Update data:");
    console.log(JSON.stringify(body, null, 4) + "\n");

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        form: body,
        headers: {
          // Maximo's authentication header
          'maxauth': encoded,
          'x-methodoverride': 'PATCH',
          'patchtype': 'MERGE'
        }
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
          console.log(body);
        } else {
          console.log("Printing update response body...\n");
          console.log(JSON.stringify(body, null, 4) + "\n");
          console.log("Update succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}
