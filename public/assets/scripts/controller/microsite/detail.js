define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;

    var token = avalon.illyGlobal.token;

    // 获取全局wx-sdk接口
    var wx = avalon.wx;

    // prefix of localStorage
    var cachedPrefix = 'illy-microsite-detail-';

    // resource prefix
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;

    // cache the view data
    var needCache = true;
    
    var detail = avalon.define({
        $id: "detail",
        visited: false,
        articleId: 1,
        title: "",
        image: '',
        content: "",
        createdTime: "2015-07-03",

        shareCount: 88,
        visitCount: 88,
        likeCount: 0,

        isShared: false,
        updateShare: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'public/posts/' + detail.articleId + '/share',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function() {
                    
                },
                error: function(res) {
                    avalon.illyError('microsite updateShare ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('microsite updateShare ajax failed', res);
                }
            });
        },
        
        scrollTop: 0, // remember the scrollTop position
        showShareMask: function() {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            detail.scrollTop = scrollTop; // remember the scrollTop position

            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            var mask = document.querySelector('.shareMask');
            setTimeout(function() {
                mask && (mask.style.display = 'block'); /* jshint ignore:line */
                mask && mask.classList.add('a-bounceinB'); /* jshint ignore:line */
            }, 16);
        },
        hideShareMask: function() {
            document.body.scrollTop = detail.scrollTop;
            document.documentElement.scrollTop = detail.scrollTop;

            var mask = document.querySelector('.shareMask');
            mask && mask.classList.remove('a-bounceinB'); /* jshint ignore:line */
            setTimeout(function() {
                mask && mask.classList.add('a-bounceoutB'); /* jshint ignore:line */
            }, 16);
            setTimeout(function() {
                mask && (mask.style.display =  'none'); /* jshint ignore:line */
                mask && mask.classList.remove('a-bounceoutB'); /* jshint ignore:line */
            }, 500);
        },

        hasLiked: false,
        updateLike: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'public/posts/' + detail.articleId + '/like',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function() { 
                    var likeCount = detail.likeCount || 0;
                    detail.likeCount = ++likeCount;
                },
                error: function(res) {
                    avalon.illyError('microsite updateLike ajax error ', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('microsite updateLike ajax failed ' + res);
                }
            });
        },
        like: function() {
            // http 
            detail.updateLike();
            // local
            avalon.setLocalCache(cachedPrefix + detail.articleId + '-like', 'hasLiked');     
            // ui
            detail.hasLiked = true;
        },

        fetchData: function() {
            if (detail.visited && needCache) {
                var localCache = avalon.getLocalCache(cachedPrefix + detail.articleId);
                detail.title = localCache.title;
                detail.image = resourcePrefix + localCache.image + '?imageView2/2/w/400/h/400';
                detail.content = localCache.content;
                detail.createdTime = localCache.createdTime;
                detail.shareCount = localCache.shareCount;
                detail.visitCount = localCache.visitCount;
                detail.likeCount = localCache.like;
                return; // core!!! key!!! forget this will getCache and request which is the worst way!
            }
            $http.ajax({
                url: apiBaseUrl + "public/posts/" + detail.articleId,
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    detail.title = json.title;
                    detail.image = resourcePrefix + json.image + '?imageView2/2/w/400/h/400';
                    detail.content = json.content;
                    detail.createdTime = json.createdTime;
                    detail.shareCount = json.shareCount;
                    detail.visitCount = json.visitCount;
                    detail.likeCount = json.like;
                    avalon.setLocalCache(cachedPrefix + detail.articleId, json);

                    wx.onMenuShareTimeline({
                        title: detail.title, // 分享标题
                        link: avalon.vmodels.site.illy_domain + '/outer/staticArticle.html?id=' + detail.articleId, // 分享链接
                        imgUrl: document.querySelector('.cover-img > img').src || document.getElementsByTagName('img')[0].src, // 分享图标
                        success: function () { 
                            // 不管成功与否，前台界面至少先更新
                            detail.shareCount++;
                            detail.isShared = true;
                            detail.updateShare();
                            detail.hideShareMask();
                        },
                        cancel: function () { 
                            // 用户取消分享后执行的回调函数
                            if (!detail.isShared) {
                                avalon.vmodels.site.showAlert('差一点就分享成功了!', 3); // hideDelay
                            }
                        }
                    });
                    
                    var appMessageDesc = '发现' + avalon.vmodels.site.schoolName + '的这篇<<' + detail.title + '>>很赞, 你也瞧瞧~';
                    // alert(appMessageDesc);
                    // wx share to friend
                    wx.onMenuShareAppMessage({
                        title: detail.title, // 分享标题
                        link: avalon.vmodels.site.illy_domain + '/outer/staticArticle.html?id=' + detail.articleId, // 分享链接
                        desc: appMessageDesc,
                        imgUrl: document.querySelector('.cover-img > img').src || document.getElementsByTagName('img')[0].src, // 分享图标
                        success: function () { 
                            // 不管成功与否，前台界面至少先更新
                            avalon.vmodels.site.showAlert('分享成功!', 3); // hideDelay
                        },
                        cancel: function () { 
                            // 用户取消分享后执行的回调函数
                            if (!detail.isShared) {
                                avalon.vmodels.site.showAlert('差一点就分享成功了!', 3); // hideDelay
                            }
                        }
                    });

                }
            });
        } // end of fetch data

    }); // end of define

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

            //// test for good experience of big img re-render in detail page
            //if (!avalon.vmodels.root.currentIsVisited) {
            //    var bigImg = avalon.$('.cover-img > img');
            //    bigImg.style.visibility = 'hidden';
            //    setTimeout(function() {
            //        bigImg.style.visibility = 'visible';
            //    }, 100);
            //}
            
        };
        // 进入视图
        $ctrl.$onEnter = function(params) {

            detail.articleId = params.articleId;
            detail.visited = avalon.vmodels.root.currentIsVisited;
            detail.isShared = false; // overwrite it
            detail.fetchData();

            var isLiked = avalon.getLocalCache(cachedPrefix + detail.articleId + '-like');
            if (isLiked === 'hasLiked') {
                detail.hasLiked = true;
                ++detail.likeCount; // 既然已经点过赞，那么就不用缓存的原始数据，而要加1
            } else {
                detail.hasLiked = false;
            }

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {  

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

