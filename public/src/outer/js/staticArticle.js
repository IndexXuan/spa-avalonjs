define(["http://res.wx.qq.com/open/js/jweixin-1.0.0.js",  '../../assets/scripts/lib/http/http.js?v=1103'], function(wx) {

    // global config 
    var apiBaseUrl = '// @@apiBaseUrl @@ //';

    var resourcePrefix = 'http://7rfll3.com1.z0.glb.clouddn.com/';

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
            title: article.title, // 分享标题
            link: '', // 分享链接
            imgUrl: document.getElementsByTagName('img')[0].src, // 分享图标
            success: function () { 
                // 不管成功与否，前台界面至少先更新
                article.shareCount++;
                article.isShared = true;
                article.updateShare();
            },
            cancel: function () { 
                alert('差一点就分享成功了!');
            }
        });

        var appMessageDesc = '发现这篇文章: <<' + article.title + '>>很赞, 你也瞧瞧~';
        //alert(appMessageDesc);
        // wx share to friend
        wx.onMenuShareAppMessage({
            title: article.title, // 分享标题
            link: '', // 分享链接
            desc: appMessageDesc,
            imgUrl: document.getElementsByTagName('img')[0].src, // 分享图标
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

    var article = avalon.define({
        
        $id: "article",
        dataDone: false,
        resourcePrefix: '../../assets/images',
        articleId: location.href.split('?')[1].split('&')[0].split('=')[1], // mark!
        title: "",
        image: '',
        content: "",
        created: "2015-07-09",
        shareCount: 88,
        visitCount: 88,
        likeCount: 88,

        report: function() {
            alert("感谢您的反馈，我们会妥善处理!");
        },

        isShared: false,
        updateShare: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'public/posts/' + article.articleId + '/share',
                success: function() {

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
                success: function() {
                    var likeCount = article.likeCount || 0;
                    article.likeCount = ++likeCount;
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
            article.updateLike();
            // ui
            article.hasLiked = true;
        },

        fetchData: function() {
            $http.ajax({
                url: apiBaseUrl + "public/posts/" + article.articleId,
                success: function(json) {
                    article.title = json.title;
                    article.content = json.content;
                    article.created = json.created;
                    article.image = resourcePrefix + json.image;
                    article.shareCount = json.shareCount;
                    article.visitCount = json.visitCount;
                    article.likeCount = json.like || 0;

                    // 数据加载完毕,留下一定渲染时间，然后准备好显示页面
                    article.dataDone = true;
                }
            });
        } // fetch data end

    }); // end of define

    article.$watch('dataDone', function(done) {
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
            article.fetchData();
            document.querySelector('.detail').style.display = 'none';
        }
    };

});

