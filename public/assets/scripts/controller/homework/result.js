define([], function() {

    // 本次作业结果反馈页面
    var result = avalon.define({
        $id: "result",
        rightAward: 0,
        finishedAward: 0,
        totalAward: 0,
        rightCount: 0,
        wrongCount: 0,
        totalScore: 0
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function() {

            avalon.vmodels.detail.isDone = true;
            //avalon.log(params); 
            var source = avalon.getPureModel('detail').result;
            result.rightAward = source.rightAward;
            result.finishedAward = source.finishedAward;
            result.totalAward = source.totalAward;
            result.rightCount = source.rightCount;
            result.wrongCount = source.wrongCount;
            result.totalScore = source.totalScore;

            if (result.totalAward === 888 && result.totalScore === 100) { // if detact fake data, use cache data
                var res = JSON.parse(localStorage.getItem('illy-homework-last-result'));
                if (res) {
                    result.rightCount = res.rightCount;
                    result.wrongCount = res.wrongCount;
                    result.totalAward = res.totalAward;
                    result.totalScore = res.totalScore;
                } else { // if no cached local data, no way to recover, go index is the only way
                    avalon.router.go('app.list');
                }
            }

            // clear detail exercises for trigger question cannot back
            avalon.vmodels.detail.clearLastHomeworkData();

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            
            // clear detail exercises for trigger question cannot back
            avalon.vmodels.detail.clearLastHomeworkData();
        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

