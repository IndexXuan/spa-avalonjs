define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;

    var token = avalon.illyGlobal.token;

    // 获取全局wx-sdk接口
    //var wx = avalon.wx;

    var cachedPrefix = 'illy-question-detail-';

    // resource prefix
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;
    
    var detail = avalon.define({
        $id: "detail",
        visited: false,
        questionId: '',
        questionImage: '',
        questionText: '',
        createdTime: "",
        answer: '',
        teacher: {},

        fetchData: function(questionId) {
            if (detail.visited) {
                var res = avalon.getLocalCache(cachedPrefix + detail.questionId);
                if (res.questionImage !== "") {
                    //detail.questionImage = resourcePrefix + res.questionImage + '?imageView/2/w/600/h/300';
                    detail.questionImage = resourcePrefix + res.questionImage;
                } else {
                    detail.questionImage = '';
                }
                detail.questionText = res.questionText;
                detail.createdTime = res.createdTime;
                detail.answer = res.answer;
                detail.teacher = res.teacher || {};
                return;
            }

            $http.ajax({
                method: 'GET',
                url: apiBaseUrl + 'questions/' + questionId,
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                dataType: "json",
                success: function(res) {
                    if (res.questionImage !== "") {
                        // detail.questionImage = resourcePrefix + res.questionImage + '?imageView/2/w/600/h/300';
                        detail.questionImage = resourcePrefix + res.questionImage;
                    } else {
                        detail.questionImage = '';
                    }
                    detail.questionText = res.questionText;
                    detail.createdTime = res.createdTime;
                    detail.answer = res.answer;
                    detail.teacher = res.teacher || {};
                    avalon.setLocalCache(cachedPrefix + detail.questionId, res);
                },
                error: function(res) {
                    avalon.illyError("detail list ajax error", res);
                    //detail.noContent = true;
                },
                ajaxFail: function(res) {
                    avalon.illyError("detail ajax failed" + res);
                }
            });
        }, // end of fetch data
        isShowingFullScreenImage: false, // 是否正在显示全屏图j
        showFullScreenQuestionImage: function() {
            //document.querySelector('.full-screen-img-wrapper').appendChild(document.querySelector('.questionImage > img').cloneNode());
            //$('.detail div').hide();
            //avalon.$('.full-screen-img-wrapper').style.display = 'block';
            detail.isShowingFullScreenImage = true;
        },
        hideFullScreenQuestionImage: function() {
            detail.isShowingFullScreenImage = false;
        }

    }); // end of define

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {
            
        };
        // 进入视图
        $ctrl.$onEnter = function(params) {

            detail.questionId = params.questionId;
            detail.visited = avalon.vmodels.root.currentIsVisited;
            detail.fetchData(detail.questionId);

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {  

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

