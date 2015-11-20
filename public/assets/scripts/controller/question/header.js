define([], function() {

    var header = avalon.define({
        $id: "header",  
        headerShow: false, // for header.html
        backBtnShow: true, // for header.html
        backHomeBtnShow: true, // for header.html
        leftBackIndexShow: false, // list和history页面专用的左侧回到首页按钮
        editShow: false, // 编辑按钮
        editDoneShow: false, // 编辑中的完成按钮，状态在相关页设置(list.js)
        edit: function() {
            avalon.vmodels.list && avalon.vmodels.list.edit && avalon.vmodels.list.edit(); /* jshint ignore:line */ 
        },
        editDone: function() {
            avalon.vmodels.list && avalon.vmodels.list.editDone && avalon.vmodels.list.editDone(); /* jshint ignore:line */ 
        },
        back: function() { // has default back and can custom it
            history.go(-1);
        } 
    });

    return avalon.controller(function($ctrl) {
        // 进入视图
        $ctrl.$onEnter = function() {

            avalon.vmodels.root.$watch('currentState', function(currentState) {
                if (currentState !== void 0) {

                    // headerShow logic 
                    if (currentState !== 'index') {
                        header.headerShow = true;
                    } else {
                        header.headerShow = false;
                    }

                    if (currentState === 'list') {
                        //avalon.vmodels.root.$watch('currentDataDone', function(rendered) {
                        //    if (rendered && currentState === 'list') {
                        //        if (avalon.vmodels.list.lists.length > 0) {
                        //            console.log(currentState);
                        //            header.editShow = true;
                        //            header.backHomeBtnShow = false;
                        //        } else {
                        //            header.backHomeBtnShow = true;
                        //        }
                        //    }
                        //});
                        header.leftBackIndexShow = true;
                        header.editShow = true;
                        header.backHomeBtnShow = false;
                    } else if (currentState === 'history') {
                        header.editShow = false;
                        header.leftBackIndexShow = true;
                        header.backHomeBtnShow = true;
                    } else {
                        header.editShow = false;
                        header.leftBackIndexShow = false;
                        header.backHomeBtnShow = true;
                    }


                }
            }); // end of header.currentState watcher

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

