define([], function() {

    // get config, apiBaseUrl
    var apiBaseUrl = avalon.illyGlobal && avalon.illyGlobal.apiBaseUrl;
    
    // get config, token
    var token = avalon.illyGlobal.token; 

    // override the global back method, only with btn in header
    var back = function back() {

        // tip user whether drop current done! every view change condition should put flag and return
        if ( !detail.isDone && detail.isDoing ) {

            detail.dropCurrentDoneComfirm();

            var app = avalon.vmodels.app; 
            app.$watch("yesOrNo", function(value) { // update in 201509301202
                if (value === true) {
                    // avalon.router.go('app.list');
                    detail.clearCachedData();
                    return ;
                } 
                if (value === false) {
                    app.$unwatch("yesOrNo");
                    // not very good way
                    // history.go(1);
                    // perfect way, but ios9 ok?
                    avalon.router.go('app.detail.question', {homeworkId: detail.homeworkId, questionId: avalon.vmodels.question.localAnswers.length});
                }
            });

        } else {
            // avalon.router.go('app.list');
            detail.clearCachedData();
            return ;
        }

    };

    // 作业详情控制器
    var detail = avalon.define({

        $id: "detail",
        isDone: false, // for check, drop the current done use
        isDoing: false,
        homeworkId: 1, // 作业id，用于发送给server的第一个参数
        title: 'detail.js title', // 作业标题，用于info面板
        keyPoint: 'detail.js keyPoint', // 知识重点，用于info面板
        keyPointRecord: 'detail.js keyPointRecord', // 知识重点录音
        exercises: [], // 题目列表
        questionStartTime: '', // 做题开始时间
        wrongCollect: [], // 发送给server的第二个参数，收集错题的列表
        audioAnswers: [], // 发送给server的第三个参数，录音题列表
        result: { // 结果面板数据集, fake data
            rightAward: 88,
            finishedAward: 88,
            totalAward: 888,
            rightCount: 15,
            wrongCount: 0,
            totalScore: 100
        },
        submit: function() { // core!!!
            
            // 统计做题时间
            var spendSeconds = ( Date.now() - avalon.vmodels.detail.questionStartTime ) / 1000;
            var IntSpendSeconds = parseInt(spendSeconds, 10) || 0;

            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'homework/' + detail.homeworkId + '/performance',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                data: {
                    _id: avalon.getVM('detail').homeworkId,
                    spendSeconds: IntSpendSeconds,
                    wrongCollect: avalon.getVM('detail').$model.wrongCollect, // avoid include avalon-vm-data(like $id, $model, $event)
                    audioAnswers: avalon.getVM('detail').$model.audioAnswers,
                    numOfExercise: avalon.getVM('detail').exercises.length
                },
                success: function(res) {
                    var target = avalon.vmodels.detail.$model.result;
                    target.rightAward = res.rightAward;
                    target.finishedAward = res.finishedAward;
                    target.totalAward = res.totalAward;
                    target.rightCount = res.rightCount;
                    target.wrongCount = res.wrongCount;
                    target.totalScore = res.totalScore; 
                    // last result cache, used for result
                    localStorage.setItem('illy-homework-last-result', JSON.stringify(res));
                    setTimeout(function() {
                        // go result
                        avalon.router.go('app.detail.result', {homeworkId: detail.homeworkId});
                    }, 16);
                },
                error: function(res) {
                    avalon.illyError("submit homework error", res);
                    alert("对不起，作业提交失败，请退出重试！");
                    avalon.router.go('app.list'); // go list page
                }
            });
        }, // end of submit
        clearCachedData: function() { // 清除缓存数据
            // 清除detail控制器缓存的统计数据& core data
            var detailVM = avalon.getVM('detail');
            detailVM.homeworkId = ''; // core data, must clear
            detailVM && (detailVM.wrongCollect = []); /* jshint ignore:line */
            detailVM && (detailVM.audioAnswers = []); /* jshint ignore:line */
            // 清除题目页面缓存的统计数据
            var questionVM = avalon.getVM('question'); // bug!!! $model不统一于vm本身
            questionVM && (questionVM.localAnswers = []); /* jshint ignore:line */

            detail.isDone = false;
            detail.isDoing = false;
        },
        dropCurrentDoneComfirm: function() { // confirm 
            var app = avalon.vmodels.app; 
            app.showConfirm('您确定放弃本次作业？');
        },
        back: back,
        //isBack: false // 防止重复执行back函数，因为点击会调用，同时页面销毁回调也注册了back方法(对付手机原生后退)，重复执行了
        clearLastHomeworkData: function() {
            detail.homeworkId = 0;
            detail.title = ''; // 作业标题，用于info面板
            detail.keyPoint = ''; // 知识重点，用于info面板
            detail.keyPointRecord = ''; // 知识重点录音
            detail.exercises.length = 0; // 题目列表
        }
    }); // end of define

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function() {
            // 抽象视图，啥也不做,放到具体视图里做,但会执行
            // detail.clearCachedData(); // 对付后退又进入，最多后退到info页面(还在detail控制范围内)还保存数据
        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            back();
        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

