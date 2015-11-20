define([], function() {

    // get config, apiBaseUrl
    var apiBaseUrl = avalon.illyGlobal && avalon.illyGlobal.apiBaseUrl;

    // resourcePrefix
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;

    // defaultAvatarUrl
    var defaultAvatarUrl = resourcePrefix + 'images/avatar/children/default1.png?imageView2/1/w/200/h/200';

    // get config, token
    var token = avalon.illyGlobal.token; 

    avalon.filters.year = function(str) {
        return str.substring(0, 4);
    };

    avalon.filters.time = function(str) {
        return str.substring(5);
    };

    // 每页大小
    var localLimit = 5;
    var evaluation = avalon.define({ // 教师评价评语列表

        $id: "evaluation",
        noContent: false,
        noContentText: '还没有做过作业哦，<br/>快去完成作业，得到老师评价吧~',

        lists: [],
        visited: false,

        isRecover: false,
        isLoading: false, // 正在加载标记
        offset: 0, // inner var, to fetch data with offset and limit
        noMoreData: false, // no more data
        btnShowMore: false,
        fetchData: function(data, concat) {
            evaluation.isLoading = true;

            var limit = localLimit;
            var offset;
            offset = evaluation.lists.length || 0;

            if (evaluation.visited && !evaluation.isRecover) {
                evaluation.offset = localStorage.getItem('illy-homework-evaluation-index') || 0;
                limit = evaluation.offset;
                offset = 0;
                evaluation.isRecover = true;
            }

            $http.ajax({
                method: "",
                url: apiBaseUrl + "homework/comments?limit=" + limit + "&offset=" + offset,
                data: data,
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                dataType: "json",
                success: function(lists) {

                    if (concat === true) {
                        evaluation.lists = evaluation.lists.concat(lists);
                    } else {
                        evaluation.lists = lists;
                    }
                    setTimeout(function() {                          
                        var newLists = evaluation.lists;
                        if (newLists && newLists.length === 0) {
                            evaluation.noContent = true;
                        }      
                    }, 200);
                    if (lists.length === 0) {
                        evaluation.noMoreData = true;
                    }
                    localStorage.setItem('illy-homework-evaluation-index', evaluation.lists.length);
                    evaluation.isLoading = false;
                },
                error: function(res) {
                    avalon.illyError("evaluation list ajax error", res);
                    if (evaluation.lists.length <= 1) {
                        evaluation.noContent = true;
                    }
                    evaluation.isLoading = false;
                },
                ajaxFail: function(res) {
                    avalon.illyError("evaluation list ajax failed" + res);
                    if (evaluation.lists.length <= 1) {
                        evaluation.noContent = true;
                    }
                    evaluation.isLoading = false;
                }
            });
        }, // end of fetchData
        showMore: function(e) {
            e.preventDefault();
            evaluation.fetchData({}, true); //is concat 
        },

    }); // end of define

    evaluation.lists.$watch('length', function(newLength) { // mark for avalon1.5+ change this way
        if (newLength && (newLength < localLimit)) {
            evaluation.btnShowMore = false;
        } else {
            evaluation.btnShowMore = true;
        }
    });

    return avalon.controller(function($ctrl) {
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            evaluation.isRecover = false;
        };
        // 进入视图
        $ctrl.$onEnter = function() {
            setTimeout(function() {
                evaluation.avatar = (resourcePrefix + avalon.vmodels.app.avatar + "?imageView2/1/w/200/h/200") || defaultAvatarUrl;
                evaluation.displayName = avalon.vmodels.app.displayName;
            }, 300);

            evaluation.visited = avalon.vmodels.root.currentIsVisited; 
            // otherwise, show it
            evaluation.fetchData();

        };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });
});

