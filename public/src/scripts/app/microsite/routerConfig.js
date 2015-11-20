// ==================== router start @include ==================== //

    var _v = '?v=' + resource_version;
    var templateBaseUrl = global_templateBaseUrl + root.namespace + '/';
    var controllerBaseUrl = global_controllerBaseUrl + root.namespace + '/';

    // title Map， 映射各种状态的action-bar title
    var ACTIONBAR_TITLE_MAP = {
        'index': '首页',
        'list': '文章列表',
        'detail': '内容详情'
    };

    // 可借助静态编译提前填充avalon.templateCache以便减少http请求，提高加载速度
    
    // 定义一个全局抽象状态，用来渲染通用不会改变的视图，比如header，footer
    avalon.state("site", { // site.js这个控制器接管整个应用控制权
        url: "/",
        abstract: true, // 抽象状态，不会对应到url上, 会立即绘制index这个view
        views: {
            "header@": { // 视图名字的语法请仔细查阅文档
                templateUrl: templateBaseUrl + "header.html", // 指定模板地址
            },
            "": {
                templateUrl: templateBaseUrl + "site.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "site.js" + _v, // 指定控制器地址
            },
            "footer@": { // 视图名字的语法请仔细查阅文档
                templateUrl: templateBaseUrl + "footer.html", // 指定模板地址
            }
        }
    })
    .state("site.index", { // 定义一个子状态，对应url是 
        url: "", // "/" will make error, 就没这个页面了
        views: {
            "": {
                templateUrl: templateBaseUrl + "index.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "index.js" + _v, // 指定控制器地址
                viewCache: true
            }
        }
    })
    .state("site.list", { // 定义一个子状态，对应url是 /{categoryId}，比如/1，/2
        //url: "{categoryName}/Id/{categoryId}",
        url: "{categoryId}",
        views: {
            "": {
                templateUrl: templateBaseUrl + "list.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "list.js" + _v // 指定控制器地址              
            }
        }
    })
    .state("site.detail", { // 定义一个子状态，对应url是 /detail/{articleId}，比如/detail/1, /detail/2
        url: "detail/{articleId}",
        views: {
            "": {
                templateUrl: templateBaseUrl + "detail.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "detail.js" + _v // 指定控制器地址
            }
        }
    });

    // ==================== router end @include ==================== //
