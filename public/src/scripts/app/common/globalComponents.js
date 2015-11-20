// ==================== app components area start @include ==================== // 

    /**
     *  components: order is important
     *
     *  getCurrentState(base)
     *  doIsVisitedCheck(base)
     *
     *  loading
     *  resetScrollbar
     *  badNetworkHandle
     *  setTitle
     *
     */

    /** 
     * onBegin
     *   getCurrentState (非可见性组件)
     *   doIsVisitedCheck (非可见性组件)
     *   loadingBeginHandler (开始等待页面渲染)
     *   bindBadNetworkHandler (非可见性组件)
     *
     * onLoad
     *   setTitle (非可见性组件)
     *   scrollBar.setScrollbar (非可见性组件)
     *   loadingEndHandler (针对无异步数据获取的页面)
     *   unbindBadNetworkHandler (非可见性组件)
     *   pushPageState (非可见性组件)
     *
     * onRendered(自定义生命周期)
     *   loadingEndHandler (针对等待异步数据获取的页面)
     *   
     * onBeforeUnload
     *   updatePageState (非可见性组件)
     */

    // getCurrentState component start //
    
    // TODO: 改进来应对复杂多重嵌套后的state, 现在是约定最多三级且和vm的命名相同
    var getCurrentState = function getCurrentState() {
        var state1 = mmState.currentState.stateName.split(".")[1]; // 第二个
        var state2 = mmState.currentState.stateName.split(".")[2]; // 第三个
        if (state2 === void 0) {
            return state1;
        } else {
            return state2;
        }
    };

    root.$watch('currentAction', function(currentAction) {
        if (currentAction === 'onLoad') {
            root.currentState = getCurrentState();
        }
    });

    // getCurrentState component end //
    
    // visitedChecker component start //
    
    // 页面访问统计容器
    // pageId + '-' + scrollTop
    // 最终形成类似结构:['indexPage-120', 'detail/aafsjfjoidsjfi-108', 'list/safdudshfiu-90']
    var CACHE_VISITED_PAGEID_CONTAINER = [];

    // 统一的页面key生成器, 统一有助于全局配置
    var generatePageId = function generatePageId() {
        var pageId = location.href.split('!')[1];
        if (pageId === '/') { // 特殊化处理'/'页面, 所有页面都有'/', 导致错误
            pageId = 'indexPage';
        }
        // console.log(CACHE_VISITED_PAGEID_CONTAINER);
        return pageId;
    };

    var doIsVisitedCheck = function doIsVisitedCheck(callback) {

        var pageId = generatePageId();
        var container = CACHE_VISITED_PAGEID_CONTAINER;
        var isVisited = false;
        for (var i = 0, len = container.length; i < len; i++) { 
            if (container[i].indexOf(pageId) >= 0) {
                isVisited = true;
                break;
            }
        }

        if (callback && typeof callback === 'function') {
            callback();
        }

        return isVisited; 

    };

    root.$watch('currentAction', function(currentAction) {
        if (currentAction === 'onBegin') {
            root.currentIsVisited = doIsVisitedCheck();
        }
    });

    // visitedChecker component end //
     
    // loading component start //

    var loadingBeginHandler = function loadingBeginHandler(loader, callback) {

        if (typeof loader === 'function') { // deal with only one arguments and is callback
            callback = loader;
            loader = void 0;
        }

        loader = global_loader_dom || document.querySelector(global_loader_className);

        var showLoader = function() {
            loader && (loader.style.display = ''); /* jshint ignore:line */
        };

        // loader show logic
        var always_show_loader = global_always_show_loader === true ? true : false;
        if (always_show_loader) {
            showLoader();
        } 
        if (!always_show_loader && !root.currentIsVisited) {
            showLoader();
        }

        if (callback && typeof callback === 'function') {
            callback();
        }

    };

    var loadingEndHandler = function loadingEndHandler(loader, callback) {

        if (typeof loader === 'function') { // deal with only one arguments and is callback
            callback = loader;
            loader = void 0;
        }

        loader = global_loader_dom || document.querySelector(global_loader_className);

        var hideLoader = function() {
            loader && (loader.style.display = 'none'); /* jshint ignore:line */
        };

        if (global_rendered_time === void 0) {
            global_rendered_time = 1000;
            avalon.illyWarning('no global_rendered_time set!');
        }

        setTimeout(function() { 
            hideLoader();
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, global_rendered_time);

    };

    root.$watch('currentAction', function(currentAction) {
        if (currentAction === 'onBegin') {
            loadingBeginHandler();
        }

        // deal with not wait ajax page, like get data from parent vm
        if ( currentAction === 'onLoad' ) {
            if (root.currentDataDone || root.currentIsVisited) {
                loadingEndHandler();
            }
        }
    });

    /** 
     * 201511031617
     * 框架并不能支持异步数据获取情况检测，也就是ajax获取数据
     * 的结果需要自己监听状态，然后为框架添加一个生命周期标记
     * 命名为currentDataDone，对于不需要的页面跳转，比如从父
     * vm获取部分数据来渲染页面也符合逻辑，并在onload就及时
     * loadingEndHandler，整体顺畅实现整个页面生命周期管理。
     *
     * 但是，对于更细致的数据比如图片究竟是否获取完成就只能
     * 加delay来勉强应对大多数情况了,在单页应用这种页面复用
     * 来说，就会出现新页面相同位置保存旧页面的图片数据，有
     * 一定的用户体验不好的地方。
     */

    // ajax data done, invoking loadingEndHandler
    root.$watch('currentDataDone', function(rendered) {
        if (rendered === true) {
            loadingEndHandler();
        }
    });

    // loading component end // 
     
    // resetScrollbar component start //
    
    var resetScrollbarWhenViewLoaded = function resetScrollbarWhenViewLoaded(scrollTop) {
        scrollTop = scrollTop || 0;
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop;
    };

    // 检查页面是否需要智能重置滚动位置, 还是直接重置到顶部
    var checkResetScrollConfig = function(configArr) {
        var current = root.currentState;
        return configArr.some(function(item) {
            return item === current;
        });
    };

    // 从页面信息缓存中获取当前页面滚动历史, 用于智能重置滚动位置
    var getCurrentScrollTopRecord = function() {
        var pageId = generatePageId();
        if (CACHE_VISITED_PAGEID_CONTAINER.length > 0) {
            for (var i = CACHE_VISITED_PAGEID_CONTAINER.length - 2; i >= 0; i--) { // 倒序遍历, 且忽略最后一个，因为由于业务逻辑设计，最后一个就是当前，还没滚动数值后缀
                if (CACHE_VISITED_PAGEID_CONTAINER[i].indexOf(pageId) >= 0) {
                    var ret = CACHE_VISITED_PAGEID_CONTAINER[i].split('-')[1];
                    // alert(CACHE_VISITED_PAGEID_CONTAINER); // 奇怪，pc模拟测试就不正确，但是手机端实测是正确的
                    return ret;
                }
            }
        }

        return 0;
    };

    // 获取当前页面滚动高度
    var getCurrentPageScrollTop = function() {
        return document.body.scrollTop;
    };

    // 写入页面信息统计容器
    var pushPageState = function() {
        var pageId = generatePageId();
        if (pageId !== void 0 && CACHE_VISITED_PAGEID_CONTAINER) {
            CACHE_VISITED_PAGEID_CONTAINER.push(pageId);
        }
    };

    // 更新页面信息统计, 在原来基础上增加离开时页面滚动情况信息
    var updatePageState = function() {
        var len = CACHE_VISITED_PAGEID_CONTAINER.length;
        if (len >= 1) {
            if (CACHE_VISITED_PAGEID_CONTAINER[len - 1].indexOf('-') < 0) { // 防止重复更新，针对$http.rejectInterceptor pop情况
                CACHE_VISITED_PAGEID_CONTAINER[len - 1] = CACHE_VISITED_PAGEID_CONTAINER[len - 1] + '-' + getCurrentPageScrollTop();
            }
        }
    };

    root.$watch('currentAction', function(currentAction) {
        if (currentAction === 'onBeforeUnload') {
            updatePageState();
        }

        if (currentAction === 'onLoad') {
            pushPageState(); 
            if (global_always_reset_scrollbar === true) {
                resetScrollbarWhenViewLoaded();
            } else {
                var config = [];
                if (root.resetConfig.length !== 0) {
                    config = root.resetConfig.$model || [];
                }
                var reset = checkResetScrollConfig(config);
                if (!root.currentIsVisited || reset) {
                    resetScrollbarWhenViewLoaded();
                } else {
                    var scrollTop = getCurrentScrollTopRecord();
                    resetScrollbarWhenViewLoaded(scrollTop);
                }
            }
        }
    });

    // resetScrollbar component end // 
     
    // badNetworkHandler component start // 
    
    // deal with bad network condition for wait too long, auto-back when time enough with tip
    var bindBadNetworkHandler = function bindBadNetworkHandler(timeout) {

        // remove old handler first
        badNetworkTimer && (clearTimeout(badNetworkTimer)); /* jshint ignore:line */

        timeout = global_loading_timeout;
        var loader = global_loader_dom || document.querySelector(global_loader_className);

        var badNetworkTimer = setTimeout(function() {
            alert('对不起，您的网络状态暂时不佳，请稍后重试！');
            // 直接返回的处理方式，不过也值得商榷
            history.go(-1);
            // for strong, need ()
            loader && (loader.style.display = 'none'); /* jshint ignore:line */
        }, timeout);

        avalon.badNetworkTimer = badNetworkTimer;

    };

    var unbindBadNetworkHandler = function unbindBadNetworkHandler(timer) {
        timer = timer || avalon.badNetworkTimer;
        timer && clearTimeout(timer); /* jshint ignore:line */
    };

    root.$watch('currentAction', function(currentAction) {
        if (currentAction === 'onBegin') {
            bindBadNetworkHandler();
        }
        if (currentAction === 'onLoad') {
            unbindBadNetworkHandler();
        }
    });

    // badNetworkHandler component end //
    
    // setTitle component start //
    
    var setPageTitle = function setPageTitle(titleMap) {
        titleMap = titleMap || ACTIONBAR_TITLE_MAP;
        var currentState = root.currentState;
        root.title = titleMap[currentState];
    };

    root.$watch('currentAction', function(currentAction) {
        if (currentAction === 'onLoad') {
            setPageTitle();
        }
    });

    // setTitle component end // 

    // ==================== app components area end @include ==================== //
