/*******************************************************
    > File Name: promise-http.js
    > Author: IndexXuan
    > Mail: indexxuan@gmail.com
    > Created Time: 2015年08月03日 星期一 18时37分04秒
 ******************************************************/

'use strict'

// create a promise, show the implementation of a method which uses a Promise to report the success or failure of an XMLHttpRequest
// A-> $http function is implemented in order to follow the standard Adapter pattern
function $http(url) {
    
    // A small example of object
    var core = {

        // Method that performs the ajax request
        ajax: function(method, url, args) {
            
            // Creating a Promise
            var promise = new Promise( function (resolve, reject) {

                // Instantiates the XMLHttpRequest
                var client = new XMLHttpRequest();
                var uri = url;

                if (args && (method === 'POST') || method === 'PUT') {
                    uri += '?';
                    for (var key in args) {
                        if (args.hasOwnProperty(key)) {
                            if (argcount++) {
                                uri += '&';
                            }
                            uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                        }
                    }
                }

                client.open(method, url);
                client.send();

                client.onload = function() {
                    if (this.status === 200) {
                        // Performs the function "resolve" when this.status is equal to 200
                        resolve(this.response);
                    } else {
                        // Performs the function "reject" when this.status is different than 200
                        reject(this.statusText);
                    }
                };

                client.onerror = function() {
                    reject(this.statusText);
                };
            })

            // return the promise
            return promise;
        }
    };

    // Adapter pattern
    return {
        'get': function(args) {
            return core.ajax('GET', url, args);
        },
        'post': function(args) {
            return core.ajax('POST', url, args);
        },
        'put': function(args) {
            return core.ajax('PUT', url, args);
        },
        'delete': function(args) {
            return core.ajax('DELETE', url, args);
        }
    };

};
// End A

// B-> Here you define its functions and its payload
var mdnAPI = 'https://developer.mozilla.org/en-US/search.json';
var payload = {
    'topic': 'js',
    'q'    : 'Promise'
};

var callback = {
    success: function(data) {
        console.log(1, 'success', JSON.parse(data));
    },
    error: function(data) {
        console.log(2, 'error', JSON.parse(data));
    }
};
// End B

// Executes the method call
$http(mdnAPI)
    .get(payload)
    .then(callback.success)
    .catch(callback.error);

// Executes the method call but an alternative way (1) to handle Promise Reject case
$http(mdnAPI)
    .get(payload)
    .then(callback.success, callback.error);

// Execute the method call but an alternative way (2) to handle Promise Reject case
$http(mdnAPI)
    .get(payload)
    .then(callback.success)
    .then(undefined, callback.error);

