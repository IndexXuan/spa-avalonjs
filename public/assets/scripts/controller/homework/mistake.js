define([], function() {

    // get config, apiBaseUrl
    //var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    
    // get config, token
    var token = avalon.illyGlobal.token; 

    // 作业详情控制器
    var mistake = avalon.define({

        $id: "mistake",
        homeworkId: 1, // 作业id，用于发送给server的第一个参数
        exercises: [], // 题目列表
        inWorking: false,
        submit: function() { // core!!!
            mistake.exercises = [];
            // alert("恭喜您，本次作业复习完毕!");
            avalon.vmodels.app.showAlert('恭喜您，本次作业复习完毕!');
            setTimeout(function() {
                avalon.vmodels.app.hideAlert();
                avalon.router.go('app.mistake.mistakeList');   
            }, 1500);
        } // end of submit
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function() {
            // 抽象视图，啥也不做,放到具体视图里做,但会执行
            avalon.vmodels.wrong && (avalon.vmodels.wrong.localAnswers = []); /* jshint ignore:line */
            mistake.exercises = [];
            mistake.inWorking = false;
        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

