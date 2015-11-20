define([], function() {

    /** 
     *  任务分享文章控制器，仅供内部用户做任务使用，先不要想对外部用户的兼容，就是做任务，
     *  点赞分享也是针对内容本身（文章？活动？），唯一需要注意的是分享的时候替换
     *  链接，到一个极简页面（staticArticle.html?id=articleId, 这个页面同样需要监听用户分享，点赞，但本处不关注！）
     *
     *  taskId用于local,　获取内容，完成任务api（初期只是分享方式)
     *  articleId是后期获取的，用于点赞，替换url(最重要的),
     */  

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    var jinbiResourcePrefix = avalon.vmodels.task.illy_domain + "/assets/images";

    var resourcePrefix = 'http://resource.hizuoye.com/';

    // 获取全局wx-sdk接口
    var wx = avalon.wx;

    // prefix of localStorage
    var cachedPrefix = 'illy-task-article-';


    function resetScroll() {
        document.documentElement.srcollTop = 0;
        document.body.scrollTop = 0;
    }

    var article = avalon.define({
        $id: "article",
        taskId: 1,
        articleId: 1,
        scoreAward: 0,
        title: "",
        image: '', // cover-img
        content: "",
        createdTime: "2015-07-09",
        shareCount: 88,
        visitCount: 88,
        likeCount: 88,

        isShared: false,
        updateShare: function() { // mean done the task
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'tasks/' + article.taskId + '/done',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function(res) {
                    avalon.vmodels.task.score = res.score;
                },
                error: function(res) {
                    avalon.illyError('task done ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('task done ajax failed', res);
                }
            });
        },

        scrollTop: 0, // remember the scrollTop position
        shareMaskShow: true,
        showShareMask: function() {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            article.scrollTop = scrollTop; // remember the scrollTop position

            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            var mask = document.querySelector('.shareMask');
            setTimeout(function() {
                mask && (mask.style.display = 'block'); /* jshint ignore:line */
                mask && mask.classList.add('a-bounceinB'); /* jshint ignore:line */
            }, 16);
        },
        hideShareMask: function() {
            document.body.scrollTop = article.scrollTop;
            document.documentElement.scrollTop = article.scrollTop;

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
                url: apiBaseUrl + 'public/posts/' + article.articleId + '/like',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function() {
                    var likeCount = article.likeCount || 0;
                    article.likeCount = ++likeCount;
                },
                error: function(res) {
                    avalon.illyError('updateLike ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('updateLike ajax failed', res);
                }
            });
        },
        like: function() {
            // http 
            article.updateLike();
            // local
            avalon.setLocalCache(cachedPrefix + article.taskId+ '-like', 'hasLiked');
            // ui
            article.hasLiked = true;
        },

        fetchData: function() {
            if (article.visited) {
                var local = avalon.getLocalCache(cachedPrefix + article.taskId);
                article.articleId = local._id;
                article.title = local.title;
                article.image = resourcePrefix + local.image + '?imageview2/2/w/400/h/400';
                article.content = local.content;
                article.createdTime = local.createdTime;
                article.shareCount = local.shareCount;
                article.visitCount = local.visitCount;
                article.likeCount = local.like || 0;
                return; // core!!! key!!! forget this will getCache and request!!!
            }
            $http.ajax({
                url: apiBaseUrl + "tasks/" + article.taskId,
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    article.articleId = json._id;
                    article.title = json.title;
                    article.image = resourcePrefix + json.image + '?imageView2/2/w/400/h/400';
                    article.content = json.content;
                    article.createdTime = json.createdTime;
                    article.shareCount = json.shareCount;
                    article.visitCount = json.visitCount;
                    article.likeCount = json.like || 0;
                    avalon.setLocalCache(cachedPrefix + article.taskId, json);

                    wx.onMenuShareTimeline({
                        title: article.title, // 分享标题
                        link: avalon.vmodels.task.illy_domain + '/outer/staticArticle.html?id=' + article.articleId, // 分享链接
                        imgUrl: document.querySelector('.cover-img > img').src || document.getElementsByTagName('img')[0].src, // 分享图标
                        success: function () { 
                            // 不管成功与否，前台界面至少先更新
                            article.hideShareMask();
                            article.shareCount++;
                            if (article.isShared === false) {
                                article.isShared = true;
                                resetScroll();
                                article.updateShare();
                                setTimeout(function() {
                                    $('.item1 > div.kodai').click();
                                }, 1500);
                            }
                        },
                        cancel: function () { 
                            // 用户取消分享后执行的回调函数
                            if (!article.isShared) {
                                // alert('差一点就分享成功, 拿积分兑大奖了!');
                                avalon.vmodels.task.showAlert('差一点就分享成功了, 拿积分兑大奖了!', 3); // hideDelay
                            }
                        }
                    });

                    var appMessageDesc = '发现' + avalon.vmodels.task.schoolName + '的这篇<<' + article.title + '>>很赞, 你也瞧瞧~';
                    //alert(appMessageDesc);
                    // wx share to friend
                    wx.onMenuShareAppMessage({
                        title: article.title, // 分享标题
                        link: avalon.vmodels.task.illy_domain + '/outer/staticArticle.html?id=' + article.articleId, // 分享链接
                        desc: appMessageDesc,
                        imgUrl: document.querySelector('.cover-img > img').src || document.getElementsByTagName('img')[0].src, // 分享图标
                        success: function () { 
                            avalon.vmodels.task.showAlert('分享成功! 朋友将会收到您的分享~', 3); // hideDelay
                        },
                        cancel: function () { 
                            // 用户取消分享后执行的回调函数
                            if (!article.isShared) {
                                // alert('差一点就分享成功, 拿积分兑大奖了!');
                                avalon.vmodels.task.showAlert('差一点就分享成功了!', 3); // hideDelay
                            }
                        }
                    });

                }
            });
        } // fetch data end
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

            //avalon.$('.gotop').onclick = function() {
            //document.body.scrollTop = 0;
            //document.documentElement.scrollTop = 0;
            //};

            //setTimeout(function() {
            //var gotop = avalon.$('#gotop');
            //gotop && (gotop.style.display = 'block'); [> jshint ignore:line <]
            //}, 3000);

        };
        // 进入视图
        $ctrl.$onEnter = function(params) {

            article.taskId = params.taskId;
            article.scoreAward = params.scoreAward;
            article.visited = avalon.vmodels.root.currentIsVisited;
            article.isShared = false; // overwrite it
            article.fetchData();

            var isLiked = avalon.getLocalCache(cachedPrefix + article.taskId+ '-like');
            if (isLiked === 'hasLiked') {
                article.hasLiked = true;
                ++article.likeCount; // 既然已经点过赞，那么就不用缓存的原始数据，而要加1
            } else {
                article.hasLiked = false;
            }

            article.$watch("isShared", function(newVal) {

                if (newVal) {
                    (genClips = function () {
                        $t = $('.item1');
                        var amount = 5;
                        var width = $t.width() / amount;
                        var height = $t.height() / amount;
                        var totalSquares = Math.pow(amount, 2);
                        var y = 0;
                        var index = 1;
                        for (var z = 0; z <= (amount * width) ; z = z + width) {
                            $('<img class="clipped" src="' + jinbiResourcePrefix +'/jb' + index + '.png" />').appendTo($('.item1 .clipped-box'));
                            if (z === (amount * width) - width) {
                                y = y + height;
                                z = -width;
                            }
                            if (index >= 5) {
                                index = 1;
                            }
                            index++;
                            if (y === (amount * height)) {
                                z = 9999999;
                            }
                        }
                    })(); /* jshint ignore:line */
                    var rand = function rand(min, max) {
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    };
                    var first = false,
                        clicked = false;
                    // On click
                    $('.item1 div.kodai').on('click', function () {

                        if (clicked === false) {
                            $('.full').css({
                                'display': 'none'
                            });
                            $('.empty').css({
                                'display': 'block'
                            });
                            clicked = true;

                            setTimeout(function() {
                                alert("任务完成，恭喜获得" + article.scoreAward + "积分！快去兑大奖吧~");
                            }, 3000);
                            setTimeout(function() {
                                article.isShared = 'isShared'; // key! mark!
                            }, 4000); // disappeared after 1 second

                            $('.item1 .clipped-box').css({
                                'display': 'block'
                            });
                            // Apply to each clipped-box div.
                            $('.clipped-box img').each(function () {
                                var v = rand(120, 90),
                                    angle = rand(80, 89), 
                                    theta = (angle * Math.PI) / 180, 
                                    g = -9.8; 

                                // $(this) as self
                                var self = $(this);
                                var t = 0,
                                    z, r, nx, ny,
                                totalt =10;
                                var negate = [1, -1, 0],
                                    direction = negate[Math.floor(Math.random() * negate.length)];

                                var randDeg = rand(-5, 10),
                                    randScale = rand(0.9, 1.1),
                                    randDeg2 = rand(30, 5);

                                // And apply those
                                $(this).css({
                                    'transform': 'scale(' + randScale + ') skew(' + randDeg + 'deg) rotateZ(' + randDeg2 + 'deg)'
                                });

                                // Set an interval
                                z = setInterval(function () {
                                    var ux = (Math.cos(theta) * v) * direction;
                                    var uy = (Math.sin(theta) * v) - ((-g) * t);
                                    nx = (ux * t);
                                    ny = (uy * t) + (0.25 * (g) * Math.pow(t, 2));
                                    if (ny < -40) {
                                        ny = -40;
                                    }
                                    //$("#html").html("g:" + g + "bottom:" + ny + "left:" + nx + "direction:" + direction);
                                    $(self).css({
                                        'bottom': (ny) + 'px',
                                        'left': (nx) + 'px'
                                    });
                                    // Increase the time by 0.10
                                    t = t + 0.10;

                                    //跳出循环
                                    if (t > totalt) {
                                        clicked = false;
                                        first = true;
                                        clearInterval(z);
                                    }
                                }, 20);
                            });
                        }
                    });
                    r = setInterval(function () {
                        if (first === true) {
                            $('.empty').addClass("Shake");//晃动空袋子
                            //TODO:空袋子晃动几下 就弹出 奖项框
                            first = false;
                        }
                    }, 300);

                }

            });

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

