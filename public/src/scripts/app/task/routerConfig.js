// ==================== router start @include ==================== //

    var _v = '?v=' + resource_version;
    var templateBaseUrl = global_templateBaseUrl + root.namespace + '/';
    var controllerBaseUrl = global_controllerBaseUrl + root.namespace + '/';

    // title Map， 映射各种状态的action-bar title
    var ACTIONBAR_TITLE_MAP = {
        'list': '任务列表',
        'rank': '排行榜',
        'mall': '积分商城',
        'article': '活动详情',
        'activity': '活动详情',
        'me': '个人中心'
    };

    // 可借助静态编译提前填充avalon.templateCache以便减少http请求，提高加载速度
    
    // 定义一个全局抽象状态，用来渲染通用不会改变的视图，比如header，footer
    avalon.state("task", { // task.js这个控制器接管整个应用控制权
        url: "/",
        abstract: true, // 抽象状态，不会对应到url上, 会立即绘制index这个view
        views: {
            "": {
                templateUrl: templateBaseUrl + "task.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "task.js" + _v, // 指定控制器地址
            },
            "footer@": { // 视图名字的语法请仔细查阅文档
                templateUrl: templateBaseUrl + "footer.html", // 指定模板地址
            }
        }
    })
    .state("task.taskList", { // 任务列表
        url: "",
        views: {
            "": {
                templateUrl: templateBaseUrl + "taskList.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "taskList.js" + _v // 指定控制器地址
            }
        }
    })
    .state("task.detail", { // 
        abstract: true, // 抽象状态，用法心得：总控。对复杂的情况分而治之
        views: {
            "": {
                templateUrl: templateBaseUrl + "detail.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "detail.js" + _v // 指定控制器地址
            }
        }
    })
    .state("task.detail.article", { // task, typeof article 
        url: "article/{taskId}/score/{scoreAward}", // 
        views: {
            "": {
                templateUrl: templateBaseUrl + "article.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "article.js" + _v // 指定控制器地址
            }
        }
    })
    .state("task.detail.activity", { // task, typeof activity 
        url: "activity/{taskId}/score/{scoreAward}", // deal with a spec question, render it for different type
        views: {
            "": {
                templateUrl: templateBaseUrl + "activity.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "activity.js" + _v // 指定控制器地址
            }
        }
    })
    .state("task.rank", { // 排行榜
        url: "rank",
        views: {
            "": {
                templateUrl: templateBaseUrl + "rank.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "rank.js" + _v // 指定控制器地址
            }
        }
    })
    .state("task.mall", { // 积分商城
        url: "mall",
        views: {
            "": {
                templateUrl: templateBaseUrl + "mall.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "mall.js" + _v // 指定控制器地r
            }
        }
    })
    .state("task.me", { // 积分商城
        url: "me",
        views: {
            "": {
                templateUrl: templateBaseUrl + "me.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "me.js" + _v // 指定控制器地址
            }
        }
    });

    // ==================== router end @include ==================== //
