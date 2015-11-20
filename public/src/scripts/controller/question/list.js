define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;
    
    var localLimit = 6; // 一次抓取多少数据
    var list = avalon.define({

        $id: "list",
        swipeToDeleteOn: false, // 是否开启滑动删除，默认关闭，关闭原因详情看具体实现函数
        isVisited: false,
        noContent: false,
        noContentText: '还没有做过作业哦，<br/>快去完成作业，得到老师评价吧~',
        defaultQuestionImage: '../assets/images/iconfont-questionImage.png',

        lists: [],

        isLoading: false, // 正在加载标记
        offset: 0, // inner var, to fetch data with offset and limit
        noMoreData: false, // no more data
        btnShowMore: false,
        fetchData: function(offset, concat) {
            list.isLoading = true;

            var limit = localLimit;
            offset = offset || 0;

            $http.ajax({
                url: apiBaseUrl + "questions?state=0&limit=" + limit + "&offset=" + offset,
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                dataType: "json",
                success: function(lists) {

                    if (concat === true) {
                        list.lists = list.lists.concat(lists);
                    } else {
                        list.lists = lists;
                    }
                    setTimeout(function() {                          
                        var newLists = list.lists;
                        if (newLists && newLists.length === 0) {
                            list.noContent = true;
                        }      
                    }, 200);
                    if (lists.length === 0) {
                        list.noMoreData = true;
                    }
                    list.isLoading = false;
                },
                error: function(res) {
                    avalon.illyError("list ajax error", res);
                    if (list.lists.length <= 1) {
                        list.noContent = true;
                    }
                },
                ajaxFail: function(res) {
                    avalon.illyError("list ajax failed" + res);
                    if (list.lists.length <= 1) {
                        list.noContent = true;
                    }
                }
            });
        }, // end of fetchData
        showMore: function(e) {
            e.preventDefault();
            var offset = list.lists.length;
            list.fetchData(offset, true); //is concat 
        },
        maxMoveX: 0,
        edit: function() {
            $('.J-list-wrapper .inner').css('-webkit-transform', 'translateX(' + -list.maxMoveX + 'px)');
            //swipeLeftDone = true;
            avalon.vmodels.header.editShow = false;
            avalon.vmodels.header.editDoneShow = true;
        },
        editDone: function() {
            $('.J-list-wrapper .inner').css('-webkit-transform', 'translateX(0px)');
            //swipeLeftDone = false;
            avalon.vmodels.header.editShow = true;
            avalon.vmodels.header.editDoneShow = false;
        },
        deleteQuestion: function(questionId) {
            $http.ajax({
                method: 'DELETE',
                url: apiBaseUrl + "questions/" + questionId,
                headers: {
                    //'Authorization': 'Bearer ' + token
                },
                dataType: "json",
                success: function() {
                    list.lists.forEach(function(item, i) {
                        if (item._id === questionId) {
                            list.lists.splice(i, 1);
                        }
                    });
                },
                error: function(res) {
                    avalon.illyError("question delete ajax error", res);
                },
                ajaxFail: function(res) {
                    avalon.illyError("question delete ajax failed" + res);
                }
            });
        }

    }); // end of define

    list.lists.$watch('length', function(newLength) { // mark for avalon1.5+ change this way
        if ( newLength !== void 0 && newLength < localLimit ) {
            list.btnShowMore = false;
            if (newLength === 0) {
                list.noContent = true;
            }
        } else {
            list.btnShowMore = true;
        }
    });

    return avalon.controller(function($ctrl) {
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {
            list.editDone();
        };
        // 进入视图
        $ctrl.$onEnter = function() {

            avalon.vmodels.result.current = 'list';
            list.isVisited = avalon.vmodels.root.currentIsVisited;
            var needFetch = false;
            if (avalon.vmodels.index !== void 0 && avalon.vmodels.index.serverId !== '') {
                needFetch = true;
                avalon.vmodels.index.serverId = '';
            }
            if (!list.isVisited || needFetch) {
                list.fetchData();
            }

        };
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

            (function() {

                // common data 
                var viewWidth = $(window).width();
                var wrapper = '.J-list-wrapper';
                var touchTarget = '.ui-layer';
                var maxMoveX = viewWidth / 4;
                avalon.vmodels.list.maxMoveX = maxMoveX;

                // 取消滑动删除，还不成熟，打开此注释可恢复不成熟版本滑动删除，不成熟在于点击和竖方向滑动不畅
                if (!list.swipeToDeleteOn) {
                    return;
                }
                var canMoveAreaX = viewWidth / 5; 

                var startX;
                var moveDelta;

                var moveX;
                var endX;
                var moveDirection;

                var swipeLeftDone = false;
                var isMovedEnough = 40; // 滑动多少被认为是滑动
                var swipeRightDoneAniName = 'a-bounceinR';
                // end of common data

                // deal with touchstart, and get the startX data
                $(wrapper).on('touchstart', touchTarget, function(e) {
                    startX = e.touches[0].pageX;
                    moveDelta = void 0; // reset moveDelta when touch 201510291610
                    e.preventDefault(); // fix 安卓不触发touchend bug! 201510291546
                });

                // deal with touchmove and get some important data
                $(wrapper).on('touchmove', touchTarget, function(e) {

                    var self = $(this);
                    var pageX = e.touches[0].pageX;
                    endX = pageX;
                    moveDelta = pageX - startX;
                    if (moveDelta < 0) {
                        moveDirection = 'left';
                    } else {
                        moveDirection = 'right';
                    }
                    if (startX < canMoveAreaX) { /* 过于左侧开始滑动，判定为不应该触发滑动 */
                        e.preventDefault();
                        return;
                    }
                    if (swipeLeftDone === false && moveDirection === 'right') { /* 阻止直接往右滑 */
                        e.preventDefault();
                        return;
                    }
                    if (swipeLeftDone === true && moveDirection === 'right') { /* 复位 */

                        // add swipeRight ani
                        $(this).addClass(swipeRightDoneAniName);
                        setTimeout(function() {
                            $(this).removeClass(swipeRightDoneAniName);
                        }.bind(this), 200);

                        $(this).css('-webkit-transform', 'translateX(0px)');
                        return;
                    }
                    if (swipeLeftDone === true && moveDirection === 'left') { /* 滑动到左侧依然左滑，阻止 */
                        e.preventDefault();
                        return;
                    }

                    // 取固定的移动距离且最大就是maxMoveX 
                    if (moveDirection === 'left' && Math.abs(moveDelta) < maxMoveX) {
                        moveX = moveDelta;
                    } else if (moveDirection === 'left' && Math.abs(moveDelta) >= maxMoveX) {
                        moveX = -maxMoveX;
                    }

                    // 手指跟随的关键
                    self.css('-webkit-transform', 'translateX(' + moveX + 'px)');

                });

                // deal with touchend and get some important data
                $(wrapper).on('touchend', touchTarget, function() { // touch接管移动和点击
                    // e.preventDefault();
                    if (endX > 0 && endX < startX && Math.abs(moveDelta) > isMovedEnough) { // if swipeLeft and enough
                        $(this).css('-webkit-transform', 'translateX('+ -maxMoveX +'px)');
                        swipeLeftDone = true;
                        // add swipeLeft ani
                    } else if (endX > 0 && endX > startX && moveDelta > isMovedEnough) { // swipeRight and enough

                        // add swipeRight ani
                        $(this).addClass(swipeRightDoneAniName);
                        setTimeout(function() {
                            $(this).removeClass(swipeRightDoneAniName);
                        }.bind(this), 200);
                        
                        $(this).css('-webkit-transform', 'translateX(0px)');
                        swipeLeftDone = false;
                    } else if (Math.abs(moveDelta) < 10 || moveDelta === void 0) { // key! 小于移动距离或者没移动都被认为是点击
                        if (swipeLeftDone === false){
                            $(this).click();
                        }
                    } else { // 所有其他情况都复原位
                        $(this).css('-webkit-transform', 'translateX(0px)');
                    }
                });

            })();

            $('.J-list-wrapper').on('click', '.fn-layer', function() {
                var questionId = $(this).attr('data-questionid');
                list.deleteQuestion(questionId);
                $(this).hide();
            });

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });
});

