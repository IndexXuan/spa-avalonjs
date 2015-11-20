define(["http://res.wx.qq.com/open/js/jweixin-1.0.0.js",  '../../assets/scripts/lib/http/http.js?v=1103'], function(wx) {

    // global config 
    var apiBaseUrl = '// @@apiBaseUrl @@ //';
    
    /* wxsdk start */
    var uri = location.href.split("#")[0];
    var url = encodeURIComponent(uri);

    $http.ajax({
        method: "",
        url: apiBaseUrl + 'public/sdk/signature',
        data: {
            url: url
        },
        success: function(jsonobj) {
            var appId = jsonobj.appid;
            var timestamp = jsonobj.timestamp;
            var nonceStr = jsonobj.nonceStr;
            var signature = jsonobj.signature;
            // config the wx-sdk
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: appId, // 必填，公众号的唯一标识
                timestamp: timestamp, // 必填，生成签名的时间戳
                nonceStr: nonceStr, // 必填，生成签名的随机串
                signature: signature, // 必填，签名，见附录1
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'hideMenuItems',
                    'showMenuItems',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'translateVoice',
                    'startRecord',
                    'stopRecord',
                    'onRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        },
        error: function(res) {
            console.log("wx ajax error" + res);
        },
        ajaxFail: function(res) {
            console.log("wx ajaxFail" + res);
        }
    });

    wx.ready(function() {
        // do all thing here, except user trigger functions(can put in outside)

        wx.onMenuShareTimeline({
            title: activity.theme, // 分享标题
            link: '', // 分享链接 
            imgUrl: document.querySelector('.content').querySelectorAll('img')[0].src, // 分享图标
            success: function() {
                // 不管成功与否，前台界面至少先更新
                activity.shareCount++;
                activity.isShared = true;
                activity.updateShare();
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
                alert('差一点就分享成功了!');
            }
        });

        var appMessageDesc = '发现这篇文章: <<' + activity.theme+ '>>很赞, 你也瞧瞧~';
        // wx share to friend
        wx.onMenuShareAppMessage({
            title: activity.theme, // 分享标题
            desc: appMessageDesc,
            link: '',
            imgUrl: document.querySelector('.content').querySelectorAll('img')[0].src, // 分享图标
            success: function() {
                alert('分享成功! 朋友将会收到您的分享~');
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
                alert('差一点就分享成功了!');
            }
        });

    });

    wx.error(function(res) {
        alert("Woops, error comes when WeChat-sdk signature..." + res);
    });

    /* wxsdk end */

    var $ = function(selector) {
        return document.querySelector(selector);
    };

    avalon.$ = $;

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
                key: activity.CopyinfoCollect[i],
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

    var activity = avalon.define({
        $id: "activity",
        dataDone: false,

        resourcePrefix: '../../assets/images',

        theme: '',

        isDone: false,
        isCancel: false,
        isFilling: false,

        activityId: location.href.split('?')[1].split('&')[0].split('=')[1],
        address: '',
        content: "",
        startTime: '',
        endTime: '',
        deadline: '',

        shareCount: 88,
        visitCount: 88,
        likeCount: 0,

        infoCollect: [],
        CopyinfoCollect: [],

        report: function() {
            alert("感谢您的反馈，我们会妥善处理!");
        },

        isShared: false,
        updateShare: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'public/activities/' + activity.activityId + '/share',
                success: function(res) {
                    // alert(res + 'shared');
                },
                error: function(res) {
                    console.log(res);
                },
                ajaxFail: function(res) {
                    console.log(res);
                }
            });
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

        hasLiked: false,
        updateLike: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'public/activities/' + activity.activityId + '/like',
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
            // ui
            activity.hasLiked = true;
        },

        filling: function() {
            activity.isFilling = true;
            var scrollTop = document.body.clientHeight;
            setTimeout(function() {
                document.body.scrollTop = parseInt(scrollTop, 10) + 150 + 'px';
                document.documentElement.scrollTop = parseInt(scrollTop, 10) + 150 + 'px';
            }, 100);
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
                alert('请填写信息完整，格式正确的报名信息，谢谢!');
                return;
            }

            $http.ajax({
                method: 'POST',
                url: apiBaseUrl + 'public/activities/' + activity.activityId + '/info',
                data: dataAdapter(activity.infoCollect), // array([key1, key2]) to a array({key1: value1}, {key2, value2})
                success: function(res) { /* jshint ignore:line */
                    activity.isDone = true;
                    activity.isFilling = false;
                },
                error: function(res) {
                    console.log(res);
                },
                ajaxFail: function(res) {
                    console.log(res);
                }
            });
        },
        fetchData: function() {
            $http.ajax({ // 获取活动详情
                url: apiBaseUrl + "public/activities/" + activity.activityId,
                dataType: "json",
                success: function(json) {
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
                    activity.CopyinfoCollect = json.infoCollect;
                    activity.theme = json.theme;

                    // 数据加载完毕,留下一定渲染时间，然后准备好显示页面
                    activity.dataDone = true;
                }
            });
        } // end of fetch data

    }); // end of define

    activity.$watch('dataDone', function(done) {
        if (done) {
            setTimeout(function() {
                document.querySelector('.loading-text').style.display = 'none';
                document.querySelector('.detail').style.display = 'block';
            }, 123);
        }
    });

    return {
        init: function() {
            avalon.scan();
            activity.fetchData();
            document.querySelector('.detail').style.display = 'none';
        }
    };

});

