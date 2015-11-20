// ==================== static method start, @included  ==================== //

    avalon.getVM = function(vm) {
        return avalon.vmodels[vm];
    };

    avalon.getPureModel = function(vm) {
        return avalon.vmodels && avalon.vmodels[vm] && avalon.vmodels[vm].$model; // for strong
    };

    avalon.$ = function(selector) {
        return document.querySelector(selector);
    };

    /**
     * illyLog
     * 一系列可以在框架生命周期使用或者在控制台使用的快捷log方法
     *
     * @param type {String}
     * @param msg {String}
     * @param res {String | Object}
     * @param saveToLocalStorage {Boolean}
     *
     */
    var illyLog = function illyLog(type, msg, res, style, saveToLocalStorage) {
        var root = avalon.vmodels.root;
        var namespace = root.namespace;
        var currentVM = root.currentState;
        res = res || '';
        if (typeof res !== 'string') {
            res = JSON.stringify(res);
        }
        console.log('%c' + type.toUpperCase() + ': ' + namespace + ' -> ' + currentVM + ': ' + msg + res, style); 
        if (saveToLocalStorage) {
            localStorage.setItem('illy-record-' + namespace + '-' + currentVM + '-' + Date.now(), msg + ' ' + res);
        }
    };

    avalon.illyWarning = function(msg, res) {
        illyLog('warning', msg, res, global_warningLog_style, false);
    };

    avalon.illyError = function(msg, res) {
        illyLog('error', msg, res, global_errorLog_style, false);
    };

    avalon.illyInfo = function(msg, res) {
        illyLog('info', msg, res, global_infoLog_style, false);
    };

    avalon.illyRecord = function(msg, res) {
        illyLog('record', msg, res, global_recordLog_style, true);
    };

    // 性能统计数据,数据详细，推荐在控制台手动调用
    avalon.illyProfile = function getPerformanceTiming () { 

        var performance = window.performance;
        if (!performance) {
            // 当前浏览器不支持
            console.error('你的浏览器不支持 performance 接口');
            return;
        }

        var t = performance.timing;
        var times = {};

        //【重要】页面加载完成的时间
        //【原因】这几乎代表了用户等待页面可用的时间
        times.loadPage = t.loadEventEnd - t.navigationStart;

        //【重要】解析 DOM 树结构的时间
        //【原因】反省下你的 DOM 树嵌套是不是太多了！
        times.domReady = t.domComplete - t.responseEnd;

        //【重要】重定向的时间
        //【原因】拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
        times.redirect = t.redirectEnd - t.redirectStart;

        //【重要】DNS 查询时间
        //【原因】DNS 预加载做了么？页面内是不是使用了太多不同的域名导致域名查询的时间太长？
        // 可使用 HTML5 Prefetch 预查询 DNS ，见：[HTML5 prefetch](http://segmentfault.com/a/1190000000633364)            
        times.lookupDomain = t.domainLookupEnd - t.domainLookupStart;

        //【重要】读取页面第一个字节的时间
        //【原因】这可以理解为用户拿到你的资源占用的时间，加异地机房了么，加CDN 处理了么？加带宽了么？加 CPU 运算速度了么？
        // TTFB 即 Time To First Byte 的意思
        // 维基百科：https://en.wikipedia.org/wiki/Time_To_First_Byte
        times.ttfb = t.responseStart - t.navigationStart;

        //【重要】内容加载完成的时间
        //【原因】页面内容经过 gzip 压缩了么，静态资源 css/js 等压缩了么？
        times.request = t.responseEnd - t.requestStart;

        //【重要】执行 onload 回调函数的时间
        //【原因】是否太多不必要的操作都放到 onload 回调函数里执行了，考虑过延迟加载、按需加载的策略么？
        times.loadEvent = t.loadEventEnd - t.loadEventStart;

        // DNS 缓存时间
        times.appcache = t.domainLookupStart - t.fetchStart;

        // 卸载页面的时间
        times.unloadEvent = t.unloadEventEnd - t.unloadEventStart;

        // TCP 建立连接完成握手的时间
        times.connect = t.connectEnd - t.connectStart;

        return times;
    };

    // 缓存系统通用函数
    
    /**
     * getLocalCache
     * @param itemName {String}
     * return result   {Object} (json-from-api)
    */
    var getLocalCache = function getLocalCache(itemName) {
        return localStorage.getItem && JSON.parse( '' + localStorage.getItem(itemName) );
    };

    /**
     * setLocalCache
     * @param itemName {String}
     * @param source   {String} (json-like)
    */
    var setLocalCache = function setLocalCache(itemName, source) {
        source = JSON.stringify(source);
        localStorage.setItem && localStorage.setItem( itemName, source ); /* jshint ignore:line */
    };

    /*
     * clearLocalCache
     * @param prefix {string}
     * clear the cache item includes the given prefix
    */
    var clearLocalCache = function clearLocalCache(prefix) {
        for (var key in localStorage) {
            if (key.indexOf(prefix) >= 0) {
                localStorage.removeItem(key);
            }
        }
    };

    // 挂载
    avalon.getLocalCache = getLocalCache;
    avalon.setLocalCache = setLocalCache;
    avalon.clearLocalCache = clearLocalCache;

    // ==================== static method end, @included ==================== //
