// ==================== custom project data start @include ==================== //

    // override, because images in this module is big
    global_rendered_bigImage_delay = 600;    

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
        namespace: 'question', // module namespace, for global cachePrefix use
        mainPage: 'question.index', // 项目的主页,供一些错误redirect
        resetConfig: ['detail', 'form'], // 配置需要每次都恢复滚动到页头的视图
        currentState: '', // list question wrong info result...
        currentAction: '', // onBegin onLoad onBeforeUnload onUnload onError...
        currentDataDone: false, // 由$http模块函数唯一改变
        currentIsVisited: false, // boolean flag
        title: ''
    });

    // ==================== custom project data end @include ==================== //
