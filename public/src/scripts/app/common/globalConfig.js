// ==================== global config area start, @included  ==================== //

    // 变量均来源于gruntfile.js
 
    // 为加载的静态资源加运行时版本号
    var resource_version = '// @@version @@ //';

    // 模板基地址配置
    var global_templateBaseUrl = '// @@templateBaseUrl @@ //';

    // 控制器基地址配置
    var global_controllerBaseUrl = '// @@controllerBaseUrl @@ //';

    // $http log 开关配置, 依据运行时编译目标的模式, 强调试时打开注释即可
    // $http.debug = // @@debug @@ //;
    $http.debug = false;
    
    // override: 重写log方法, 使用本项目提供的醒目输出
    $http.log = function(msg) {
        if (this.debug) {
            if (avalon.illyInfo) {
                avalon.illyInfo(msg);
                return;
            }
            console.log(msg);
        }
    };
    
    // override: $http全局ajax request拦截器配置
    $http.requestInterceptor = function(oldSettings) { // 还有一个隐藏参数xhr对象, 尽量不要使用
        // 重置数据获取成功标记
        avalon.vmodels.root.currentDataDone = false;
        var global_headers = {
            'Authorization': 'Bearer ' + token
        };
        var newHeaders = avalon.mix(oldSettings.headers, global_headers);
        oldSettings.headers = newHeaders;

        return oldSettings;
    };
    
    // override: $http全局ajax resolve拦截器配置
    $http.resolveInterceptor = function() {
        // 数据获取成功
        avalon.vmodels.root.currentDataDone = true;

        // repaint the big image of the page, for better user experience
        if (!root.currentIsVisited) {
            var bigImage = document.querySelector('.big-image');
            if (bigImage) {
                bigImage.style.visibility = 'hidden';
                setTimeout(function() {
                    bigImage.style.visibility = 'visible';
                }, global_rendered_bigImage_delay || 300);
            }
        }
    };

    // override: $http全局ajax reject拦截器配置
    $http.rejectInterceptor = function(msg) {
        // 请求失败，去除最后一条页面记录，以便下次继续发起请求
        CACHE_VISITED_PAGEID_CONTAINER.pop();

        if (msg && msg.indexOf('Authorization') >= 0) {
            alert('对不起，您没有Authorization，本系统仅供会员使用！');
        }
        if (msg && msg.indexOf('token') >= 0) {
            alert('对不起，您的token异常，请退出重试！');
        }
    };

    // project domain, by config 
    var illy_domain = '// @@domain @@ //'; 

    // project images base src
    var illy_images_base_src = './assets/images';

    // resource base url
    var illy_resource_base_url = '// @@resourceBaseUrl @@ //';

    // global apiBaseUrl
    var apiBaseUrl = '// @@apiBaseUrl @@ //'; 

    // get the token and ready to cache
    var token = localStorage.getItem('illy-token');

    // global view loaded animation, from animation.css, the custom version 
    var global_viewload_animation_name = "a-bounceinR";

    // global config, always show loader when view enter 
    var global_always_show_loader = false;

    // global config, always reset scrollbar when view enter
    var global_always_reset_scrollbar = false;

    // global config, loading timeout
    var global_loading_timeout = 12000; // ms, abort the loading when timeout, then auto goback

    // global config, view loaded with a litle delay for avalon rendering page, time enough
    // var global_loading_delay = 30; // ms
    var global_rendered_time = 88; // ms

    // page is reused so some old page big image will
    // splash in new page, add a delay to better UE. 201511031600
    var global_rendered_bigImage_delay = 500;

    // global config, loader className
    var global_loader_className = '.loader';

    // global config, loader'dom, must ensure the dom is exists
    var global_loader_dom = document.querySelector('.loader');

    // global config, error log style
    var global_errorLog_style = "background-color: red; color: #fff; padding: 3px; border-radius: 3px";
    // global config, error log style
    
    var global_warningLog_style = "background-color: #ff9100; color: #fff; padding: 3px; border-radius: 3px";

    // global config, info log style
    var global_infoLog_style = "background-color: #14e5d5; color: #fff; padding: 3px; border-radius: 3px";

    // global config, record log style
    var global_recordLog_style = "background-color: #64c400; color: #fff; padding: 3px; border-radius: 3px";

    // ==================== global config area end, @included  ==================== //
