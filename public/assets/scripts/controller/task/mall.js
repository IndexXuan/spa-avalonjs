define([], function() {

    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

	var wx = avalon.wx;
    
    //var cachedPrefix = 'illy-task-mall-';
	var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;

    var limit = 6; // 一次抓取多少数据
    var mall = avalon.define({
        $id: "mall",
        visited: false, // first in, no data
        lists: [], 
        rules: '', // 兑换规则
        offset: 0, // inner var, to fetch data with offset and limit
        btnShowMore: true,
        /**
         * fetchRemoteData
         * only ctrl function to fetch data with api
         *
         * @param apiArgs api里需要的参数
         * @param data ajax请求查询参数
         * @param target success得到的数据赋值目标变量名
         * @param type 数据赋值是直接赋值还是追加方式
         *
         */
        fetchRemoteData: function(apiArgs, data, target, type) {
            $http.ajax({
                url: apiBaseUrl + apiArgs,
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                data: data,
                success: function(res) {
                    type === 'concat' ? mall[target] = mall[target].concat(res) : mall[target] = res; /* jshint ignore:line */
                },
                error: function(res) {
                    avalon.log('mall ajax error when fetch data' + res);
                },
                ajaxFail: function(res) {
                    avalon.log('mall ajax failed when fetch data' + res);
                }
            });
        },
        showMore: function(e) {
            e.preventDefault();
            var page = 2;
            if (mall.offset < limit) {
                mall.btnShowMore = false;
                return;
            } else {
                mall.offset = mall.offset + limit * (page - 1);
            }

            mall.fetchRemoteData('score/mall', {offset: mall.offset}, 'lists', 'concat');
        },
		rendered: function() {
			var imgSrcLists = [],
                currentImgSrc;
            var imageView2 = '?imageView2/2/w/400/h/400';
			for (var i = 0, len = mall.lists.length; i < len; i++) {
				imgSrcLists.push(resourcePrefix + mall.lists[i].imageKey + imageView2);
			}
			$('.img-wrapper').on('click', 'img', function() {
			    currentImgSrc = $(this)[0].src.split("?")[0] + imageView2;
				wx.previewImage({
					current: currentImgSrc, // 当前显示图片的http链接
					urls: imgSrcLists // 需要预览的图片http链接列表
				});	
			});
		}
    });

    return avalon.controller(function($ctrl) {
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function(params) { /* jshint ignore:line */
            mall.visited = avalon.vmodels.root.currentIsVisited;
            // otherwise, show it
            mall.offset <= limit ? mall.btnShowMore = false : mall.btnShowMore = true; /* jshint ignore:line */
            mall.fetchRemoteData('score/mall', {}, 'lists');

            mall.fetchRemoteData('score/exchangeInstruction', {}, 'rules');

			setTimeout(function() {
			}, 1000);

        };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });
});

