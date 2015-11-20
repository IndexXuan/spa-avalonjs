// not in use 
define([], function() {

    var header = avalon.define({
        $id: "header",  
        headerShow: false, // for header.html
        backBtnShow: false, // for header.html
        backHomeBtnShow: false, // for header.html
        back: function() { // has default back and can custom it
            var state = avalon.vmodels.root.currentState;
            if (state === 'info' || state === 'result') { // not include question, 此处尽量收窄范围
                state = 'detail';
            }
            state = avalon.vmodels[state];
            if (state.back) {
                state.back();
            } else {
                history.go(-1);
            }
        }
    });

    return avalon.controller(function($ctrl) {
        // 进入视图
        $ctrl.$onEnter = function() {
            avalon.vmodels.root.$watch('currentState', function(currentState) {
                if (currentState !== void 0) {

                    // headerShow logic 
                    if (currentState === 'list' || currentState === 'info' || currentState === 'mistakeList') {
                        header.headerShow = true;
                    } else {
                        header.headerShow = false;
                    }

                    // backBtnShow logic 
                    if (currentState !== 'list' && currentState !== 'result' && currentState !== 'mistakeList') {
                        header.backBtnShow = true;
                    } else {
                        header.backBtnShow = false;
                    }

                    // backHomeBtnShow logic
                    if (currentState === 'list') {
                        header.backHomeBtnShow = false;
                    } else {
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

