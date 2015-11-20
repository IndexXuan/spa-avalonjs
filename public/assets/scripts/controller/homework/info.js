define([], function() {
    
    // get config, apiBaseUrl
    var apiBaseUrl = avalon.illyGlobal && avalon.illyGlobal.apiBaseUrl;
    
    // get config, token
    var token = avalon.illyGlobal.token; 

    // 题目要求视图,渲染题目信息面板
    var info = avalon.define({
        $id: "info",
        homeworkId: 0,
        title: '',
        keyPoint: '',
        keyPointRecord: '',
        isPlaying: false, // 有录音的作业是否在播放录音
        duration: "加载中...", // 知识重点录音时长, 用于播放完毕ui change
        // core!!! 因为detail为抽象状态，无onEnter的params参数，故延迟到这里获取数据
        fetchDataForDetailCtrl: function(_id) { 
            if (avalon.vmodels.root.currentIsVisited) {

                var json = avalon.getLocalCache('illy-homework-id-' + _id);
                var detail = avalon.vmodels.detail;
                info.homeworkId = json._id;
                detail.homeworkId = json._id;
                info.title = json.title;
                detail.title = json.title;
                info.keyPoint = json.keyPoint;
                detail.keyPoint = json.keyPoint;
                info.keyPointRecord = json.keyPointRecord;
                detail.keyPointRecord = json.keyPointRecord;
                detail.exercises = json.quiz.exercises;

                var keyPointAudio = avalon.$('.info .keyPointAudio');
                keyPointAudio && keyPointAudio.setAttribute('src', avalon.illyGlobal.resourceBaseUrl + info.keyPointRecord); /* jshint ignore:line */

                return ;
            }
            $http.ajax({
                url: apiBaseUrl + 'homework/' + _id,
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: 'json',
                success: function(json) {
                    var detail = avalon.vmodels.detail;
                    info.homeworkId = json._id;
                    detail.homeworkId = json._id;
                    info.title = json.title;
                    detail.title = json.title;
                    info.keyPoint = json.keyPoint;
                    detail.keyPoint = json.keyPoint;
                    info.keyPointRecord = json.keyPointRecord;
                    detail.keyPointRecord = json.keyPointRecord;
                    detail.exercises = json.quiz.exercises;

                    var keyPointAudio = avalon.$('.info .keyPointAudio');
                    keyPointAudio && keyPointAudio.setAttribute('src', avalon.illyGlobal.resourceBaseUrl + info.keyPointRecord); /* jshint ignore:line */
                    avalon.setLocalCache('illy-homework-id-' + _id, json);
                },
                error: function(res) {
                    avalon.illyError("homework exercises ajax error", res);
                },
                ajaxFail: function(res) {
                    avalon.illyError("homework exercises ajax failed", res);
                }
            });
        },
        goNext: function() { // core!!! 判断跳转到哪种类型的题目
            avalon.router.go('app.detail.question', { homeworkId: info.homeworkId, questionId: 1 });
        },
        playRecord: function() {
            var audio = avalon.$('.keyPointAudio');
            audio.play();
            info.isPlaying = true;
            setTimeout(function() {
                info.isPlaying = false;
            }, info.duration * 1000); 
        },
        stopRecord: function() {
            var audio = avalon.$('.keyPointAudio');
            audio.pause();
            info.isPlaying = false;
        },
        toggleRecord: function() {
            if (info.isPlaying) {
                info.stopRecord();
            } else {
                info.playRecord();
            }
        }
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function(params) {
            
            var _id = params.homeworkId;
            var detailVMCachedId = avalon.vmodels.detail.homeworkId;
            if (detailVMCachedId !== _id) {
                info.fetchDataForDetailCtrl(_id);
            }

            setTimeout(function() {
                // 设置好录音时间
                var audio = avalon.$('.keyPointAudio');
                var duration = audio && audio.duration;
                info.duration = (parseInt(duration, 10) + 1) || "加载中...";
            }, 2000);

            setTimeout(function() {
                // re设置好录音时间
                var audio = avalon.$('.keyPointAudio');
                var duration = audio && audio.duration;
                info.duration = (parseInt(duration, 10) + 1) || "加载中...";
            }, 6000);

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            info.stopRecord();
        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

