define([], function() {
    
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    // resourcePrefix
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;

    // defaultAvatarUrl
    var defaultAvatarUrl = resourcePrefix + 'images/avatar/children/default1.png?imageView2/1/w/200/h/200';

    // 每页大小
    var limit = 6;
    var taskList = avalon.define({ 

        $id: "taskList",
        noContent: false, // done all the task or nothing, show tip flag
        lists: [],
        avatar: '', // user avatar
        studentCount: '', // student count of user's school
        visited: false,
        offset: 0,
        btnShowMore: true,
        goRank: function() {
            avalon.router.go('task.rank');
        },
        goMe: function() {
            avalon.router.go('task.me');
        },
        fetchData: function(data, concat) { // should not cache

            $http.ajax({
                method: "",
                url: apiBaseUrl + "tasks",
                data: data,
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                success: function(lists) {
                    // mark!!! concat work?
                    concat ? taskList.lists.concat(lists) : taskList.lists = lists; /* jshint ignore:line */
                    setTimeout(function() {
                        var newLists = taskList.lists;
                        if (newLists !== void 0 && newLists.length === 0) {
                            taskList.noContent = true;
                        }
                    }, 500); // wait for .5s
                },
                error: function(res) {
                    if (taskList.lists.length === 0) {
                        taskList.noContent = true;
                    }
                    avalon.illyError('ajax error', res);
                },
                ajaxFail: function(res) {
                    if (taskList.lists.length === 0) {
                        taskList.noContent = true;
                    }
                    avalon.illyError('ajax failed', res);
                }
            });

        }, // end of fetchData
        showMore: function(e) {
            e.preventDefault();
            var page = 2;
            if (taskList.offset < limit) {
                taskList.btnShowMore = false;
                return;
            } else {
                taskList.offset = taskList.offset + limit * (page - 1);
            }

            taskList.fetchRemoteData({offset: taskList.offset}, 'concat');
        },
        taskTypeMap: { // for future extension
            0: 'article',
            1: 'activity'
        },
        goSpecTask: function() {
            // get info from target you click and then do dispatch
            var target = arguments[0];
            var taskType = target && target.getAttribute('data-tasktype');
            var taskId = target && target.getAttribute('data-taskid');
            var taskScoreAward = target && target.getAttribute('data-taskscoreaward');
            var state = 'task.detail.' + taskList.taskTypeMap[taskType];
            setTimeout(function() { // TODO: rm it, hack for ios9 
                avalon.router.go(state, {taskId: taskId, scoreAward: taskScoreAward});
            }, 16);
        }

    });

    return avalon.controller(function($ctrl) {
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function() {

            avalon.vmodels.task.$watch('score', function(newVal) {
                if (newVal !== void 0 || newVal !== '') {
                    taskList.avatar = resourcePrefix + avalon.vmodels.task.avatar + "?imageView2/1/w/200/h/200" || defaultAvatarUrl;
                    taskList.studentCount = avalon.vmodels.task.studentCount || 100;
                    taskList.score = avalon.vmodels.task.score;
                }
            });

            taskList.visited = avalon.vmodels.root.currentIsVisited;
            // otherwise, show it
            taskList.offset <= limit ? taskList.btnShowMore = false : taskList.btnShowMore = true; /* jshint ignore:line */
            taskList.fetchData();

        };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });
});

