define([], function() {
    
    // get config, apiBaseUrl
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    
    // get config, token
    var token = avalon.illyGlobal.token; 

    var localLimit = 6;

    var slidersUrlPrefix = './assets/images';

    var mistakeListSliders = [
        {
            image: slidersUrlPrefix + '/slider-task.png',
            title: 'task',
            href: './task.html'
        },
        {
            image: slidersUrlPrefix + '/slider-question.png',
            title: 'ask',
            href: './question.html'
        },
        {
            image: slidersUrlPrefix + '/slider-mistake.png',
            title: 'mistakeList',
            href: '#!/'
        }
    ];

    var mistakeList = avalon.define({

        $id: "mistakeList",
        isVisited: false,
        noMistakeListContent: false,
        noContentText: '恭喜你！小学霸。暂时没有错题集，咱们继续努力，再接再厉吧~',
        lists: [], // 作业数据
        sliders: mistakeListSliders, 
        renderSlider: function() {
            setTimeout(function() {
                $('.illy-container #slider').slider({
                    loop: true,
                    ready: function() {
                        setTimeout(function() {
                                avalon.$('.illy-container #slider').style.visibility = 'visible';
                        }, 16); // 1 frame
                    },
                    'done.dom': function() {

                    }
                });
            }, 332);
        },

        isRecover: false,
        isLoading: false, // 正在加载标记
        offset: 0, // inner var, to fetch data with offset and limit
        noMoreData: false, // no more data
        btnShowMore: false,
        fetchData: function(limit, offset, showMore) {
            mistakeList.isLoading = true; // 正在加载标记
            limit = limit || localLimit;
            offset = mistakeList.offset;
            if (mistakeList.isVisited && !mistakeList.isRecover) {
                offset = localStorage.getItem('illy-homework-mistakeList-offset');
                if (offset !== 0 && offset >= mistakeList.offset) { // has lots of data, fetch it
                    limit = offset;
                    offset = 0;
                    mistakeList.isRecover = true;
                }
            }
            // else, need data or data maybe change, fetch it
            $http.ajax({
                method: "",
                url: apiBaseUrl + "homework/mistake?limit=" + limit + '&offset=' + offset,
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                success: function(res) {
                    if (showMore === true && res.length <= localLimit) {
                        mistakeList.lists = mistakeList.lists.concat(res);
                    } else {
                        mistakeList.lists = res;
                    }
                    localStorage.setItem('illy-homework-mistakeList-offset', mistakeList.lists.length);
                    mistakeList.offset = mistakeList.lists.length;
                    // mistakeList.lists = res; //key ! fetch data
                    setTimeout(function() {                          
                        var newLists = mistakeList.lists;
                        if (newLists && newLists.length === 0) {
                            mistakeList.noMistakeListContent = true;
                        }      
                    }, 200);
                    if (res.length === 0) {
                        mistakeList.noMoreData = true;
                    }
                    mistakeList.isLoading = false;
                },
                error: function(res) {
                    avalon.illyError("mistakeList ajax error", res);
                    if (mistakeList.lists.length === 0) {
                        mistakeList.noMistakeListContent = true;
                    }
                    mistakeList.isLoading = false;
                },
                ajaxFail: function(res) {
                    avalon.illyError("mistakeList ajax failed", res);
                    if (mistakeList.lists.length === 0) {
                        mistakeList.noMistakeListContent = true;
                    }
                    mistakeList.isLoading = false;
                }
            });
        }, // end of fetchData
        showMore: function(e) {
            e.preventDefault();
            var offset = mistakeList.offset;
            mistakeList.fetchData(localLimit, offset, true); //is concat 
        },
        fetchDataForExercises: function(homeworkId) {
            $http.ajax({
                url: apiBaseUrl + 'homework/mistake/' + homeworkId,
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                success: function(res) {
                    var mistake = avalon.vmodels.mistake;
                    mistake.exercises = res;
                    avalon.router.go('app.mistake.wrong', {homeworkId: homeworkId, questionId: 1});
                },
                error: function(res) {
                    avalon.illyError('mistakeTemp ajax error', res);
                },
                ajaxFail: function(res) {
                    avalon.illyError('mistakeTemp ajax failed', res);
                }
            });
        },
        goWrong: function() { // 前往具体错误题目
            var homeworkId = arguments[0].getAttribute('data-homeworkid');
            mistakeList.fetchDataForExercises(homeworkId);
        }
    });

    mistakeList.lists.$watch('length', function(newLength) { // mark for avalon1.5+ change this way
        if (newLength && (newLength < localLimit)) {
            mistakeList.btnShowMore = false;
        } else {
            mistakeList.btnShowMore = true;
        }
    });

    return avalon.controller(function($ctrl) {
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            mistakeList.isRecover = false;
        };
        // 进入视图
        $ctrl.$onEnter = function() {
            // avalon.vmodels.app.sliders = mistakeListSliders;
            mistakeList.isVisited = avalon.vmodels.root.currentIsVisited;
            mistakeList.fetchData();
        };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });
});

