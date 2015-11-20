define([], function() {

    // 获取全局wx-sdk接口
    //var wx = avalon.wx;
    
    // 每一个具体的题目控制器
    var wrong = avalon.define({
        $id: "wrong",
        homeworkId: avalon.vmodels.mistake.homeworkId, // 直接取，这种固定值不需要动态获取
        exercise: {}, // 本题所有数据
        total: 0, // 直接取不行,fuck bug... waste much time... 201507222006
        currentId: 0, // current exerciseId, 当前题id
        userAnswer: '', // 忠实于用户答案, 最多加个trim()
        localAnswers: [], // 本地保存本次作业当前所有做过的题的答案，length就是做到过哪一题了, core!!!
        right: null, // 做对与否, 录音题始终设为right(Em~...), 控制一些显隐逻辑(null, true, false)
        hasNext: false, // 是否有下一题？
        next: function() { // 点击进入下一题
            // 只处理页面跳转进入下一题
            avalon.router.go('app.mistake.wrong', {homeworkId: wrong.homeworkId, questionId: wrong.currentId + 1});
        },
        submit: function() {

            /** 
             *  通知父vm提交(父vm决定提交跳转逻辑，此处简化)
             */

            wrong.localAnswers = []; // key! clear cache! bug fix in 201509012200
            avalon.vmodels.mistake.submit();

        } 
    });

    return avalon.controller(function($ctrl) {

        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

            //var question = avalon.$('.question');
            //var win_height = document.documentElement.clientHeight;
            //var answerPanel = avalon.$('.answer-panel');
            //setTimeout(function() {
            //    question && (question.style.height = win_height + 'px'); [> jshint ignore:line <]
            //}, 16);

        };
        // 进入视图, 对复用的数据进行重置或清空操作！
        // 一个重大的问题或者注意事项就是，恢复的顺序问题，很多数据都是有顺序依赖的
        $ctrl.$onEnter = function(params) {

            wrong.currentId = params.questionId;
            var exercises = avalon.vmodels.mistake.exercises;
            if (exercises.length === 0) {
                // alert('亲，过去不要执念，还是要拥抱新生活哦，回去吧, 拜拜~'); // 防止这种不该的返回或直接访问
                location.replace('./homework.html#!/mistake/list');
                return;
            }

            // 然后双向绑定，渲染
            var id = params.questionId - 1 || 0; // for strong, url中的questionId才用的是1开始，为了易读性
            wrong.exercise = exercises[id]; // yes
            wrong.userAnswer = wrong.exercise.wrongAnswer;
            wrong.localAnswers.push(wrong.exercise.wrongAnswer);

            // 重置题目对错标记
            wrong.right = false;

            wrong.total = avalon.vmodels.mistake.exercises.length; // yes, must动态设置
            if (params.questionId < wrong.total) { // key! to next or submit
                wrong.hasNext = true;
            } else {
                wrong.hasNext = false;
            }

        }; // onEnter end
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

