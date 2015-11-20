// ==================== router start @include ==================== //

    var _v = '?v=' + resource_version;
    var templateBaseUrl = global_templateBaseUrl + root.namespace + '/';
    var controllerBaseUrl = global_controllerBaseUrl + root.namespace + '/';

    // title Map， 映射各种状态的action-bar title
    var ACTIONBAR_TITLE_MAP = {
        'list': "作业列表",
        'info': '作业详情',
        'question': '题目详情',
        'result': '作业结果',
        'mistakeList': '错题列表',
        'wrong': '错题详情',
        'evaluation': '课堂表现'
    };

    // 可借助静态编译提前填充avalon.templateCache以便减少http请求，提高加载速度
    
    // 定义一个全局抽象状态，用来渲染通用不会改变的视图，比如header，footer
    avalon.state("app", { // app.js这个控制器接管整个应用控制权
        url: "/",
        abstract: true, // 抽象状态，不会对应到url上, 会立即绘制list这个view
        views: {
            //"header@": {
                //templateUrl: templateBaseUrl + "header.html", // 指定模板地址
                //controllerUrl: controllerBaseUrl + "header.js" + _v
            //},
            "": {
                templateUrl: templateBaseUrl + "app.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "app.js" + _v // 指定控制器地址
            }
        }
    })
    .state("app.list", { // 定义一个子状态
        url: "", // list the homework and can enter to do it
        views: {
            "": {
                templateUrl: templateBaseUrl + "list.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "list.js" + _v, // 指定控制器地址
                viewCache: true
            }
        }
    })
    .state("app.detail", { // 用来作为做题模块的总ctrl，抽象状态,加载完资源后会立即绘制info
        //url: "", // a homework with info and result panel, ms-view to render question one by one
        abstract: true, // 抽象状态，用法心得：总控。对复杂的情况分而治之
        views: {
            "": {
                templateUrl: templateBaseUrl + "detail.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "detail.js" + _v // 指定控制器地址
            }
        }
    })
    .state("app.detail.info", { // 作业信息面板，带homeworkId, 用于跳转到相应题目视图
        url: "detail/{homeworkId}/info", // 
        views: {
            "": {
                templateUrl: templateBaseUrl + "info.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "info.js" + _v // 指定控制器地址
            }
        }
    })
    .state("app.detail.question", { // 作业，url较为复杂，某作业下的某题
        url: "detail/{homeworkId}/q/{questionId}", // deal with a spec question, render it for different type
        views: {
            "": {
                templateUrl: templateBaseUrl + "question.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "question.js" + _v, // 指定控制器地址
                ignoreChange: function(changeType) {
                    return !!changeType;
                }
            }
        }
    })
    .state("app.detail.result", { // 某次作业的结果
        url: "detail/{homeworkId}/result", // 
        views: {
            "": {
                templateUrl: templateBaseUrl + "result.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "result.js" + _v // 指定控制器地址
            }
        }
    })
    .state("app.mistake", { // 用来作为错题ctrl，抽象状态,加载完资源后会立即绘制 mistakeList
        //url: "", // a homework with info and result panel, ms-view to render question one by one
        abstract: true, // 抽象状态，用法心得：总控。对复杂的情况分而治之
        views: {
            "": {
                templateUrl: templateBaseUrl + "mistake.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "mistake.js" + _v // 指定控制器地址
            }
        }
    })
    .state("app.mistake.mistakeList", { // mistake list
        url: "mistake/list", // 
        views: {
            "": {
                templateUrl: templateBaseUrl + "mistakeList.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "mistakeList.js" + _v, // 指定控制器地址
                viewCache: true
            }
        }
    })
    .state("app.mistake.wrong", { // mistake question
        url: "mistake/{homeworkId}/q/{questionId}", // deal with a spec question, render it for different type
        views: {
            "": {
                templateUrl: templateBaseUrl + "wrong.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "wrong.js" + _v, // 指定控制器地址
                ignoreChange: function(changeType) {
                    return !!changeType;
                }
            }
        }
    })
    .state("app.evaluation", { // 课堂表现评价列表
        url: "evaluation", // 
        views: {
            "": {
                templateUrl: templateBaseUrl + "evaluation.html", // 指定模板地址
                controllerUrl: controllerBaseUrl + "evaluation.js" + _v // 指定控制器地址
            }
        }
    });

    // ==================== router end @include ==================== //
