define([], function() {

    // global config, apiBaseUrl
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;

    // token
    var token = avalon.illyGlobal.token;
    
    // resourcePrefix
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;

    // defaultAvatarUrl
    var defaultAvatarUrl = resourcePrefix + 'images/avatar/children/default1.png?imageView2/1/w/200/h/200';

    // task ctrl take charge of everything...
    var task = avalon.define({
        $id: "task",
        $skipArray: ["illly_domain", "illy_images_base"],
        illy_domain: avalon.illyGlobal.illyDomain,
        illy_images_base: avalon.illyGlobal.imagesBaseSrc,
        illy_resource_base: avalon.illyGlobal.resourceBaseUrl,

        /* common start */
        appMessage: 'I am message from app ctrl',
        gMaskShow: false,
        /* common end */

        /* alert start */
        gAlertShow: false,
        hideDelayTimer: null,
        showAlert: function(message, hideDelay) {
            var hideDelayTimer = avalon.vmodels.task.hideDelayTimer;
            clearTimeout(hideDelayTimer);
            if (hideDelay >= 10) {
                avalon.illyWarning('is it too long in seconds when hide the mask?');
            }
            task.appMessage = message; // set message
            task.gMaskShow = true;
            task.gAlertShow = true;
            if (hideDelay !== void 0) {
                avalon.vmodels.task.hideDelayTimer = setTimeout(function() {
                    task.hideAlert();
                }, hideDelay * 1000);
            }
        },
        hideAlert: function() {
            task.gMaskShow = false;
            task.gAlertShow = false;
        },
        iKnowClick: function() {
            task.hideAlert();
        },
        /* alert end */

        report: function() {
           avalon.vmodels.task.showAlert('感谢反馈， 我们会妥善处理!', 3); 
        },

        score: 88,
        schoolName: '',
        studentCount: 100,
        displayName: '',
        avatar: defaultAvatarUrl,
        getUserInfo: function() {
            $http.ajax({
                url: apiBaseUrl + "profile",
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    if (json.avatar !== void 0) {
                        task.avatar = resourcePrefix + json.avatar + '?imageView2/2/w/200/h/200';
                    } else {
                        task.avatar = defaultAvatarUrl;
                    }
                    task.displayName = json.displayName;
                    task.score = json.score;
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
                    task.schoolName = json.school;
                    avalon.vmodels.root.footerInfo = json.school + ' © ' + new Date().getFullYear();
                    task.studentCount = json.studentCount || 100;
                }
            });
        }
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
            avalon.clearLocalCache('illy-task');
            task.getUserInfo();
            task.getSchoolInfo();
        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });
    
});

