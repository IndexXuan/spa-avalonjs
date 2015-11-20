// ==================== router start @include ==================== //

    // for router config
    var _v = '?v=' + resource_version;
    var templateBaseUrl = global_templateBaseUrl + root.namespace + '/';
    var controllerBaseUrl = global_controllerBaseUrl + root.namespace + '/';

    // title Map， 映射各种状态的action-bar title
    var ACTIONBAR_TITLE_MAP = {
        'index': '',
        'form': '问题描述',
        'list': '当前提问',
        'history': '过往提问',
        'detail': '解答详情'
    };

    // 可借助静态编译提前填充avalon.templateCache以便减少http请求，提高加载速度
    
    // 定义一个全局抽象状态，用来渲染通用不会改变的视图，比如header，footer
    avalon.state("question", { // task.js这个控制器接管整个应用控制权
        url: "/",
        abstract: true, // 抽象状态，不会对应到url上, 会立即绘制index这个view
        views: {
            "header": {
                templateUrl: templateBaseUrl + 'header.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'header.js' + _v, // 指定控制器地址
            },
            "": {
                templateUrl: templateBaseUrl + 'question.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'question.js' + _v, // 指定控制器地址
            },
            "footer@": { // 视图名字的语法请仔细查阅文档
                templateUrl: "assets/templates/footer.html", // 指定模板地址
            }
        }
    })
    .state("question.index", { // 首页(引导拍照提问, 同时引导文字提问链接至detail)
        url: "",
        views: {
            "": {
                templateUrl: templateBaseUrl + 'index.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'index.js' + _v, // 指定控制器地址
            }
        }
    })
    .state("question.form", { // 提问补充(图片提问和文字提问)
        url: "form",
        views: {
            "": {
                templateUrl: templateBaseUrl + 'form.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'form.js' + _v, // 指定控制器地址
            }
        }
    })
    .state("question.result", { // 提问结果(抽象父状态， 包含提问列表和过往提问历史)
        abstract: true,
        views: {
            "": {
                templateUrl: templateBaseUrl + 'result.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'result.js' + _v, // 指定控制器地址
            }
        }
    })
    .state("question.result.list", { // 提问列表(当前未被解答的提问) 
        url: "list",
        views: {
            "": {
                templateUrl: templateBaseUrl + 'list.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'list.js' + _v, // 指定控制器地址
            }
        }
    })
    .state("question.result.history", { // 过往提问
        url: "history",
        views: {
            "": {
                templateUrl: templateBaseUrl + 'history.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'history.js' + _v, // 指定控制器地址
            }
        }
    })
    .state("question.detail", { // 过往提问
        url: "detail/{questionId}",
        views: {
            "": {
                templateUrl: templateBaseUrl + 'detail.html', // 指定模板地址
                controllerUrl: controllerBaseUrl + 'detail.js' + _v, // 指定控制器地址
            }
        }
    })

    // ==================== router end @include ==================== //
