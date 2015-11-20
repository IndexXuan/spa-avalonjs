define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;
    if (token === null) {
        avalon.illyGlobal.noTokenHandler();
    }
    
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;
    
    var rank = avalon.define({
        $id: "rank",
        ranks: [],
        myScore: 0,
        myRank: 0,
        displayName: '',
        avatar: ''
    });

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function(params) { /* jshint ignore:line */
            $http.ajax({
                url: apiBaseUrl + 'score/rank/me',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function(res) {
                    rank.displayName = res.displayName;
                    if (res.avatar) {
                        rank.avatar = resourcePrefix + res.avatar;
                    } else {
                        rank.avatar = resourcePrefix + 'images/avatar/children/default1.png';
                    }
                    rank.myRank = res.rank;
                    rank.myScore = res.score;
                },
                error: function(res) {
                    avalon.illyError('my rank info ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('my rank info ajax failed', res);
                }
            });
            $http.ajax({
                url: apiBaseUrl + 'score/rank/topTen',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function(res) {
                    rank.ranks = res;
                },
                error: function(res) {
                    avalon.illyError('topTen rank info ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('topTen rank info ajax failed', res);
                }
            });
        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

