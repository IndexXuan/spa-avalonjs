define([], function() {
 
    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    // cache the view data
    var needCache = true;

    var index = avalon.define({
        $id: "index",
        sliders: [], // auto-nature-cached key!!!
        hots: [], // auto-nature-cached key!!!
        categories: [], // auto-nature-cached key!!!
        visited: false, // first in, no cache
        fetchRemoteData: function(apiArgs, data, target) {
            if (index.visited && needCache) { 
                return; 
            }

            $http.ajax({
                url: apiBaseUrl + apiArgs + '',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                data: data,
                success: function(res) {
                    index[target] = res;
                },
                error: function(res) {
                    avalon.illyError('ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('ajax failed', res);
                }
            });

        }, // end of fetchRemoteData
        renderSlider: function() {
            setTimeout(function() {
                $('#slider').slider({
                    loop: true,
                    ready: function() {
                        //avalon.log('gmu sliders ready in Time: ' + Date.now());
                        setTimeout(function() {
                            avalon.$('#slider').style.visibility = 'visible';
                        }, 16); // 1 frame
                    },
                    'done.dom': function() {

                    }
                });
            }, 32);
        }
    });

    return avalon.controller(function($ctrl) {
        // 进入视图
        $ctrl.$onEnter = function() {

            index.visited = avalon.vmodels.root.currentIsVisited;
            index.fetchRemoteData('posts/slider', {}, 'sliders');
            index.fetchRemoteData('posts/hot?limit=3', {}, 'hots'); // three articles
            index.fetchRemoteData('categories/posts', {}, 'categories');
            
       };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

