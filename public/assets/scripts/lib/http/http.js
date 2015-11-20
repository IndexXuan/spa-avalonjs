/*******************************************************
  > File Name: http.js
  > Author: IndexXuan
  > Mail: indexxuan@gmail.com
  > Created Time: 2015年07月10日 星期五 15时34分30秒
 ******************************************************/

(function(global, factory) {

    if (typeof module === "object" && typeof module.exports === "object") {
        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get $http.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var $http = require("$http")(window);
        module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
                throw new Error("$http requires a window with a document");
            }
            return factory(w);
        };
    } else {
        factory(global);
    }

    // Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {

    // inner function 
    function noop() {}

    // inner key method, {} === {} is not ok, so must have this method, fuck
    function isEmptyObject(obj) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    }

    // inner function, setHeaders from user settings.
    // as named... ,dropped in 20150718
    //{
    //    key: "val",
    //    key1: "val1"
    //}
    // == >
    // key=val&key1=val1
    function jsonToquerystring(data) {
        var querystring = "";
        var keys = Object.keys(data);
        var str = "";
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            str += keys[i] + '=' + data[key] + "&";
        }
        querystring = str.substring(0, str.length - 1);

        return querystring;
    }

    // inner function, deal with GET with data options
    function parseUrl(url, data) {
        // 统一追加data到url上（注意data是否为空，且url是否已经有querystring）
        var hasQueryString = url.indexOf("?") >=0;
        if (hasQueryString) {
            if (isEmptyObject(data)) {
                url += '&cache=' + Date.now();
            } else {
                url += '&' + jsonToquerystring(data) + '&cache=' + Date.now();
            }
        } else {
            if (isEmptyObject(data)) {
                url += '?cache=' + Date.now();
            } else {
                url += '?' + jsonToquerystring(data) + '&cache=' + Date.now();
            }
        }
        return url;
    }

    // can extend to deal with old ie
    function parseJSON(str) { // meet some problem with simple string like server response 'ok' string...
        try {
            return JSON.parse(str + ""); // more safe
        } catch (e) {
            console.log('JSON PARSE ERROR! ' + str);
            return str; 
        }
    }

    // set headers
    function setHeaders(xhr, headers) {
        // set others, if exists.
        if ( !isEmptyObject(headers) ) {
            var keys = Object.keys(headers);
            for (var x = 0, len = keys.length; x < len; x++) {
                var key = keys[x];
                var val = headers[key]; // vars must in '[]' expression... fuck
                xhr.setRequestHeader(keys[x], val); // key -- val
            }
        }
    }

    // inner function to getXHR, can extend to deal with old ie
    var getXHR = function getXHR() {
        var xhr = new XMLHttpRequest(); 
        return xhr;
    };

    var argsToConfigObj = function(arr) {
        return {
            method: arr[0],
            url: arr[1],
            data: arr[2],
            beforeSend: arr[3],
            headers: arr[4],
            success: arr[5],
            error: arr[6],
            ajaxFail: arr[7],
            timeout: arr[8]
        };
    };

    // ajax main function
    var request = function request(method, url, data, beforeSend, headers, success, error, ajaxFail, timeout) {

        var xhr = getXHR();

        // settings adaptor
        var oldSettings = argsToConfigObj(arguments);

        // 全局拦截request, return new xhr settings and do something
        var newSettings = $http.requestInterceptor(oldSettings, xhr) || oldSettings;

        // deal with user settings
        method = newSettings.method.toUpperCase();
        data = newSettings.data || {};
        beforeSend = newSettings.beforeSend || noop;
        headers = newSettings.headers || {};
        success = newSettings.success || noop;
        error = newSettings.error || noop;
        ajaxFail = newSettings.ajaxFail || noop;
        timeout = (newSettings.timeout || 15) * 1000;

        xhr.open(method, method === 'GET' ? parseUrl(url, data)  : url, true); // mark!!!!!!
        xhr.onreadystatechange = function() {
            //console.log(xhr);
            //此函数执行多次，即状态多变就多次进入
            //if (xhr.readyState === 4 && xhr.status === 200) {
            //    success(parseJSON(xhr.responseText));
            //}
            var msg = 'inner onreadystatechange';
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    msg = 'xhr ' + method + ' success in ' + url;
                    $http.log(msg);
                    ajaxTimer && clearTimeout(ajaxTimer); /* jshint ignore:line */
                    success( parseJSON( xhr.responseText ) );
                    // 全局拦截ajax success
                    $http.resolveInterceptor();
                } else {
                    msg = 'xhr ' + method + ' failed in ' + url;
                    $http.log(msg);
                    // 全局拦截ajax error
                    $http.rejectInterceptor(parseJSON(xhr.responseText));
                    error(parseJSON(xhr.responseText));
                }
            }
        };
        beforeSend(xhr); // useful when use

        //xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
        xhr.setRequestHeader('Content-Type', "application/json"); // update in 20150718

        setHeaders(xhr, headers);

        //xhr.send(method !== "GET" ? jsonToquerystring(data) : null);
        xhr.send(method !== "GET" ? JSON.stringify(data) : null); // update in 20150718
        var ajaxTimer = setTimeout(function() {
            xhr.abort();
            var msg = 'xhr ' + method + ' abort when timeout in ' + timeout / 1000 + ' seconds, with url ' + url;
            $http.log(msg);
        }, timeout);

        xhr.onerror = function() {
            $http.rejectInterceptor();
            var msg = 'xhr ' + method + ' error in ' + url;
            $http.log(msg);
            ajaxFail(xhr.response);
        };

    };

    // export object
    var $http = { 

        debug: false,

        log: function(msg) {
            if (this.debug) {
                console.log(msg);
            }
        },

        // 发送拦截器(oldSettings, xhr)
        'requestInterceptor': noop,

        // 返回拦截器, 暂未支持
        // responseInterceptor: noop,
        
        // resolve拦截器
        'resolveInterceptor': noop,

        // reject拦截器
        'rejectInterceptor': noop,

        // 简化的ajax GET方法
        'get': function(settings) {
            request('GET', settings.url, settings.data, settings.beforeSend, settings.headers, settings.success, settings.error, settings.ajaxFail, settings.timeout);
        },

        // 简化的ajax POST方法
        'post': function(settings) {
            request('POST', settings.url, settings.data, settings.beforeSend, settings.headers, settings.success, settings.error, settings.ajaxFail, settings.timeout);
        },

        // ajax通用方法
        'ajax': function(settings) {
            request(settings.method || "GET", settings.url, settings.data, settings.beforeSend, settings.headers, settings.success, settings.error, settings.ajaxFail, settings.timeout);
        }
    };

    // Register as a named AMD module, since $http can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase $http is used because AMD module names are
    // derived from file names, and $http is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of $http, it will work.

    // Note that for maximum portability, libraries that are not $http should
    // declare themselves as anonymous modules, and avoid setting a global if an
    // AMD loader is present. $http is a special case. For more information, see
    // https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
    if (typeof define === "function" && define.amd) {
        define("$http", [], function() {
            return $http;
        });
    }
    // Map over $http in case of overwrite
    var _http = window.$http;
    $http.noConflict = function(deep) {
        if (deep && window.$http === $http) {
            window.$http = _http;
        }
        return $http;
    };
    // Expose $http identifiers, even in AMD
    // and CommonJS for browser emulators
    if (noGlobal === void 0) {
        window.$http = $http;
    }

    return $http;

}));

/** 
 *  changelog
 *  20150804 update parseUrl function
 *  20151101 update source with work code, not very good...
 *  20151102 update global http interceptor and log with config
 *  20151103 make interceptor dynamic change the xhr settings(like set headers global default)
 *  20151110 fix requestInterceptor bug, if not def spec method to change oldSettings, use oldSettings itself
 */

// usage, arguments must be full
//$http.ajax({
//    method: "", // default GET
//    url: "http://api.example.com/api/v1/categories/1",
//    data: {

//    },
//    beforeSend: function(xhr) {
//    
//    },
//    headers: { // default Authorization Bearer 

//    },
//    success: function(res) {
//        console.log(res);
//    },
//    error: function(res) {
//        console.error(res);
//    },
//    ajaxFail: function(res) {
//        console.error(res);
//    },
//    timeout: 15, // second
//    cache: true, // if type get, default do it 
//    dataType: "json", // the only type for now
//})

