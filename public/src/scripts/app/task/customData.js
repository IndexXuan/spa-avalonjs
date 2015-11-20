// ==================== custom project data start @include ==================== //

    if (token === null) {
        alert("对不起，本系统仅供内部使用！ ERROR::no token error!");
        setTimeout(function() {
            location.replace('./login.html');
        }, 0);
    }

    // avalon global stuff when app init
    avalon.illyGlobal = {

        viewani    : global_viewload_animation_name,
        token      : token,
        apiBaseUrl : apiBaseUrl,
        illyDomain : illy_domain,
        imagesBaseSrc: illy_images_base_src,
        resourceBaseUrl: illy_resource_base_url

    };

    // 定义一个顶层的vmodel，用来放置全局共享数据, 挂载在html元素上
    var root = avalon.define({
        $id: "root", // in html or body
        namespace: 'task', // module namespace, for global cachePrefix use
        mainPage: 'task.list', // 项目的主页,供一些错误redirect
        currentState: '', // list question wrong info result...
        currentAction: '', // onBegin onLoad onBeforeUnload onUnload onError...
        resetConfig: ['activity', 'article'], // 配置需要每次都恢复滚动到页头的视图
        currentIsVisited: false, // boolean flag
        currentDataDone: false, // 由$http模块函数唯一改变
        title: '', // for title element or actionBar use
        footerInfo: '', // first in get the info, rendered in page footer
        back: function() {
            history.go(-1);
        }
    });

    // ==================== custom project data end @include ==================== //
