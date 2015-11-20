define([], function() {

    // get config, apiBaseUrl
    //var apiBaseUrl = avalon.illyGlobal && avalon.illyGlobal.apiBaseUrl;
    // get config, token
    //var token = avalon.illyGlobal.token; 

    // 作业详情控制器
    var result = avalon.define({ /* jshint ignore:line */

        $id: "result",
        current: "list" 

    }); // end of define

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function() {
            // 抽象视图，啥也不做,放到具体视图里做,但会执行
        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

