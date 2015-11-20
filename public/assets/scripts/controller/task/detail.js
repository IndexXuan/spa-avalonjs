define([], function() {
    
    //var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    //var token = avalon.illyGlobal.token;
    
    var detail = avalon.define({

        $id: "detail",
        taskId: 1, // 作业id，用于发送给server的第一个参数
        scoreAward: 0,
        outer: false,
        hideTaskInfo: function(infoArr) { // 同时模板里做好无值隐藏
            infoArr === void 0 ? [] : infoArr; /* jshint ignore:line */
            infoArr.forEach(function(item) {
                item = '';
            });
        },
        clearCachedData: function() { // 清除缓存数据
            // 清除detail控制器缓存的数据
        }
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function(params) { /* jshint ignore:line */
            // 抽象视图，啥也不做,放到具体视图里做,但会执行
             detail.clearCachedData();
        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

