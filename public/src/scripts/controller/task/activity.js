define([], function() {

    /** 
     *  活动控制器，仅供内部用户做任务使用，先不要想对外部用户的兼容，就是做任务，
     *  点赞分享也是针对内容本身（文章？活动？），唯一需要注意的是分享的时候替换
     *  链接，到一个极简页面（staticActivity.html?id=activityId, 这个页面同样需要监听用户分享，点赞，但本处不关注！）
     *
     *  taskId用于local,　获取内容，完成任务api（初期只是分享方式)
     *  activityId是后期获取的，用于点赞，替换url(最重要的),
     */  

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    var jinbiResourcePrefix = avalon.vmodels.task.illy_domain + "/assets/images";

    // 获取全局wx-sdk接口
    var wx = avalon.wx;

    // prefix of localStorage
    var cachedPrefix = 'illy-task-activity-';

    // inner function 
    // copy the array and return
    var copyArr = function copyArr(arr) {
        var brr = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            brr[i] = arr[i];
        }
        return brr;
    };

    // inner function 
    // arr = ['name', 'age'];
    // ==>
    // arr = [ {key: 'name', value: 'xxx'}, {key: 'age', value: 'xxx'} ]; 
    var dataAdapter = function dataAdapter(source) {
        var arr = copyArr(source);
        for (var i = 2, len = arr.length; i < len; i++) {
            arr[i] = {
                key: activity.copyinfoCollect[i],
                value: arr[i]
            };
        }
        // remove first two
        arr.shift();
        arr.shift();
        var infoJSON = arr;
        return {
            name: source[0],
            phone: source[1],
            others: infoJSON
        };
    };

    function resetScroll() {
        document.documentElement.srcollTop = 0;
        document.body.scrollTop = 0;
    }

    var activity = avalon.define({
        $id: "activity",
        visited: false,
        //hasData: false,
        taskId: 1,

        theme: '',

        isDone: false,
        isCancel: false,
        isFilling: false,

        activityId: 1,
        scoreAward: 10,
        address: '',
        content: "",
        startTime: '',
        endTime: '',
        deadline: '',

        shareCount: 88,
        visitCount: 88,
        likeCount: 0,

        infoCollect: [],
        copyinfoCollect: [],

        isShared: false, // true, false, 'isShared' default:false
        updateShare: function() { // mean done the task!!!
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'tasks/' + activity.taskId + '/done',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function(res) {
                    avalon.vmodels.task.score = res.score;
                },
                error: function(res) {
                    console.log(res);
                },
                ajaxFail: function(res) {
                    console.log(res);
                }
            });
        },

        hasLiked: false,
        updateLike: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'public/activities/' + activity.activityId + '/like',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function() {
                    var likeCount = activity.likeCount || 0;
                    activity.likeCount = ++likeCount;
                },
                error: function(res) {
                    console.log(res);
                },
                ajaxFail: function(res) {
                    console.log(res);
                }
            });
        },
        like: function() {
            // http 
            activity.updateLike();
            // local
            avalon.setLocalCache(cachedPrefix + activity.taskId + '-like', 'hasLiked');
            // ui
            activity.hasLiked = true;
        },

        scrollTop: 0, // remember the scrollTop position
        shareMaskShow: true,
        showShareMask: function() {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            activity.scrollTop = scrollTop; // remember the scrollTop position

            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            var mask = document.querySelector('.shareMask');
            setTimeout(function() {
                mask && (mask.style.display = 'block'); /* jshint ignore:line */
                mask && mask.classList.add('a-bounceinB'); /* jshint ignore:line */
            }, 16);
        },
        hideShareMask: function() {
            document.body.scrollTop = activity.scrollTop;
            document.documentElement.scrollTop = activity.scrollTop;

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

        filling: function() {
            activity.isFilling = true;
        },
        cancel: function() {
            activity.isCancel = true;
            activity.isFilling = false;
        },
        pushInfo: function() {
            var validPhone = function invalidPhone(phone) {
                return /^\d{3,}$/.test(phone); // mark!!! 
            };

            var valid = activity.infoCollect[0] !== '' && validPhone(activity.infoCollect[1]);
            if (!valid) {
                // alert('请填写信息完整，格式正确的报名信息，谢谢!');
                avalon.vmodels.task.showAlert('请填写完整, 格式无误的信息', 2);
                return;
            }

            $http.ajax({
                method: 'POST',
                url: apiBaseUrl + 'public/activities/' + activity.activityId + '/info',
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                data: dataAdapter(activity.infoCollect), // array([key1, key2]) to a array({key1: value1}, {key2, value2})
                success: function(res) { /* jshint ignore:line */
                    activity.isDone = true;
                    activity.isFilling = false;
                    // 缓存报名信息
                    avalon.setLocalCache(cachedPrefix + activity.taskId + '-isSignUp', 'signUp');
                },
                error: function(res) {
                    console.log(res);
                    //activity.infoCollect = act
                },
                ajaxFail: function(res) {
                    console.log(res);
                }
            });
        },

        fetchData: function() {
            if (activity.visited) {
                var localCache = avalon.getLocalCache(cachedPrefix + activity.taskId);
                activity.activityId = localCache._id;
                activity.theme = localCache.theme;
                activity.address = localCache.address;
                activity.content = localCache.content;
                activity.startTime = localCache.startTime;
                activity.endTime = localCache.endTime;
                activity.deadline = localCache.deadline;
                activity.shareCount = localCache.shareCount;
                activity.visitCount = localCache.visitCount;
                activity.likeCount = localCache.like || 0;
                activity.infoCollect = localCache.infoCollect;
                for (var i = 0, len = activity.infoCollect.length; i < len; i++) {
                    activity.infoCollect[i] = '';
                }
                activity.copyinfoCollect = localCache.infoCollect;

                return; // core!!! key!!! forget this will getCache and request!!!
            }
            $http.ajax({ // 获取任务详情
                url: apiBaseUrl + "tasks/" + activity.taskId,
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    //activity.hasData = true;
                    activity.activityId = json._id;
                    activity.theme = json.theme;
                    activity.address = json.address;
                    activity.content = json.content;
                    activity.startTime = json.startTime;
                    activity.endTime = json.endTime;
                    activity.deadline = json.deadline;
                    activity.shareCount = json.shareCount;
                    activity.visitCount = json.visitCount;
                    activity.likeCount = json.like || 0;
                    json.infoCollect.unshift('姓名', '电话'); // array
                    activity.infoCollect = json.infoCollect;
                    for (var i = 0, len = activity.infoCollect.length; i < len; i++) {
                        activity.infoCollect[i] = '';
                    }
                    activity.copyinfoCollect = json.infoCollect;
                    activity.theme = json.theme;
                    avalon.setLocalCache(cachedPrefix + activity.taskId, json);

                    var imgUrl = document.querySelector('.content').querySelectorAll('img')[0];
                    wx.onMenuShareTimeline({
                        title: activity.theme, // 分享标题
                        link: avalon.vmodels.task.illy_domain + '/outer/staticActivity.html?id=' + activity.activityId, // 分享链接 
                        imgUrl: imgUrl && imgUrl.src || avalon.vmodels.task.illy_domain + '/assets/images/kd2.png', // 分享图标
                        success: function() {
                            // 不管成功与否，前台界面至少先更新
                            activity.hideShareMask();
                            activity.shareCount++;
                            if (activity.isShared === false) {
                                activity.isShared = true;
                                resetScroll();
                                activity.updateShare();
                                setTimeout(function() { // auto click when time enough
                                    $('.item1 > div.kodai').click();
                                }, 1500);
                            }
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                            if (!activity.isShared) {
                                // alert('差一点就分享成功了, 拿积分兑大奖了!');
                                avalon.vmodels.task.showAlert('差一点就分享成功了, 拿积分兑大奖了!', 3); // hideDelay
                            }
                        }
                    });

                    var appMessageDesc = '发现' + avalon.vmodels.task.schoolName + '的这篇<<' + activity.theme+ '>>很赞, 你也瞧瞧~';
                    //alert(appMessageDesc);
                    // wx share to friend
                    wx.onMenuShareAppMessage({
                        title: activity.theme, // 分享标题
                        desc: appMessageDesc,
                        link: avalon.vmodels.task.illy_domain + '/outer/staticActivity.html?id=' + activity.activityId, // 分享链接 
                        imgUrl: imgUrl && imgUrl.src || avalon.vmodels.task.illy_domain + '/assets/images/kd2.png', // 分享图标
                        success: function() {
                            avalon.vmodels.task.showAlert('分享成功! 朋友将会收到您的分享~', 3); // hideDelay
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                            if (!activity.isShared) {
                                // alert('差一点就分享成功了, 拿积分兑大奖了!');
                                avalon.vmodels.task.showAlert('差一点就分享成功了!', 3); // hideDelay
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

            // 读取报名缓存
            var signUp = avalon.getLocalCache(cachedPrefix + activity.taskId + '-isSignUp');
            if (signUp === 'signUp') {
                activity.isDone = true;
                activity.isFilling = false;
            }

        };
        // 进入视图
        $ctrl.$onEnter = function(params) {

            setTimeout(function() {
                avalon.$('#footer').style.display = 'none';
            }, 300);

            activity.taskId = params.taskId;
            activity.scoreAward = params.scoreAward; // get activity score award
            activity.visited = avalon.vmodels.root.currentIsVisited;
            activity.isShared = false; // overwrite it
            activity.fetchData();

            var isLiked = avalon.getLocalCache(cachedPrefix + activity.taskId+ '-like');
            if (isLiked === 'hasLiked') {
                activity.hasLiked = true;
                ++activity.likeCount; // 既然已经点过赞，那么就不用缓存的原始数据，而要加1
            } else {
                activity.hasLiked = false;
            }

            activity.isFilling = false; // hide form

            activity.$watch("isShared", function(newVal) {

                if (newVal) {
                    (genClips = function () { /* jshint:ignore:line */
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

                        setTimeout(function() {
                            alert("任务完成，恭喜获得" + activity.scoreAward + "积分！快去兑大奖吧~");
                        }, 3000);
                        setTimeout(function() {
                            activity.isShared = 'isShared'; // key! mark!
                        }, 4000); // disappeared after 1 second


                        if (clicked === false) {
                            $('.full').css({
                                'display': 'none'
                            });
                            $('.empty').css({
                                'display': 'block'
                            });

                            clicked = true;

                            setTimeout(function() {
                                alert("任务完成，恭喜获得" + activity.scoreAward + "积分！快去兑大奖吧~");
                            }, 3000);
                            setTimeout(function() {
                                activity.isShared = 'isShared'; // key! mark!
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
            setTimeout(function() {
                avalon.$('#footer').style.display = '';
            }, 300);
        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

