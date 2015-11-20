define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    // defaultAvatarUrl
    var defaultAvatarUrl = avalon.illyGlobal.resourceBaseUrl + 'images/avatar/children/default1.png?imageView2/1/w/200/h/200';

    // site ctrl take charge of everything...
    var site = avalon.define({ 
        $id: "site",
        $skipArray: ["illly_domain", "illy_images_base"],
        illy_domain: avalon.illyGlobal.illyDomain,
        illy_images_base: avalon.illyGlobal.imagesBaseSrc,
        illy_resource_base: avalon.illyGlobal.resourceBaseUrl,
        categoriesNames: [], // cached auto nature
        categoryId: '',  // for list.html ui-state-active use
        navBarMaskShow: true, // navbar's mask, for loading
        report: function() {
            avalon.vmodels.site.showAlert('感谢反馈， 我们会妥善处理!', 3); 
        },
        fetchAllCategoriesNames: function() {
            $http.ajax({
                url: apiBaseUrl + 'categories',
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                success: function(res) {
                    res.unshift({_id: 'hots', 'name': '热门文章'});
                    site.categoriesNames = res; // cached auto nature
                },
                error: function(res) {
                    avalon.illyError('site fetchAllCategoriesNames ajax error!', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('site fetchAllCategoriesNames ajax failed!', res);
                }
            });
        },
        renderNavigator: function() { // only invoke once
            setTimeout(function() {
                // 0. init
                $('#nav').navigator();
                // 1 add fixed
                $('.left-fixed').addClass('fixed-navigator');
                $('#nav li').removeClass('ui-state-active');
            }, 32); // enough time for strong
        },
        //displayName: '',
        //avatar: defaultAvatarUrl,
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
                    site.avatar = json.avatar !== void 0 ? json.avatar : defaultAvatarUrl;
                    site.displayName = json.displayName;
                    site.score = json.score;
                }
            });
        },
        getSchoolInfo: function() {
            $http.ajax({
                url: apiBaseUrl + "school",
                headers: {
                    Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    site.schoolName = json.school;
                    avalon.vmodels.root.footerInfo = json.school + ' © ' + new Date().getFullYear();
                    site.studentCount = json.studentCount || 100;
                }
            });
        },

        /* common start */
        appMessage: 'I am message from app ctrl',
        gMaskShow: false,
        /* common end */

        /* alert start */
        gAlertShow: false,
        hideDelayTimer: null,
        showAlert: function(message, hideDelay) {
            var hideDelayTimer = avalon.vmodels.site.hideDelayTimer;
            clearTimeout(hideDelayTimer);
            if (hideDelay >= 10) {
                avalon.illyWarning('is it too long in seconds when hide the mask?');
            }
            site.appMessage = message; // set message
            site.gMaskShow = true;
            site.gAlertShow = true;
            if (hideDelay !== void 0) {
                avalon.vmodels.site.hideDelayTimer = setTimeout(function() {
                    site.hideAlert();
                }, hideDelay * 1000);
            }
        },
        hideAlert: function() {
            site.gMaskShow = false;
            site.gAlertShow = false;
        },
        iKnowClick: function() {
            site.hideAlert();
        }
        /* alert end */
    });

    // disabled the navigator
    var flag = true;
    var root = avalon.vmodels.root;
    avalon.vmodels.root.$watch('currentDataDone', function(rendered) {
        var state = root.currentState;
        if (state === 'list') {

            // 由于目前的机制，必须在第一次强行show一下，但是依然不能抵挡第一次过快切换栏目.
            // 后面即使再快切换，也可防御住，就是第一下... 201510261618重构
            if (flag) {
                avalon.vmodels.site.navBarMaskShow = true;
                flag = false;
            }

            if (rendered === false) {
                site.navBarMaskShow = true;
                setTimeout(function() {
                    site.navBarMaskShow = false;
                }, 10000); // 10s will hide, max time
            } else {
                setTimeout(function() {
                    site.navBarMaskShow = false;
                }, 96);
            }
        } else {
            site.navBarMaskShow = false;
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

        // 仅执行一次，抓取所有栏目名，供以后使用
        site.fetchAllCategoriesNames();

        // 进入视图
        var navigatorInitDelay = 80;
        $ctrl.$onEnter = function() {

            // clear old local cache
            avalon.clearLocalCache('illy-microsite-');

            // add listener for index view's navigator
            avalon.vmodels.root.$watch("currentState", function(newVal, oldVal) { /* jshint ignore:line */ 
                if (newVal === 'index') {
                    setTimeout(function() {
                        $('#nav li').removeClass('ui-state-active');
                    }, navigatorInitDelay + 100 );
                }

                if (newVal === 'detail') {
                    avalon.$('.left-fixed').style.display = 'none';
                } else {
                    avalon.$('.left-fixed').style.display = 'block';
                }
            });

            // site.getUserInfo();
            site.getSchoolInfo();

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            // 貌似到不了这里，因为执行不到这里，或者关掉页面了（那就更执行不到了）
        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

