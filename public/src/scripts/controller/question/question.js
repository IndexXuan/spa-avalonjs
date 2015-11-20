define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    // defaultAvatarUrl
    var defaultAvatarUrl = avalon.illyGlobal.resourceBaseUrl + 'images/avatar/children/default1.png?imageView2/1/w/200/h/200';

    // question ctrl take charge of everything...
    var question = avalon.define({ 
        $id: "question",
        $skipArray: ["illly_domain", "illy_images_base"],
        illy_domain: avalon.illyGlobal.illyDomain,
        illy_images_base: avalon.illyGlobal.imagesBaseSrc,
        illy_resource_base: avalon.illyGlobal.resourceBaseUrl,
        schoolName: '',
        //score: 88,
        //studentCount: 100,
        getUserInfo: function() {
            $http.ajax({
                url: apiBaseUrl + "profile",
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    question.avatar = json.avatar !== void 0 ? json.avatar : defaultAvatarUrl;
                    question.displayName = json.displayName;
                    question.score = json.score;
                }
            });
        },
        getSchoolInfo: function() {
            $http.ajax({
                url: apiBaseUrl + "school",
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    question.schoolName = json.school;
                    avalon.vmodels.root.footerInfo = json.school + ' © ' + new Date().getFullYear();
                    question.studentCount = json.studentCount || 100;
                }
            });
        },

        /* common start */
        appMessage: 'I am message from app ctrl',
        gMaskShow: false,
        /* common end */

        /* comfirm start */
        yesOrNo: null,
        gConfirmShow: false,
        showConfirm: function(message) {
            question.appMessage = message; // set message
            question.gMaskShow = true;
            question.gConfirmShow = true;
        },
        hideConfirm: function() {
            question.yesOrNo = null;
            question.gMaskShow = false;
            question.gConfirmShow = false;
        },
        yesClick: function() {
            question.yesOrNo = true;
            question.hideConfirm();
        },
        noClick: function() {
            question.yesOrNo = false;
            question.hideConfirm();
        },
        /* confirm end */

        /* alert start */
        gAlertShow: false,
        hideDelayTimer: null,
        showAlert: function(message, hideDelay) {
            var hideDelayTimer = avalon.vmodels.question.hideDelayTimer;
            clearTimeout(hideDelayTimer);
            if (hideDelay >= 10) {
                avalon.illyWarning('is it too long in seconds when hide the mask?');
            }
            question.appMessage = message; // set message
            question.gMaskShow = true;
            question.gAlertShow = true;
            if (hideDelay !== void 0) {
                avalon.vmodels.question.hideDelayTimer = setTimeout(function() {
                    question.hideAlert();
                }, hideDelay * 1000);
            }
        },
        hideAlert: function() {
            question.gMaskShow = false;
            question.gAlertShow = false;
        },
        iKnowClick: function() {
            question.hideAlert();
        }
        /* alert end */
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {
            var renderedTime = Date.now();
            setTimeout(function() {
                avalon.illyInfo('avalon rendered totalTime: ' , renderedTime - avalon.initTime);
            }, 1111);
        };

        // 进入视图
        $ctrl.$onEnter = function() {

            // clear localCache
            avalon.clearLocalCache('illy-question-');

            // question.getUserInfo();
            question.getSchoolInfo();

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            // 貌似到不了这里，因为执行不到这里，或者关掉页面了（那就更执行不到了）
        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

