define([], function() {
 
    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    var form = avalon.define({
        $id: "form",
        imgLocalId: '',
        imgServerId: '',
        questionText: '',
        createQuestion: function() {
            if (form.questionText.length < 6) {
                avalon.vmodels.question.showAlert('请增加一些描述，以便老师解答!', 2);
                return;
            }
            $http.ajax({
                method: 'POST',
                url: apiBaseUrl + 'questions',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                data: {
                    questionImage: form.imgServerId,
                    questionText: form.questionText
                },
                success: function() {
                    avalon.router.go('question.result.list');
                },
                error: function(res) {
                    avalon.illyError('ajax error', res);
                    alert("对不起，题目上传失败, 请重试！");
                },
                ajaxFail: function(res) {
                    avalon.illyError('ajax failed', res);
                    // alert("对不起，题目上传失败, 请重试！");
                }
            });

        } // end of createQuestion 
    });

    return avalon.controller(function($ctrl) {
        // 进入视图
        $ctrl.$onEnter = function() {

            var index = avalon.vmodels.index;
            form.imgLocalId = index && index.localImgSrc;
            form.imgServerId = index && index.serverId;
            
       };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

            if (avalon.vmodels.index) {
                avalon.vmodels.index.localImgSrc = '';
            }
            avalon.vmodels.form.questionText = '';

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

