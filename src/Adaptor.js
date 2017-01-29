import { execute as commonExecute, expandReferences } from 'language-common';
import request from 'request'
import { resolve as resolveUrl } from 'url';
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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
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
export function fetch(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { endpoint, query, postUrl } = expandReferences(params)(state);

    const { username, password, baseUrl } = state.configuration;

    var authy = username+":"+password;
    console.log(authy)
    var bytes = utf8.encode(authy);
    var encoded = base64.encode(bytes);
    console.log(encoded)

    const url = resolveUrl(baseUrl + '/', endpoint)

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query))

    return new Promise((resolve, reject) => {

      request({
        url: url, //URL to hit
        qs: query, //Query string data
        headers: {
          // Maximo's authentication header
          'maxauth': encoded
        }
      }, function(error, response, getResponseBody){
        error = assembleError({error, response})
        if (error) {
          console.error("GET failed.")
          console.log(response)
          reject(error);
        } else {
          console.log("GET succeeded.");
          // console.log(response)
          console.log("Response body: " + getResponseBody)
          request.post ({
            url: postUrl,
            json: JSON.parse(getResponseBody)
          }, function(error, response, postResponseBody){
            error = assembleError({error, response})
            if (error) {
              console.error("POST failed.")
              reject(error);
            } else {
              console.log("POST succeeded.");
              resolve(getResponseBody);
            }
          })
        }
      });
    })
    .then((response) => {
      console.log("Success:", response);
      let result = (typeof response === 'object') ? response : JSON.parse(response);
      return { ...state, references: [ result, ...state.references ] }
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      if (callback) return callback(nextState);
      return nextState;
    })

  }
}

/*
* Make a POST request using existing data from state
*/

export function postData(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { url, body, headers } = expandReferences(params)(state);

    return new Promise((resolve, reject) => {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(body, null, 4) + "\n");
      request.post ({
        url: url,
        json: body,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
          console.log(response);
        } else {
          console.log("Printing response...\n");
          console.log(JSON.stringify(response, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })

  }

}





/**
 * Make a GET request
 * @example
 * execute(
 *   get("my/endpoint", {
 *     callback: function(data, state) {
 *       return state;
 *     }
 *   })
 * )(state)
 * @constructor
 * @param {string} url - Path to resource
 * @param {object} params - callback and query parameters
 * @returns {Operation}
 */
export function get(path, {query, callback}) {
  function assembleError({ response, error }) {
    if ([200,201,202].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const { username, password, baseUrl, authType } = state.configuration;
    const { query: qs } = expandReferences({query})(state);

    const sendImmediately = (authType != 'digest');

    const url = resolveUrl(baseUrl + '/', path)

    return new Promise((resolve, reject) => {

      request({
        url,      //URL to hit
        qs,     //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function(error, response, body){
        error = assembleError({error, response})
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body))
        }
      });

    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
