// ==================== custom project data start @include ==================== //

    // rewrite: global config, always show loader when view enter 
    // because question rendered in same page, only data change,
    // it will splash if no loader mask the page when view in,
    // so always show loader, just for user experience. 201511012217
    global_always_show_loader = true; 

    // always reset scrollBar, not smart 
    global_always_reset_scrollbar = true; 

    if (token === null) {
        alert("对不起，本系统仅供内部使用！ ERROR::no token error!");
        setTimeout(function() {
            location.replace('./login.html');
        }, 0);
    }

    // avalon global stuff when app init
    avalon.illyGlobal = {

        // viewani: global_viewload_animation_name,
        token: token,
        apiBaseUrl: apiBaseUrl,
        illyDomain: illy_domain,
        imagesBaseSrc: illy_images_base_src,
        resourceBaseUrl: illy_resource_base_url

    };

    // 定义一个顶层的vmodel，用来放置全局共享数据, 挂载在html元素上
    var root = avalon.define({
        $id: "root", // in html or body
        namespace: 'homework', // module namespace, for global cachePrefix use
        mainPage: 'app.list', // 项目的主页,供一些错误redirect
        currentState: '', // list question wrong info result...
        currentAction: '', // onBegin onLoad onBeforeUnload onUnload onError...
        currentDataDone: false, // 由$http模块拦截器唯一改变
        currentIsVisited: false, // boolean flag
        title: '' // for title element or actionBar use
    });

    // ==================== custom project data end @include ==================== //
