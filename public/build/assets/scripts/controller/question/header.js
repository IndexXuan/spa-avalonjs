define([],function(){var header=avalon.define({$id:"header",headerShow:!1,backBtnShow:!0,backHomeBtnShow:!0,leftBackIndexShow:!1,editShow:!1,editDoneShow:!1,edit:function(){avalon.vmodels.list&&avalon.vmodels.list.edit&&avalon.vmodels.list.edit()},editDone:function(){avalon.vmodels.list&&avalon.vmodels.list.editDone&&avalon.vmodels.list.editDone()},back:function(){history.go(-1)}});return avalon.controller(function($ctrl){$ctrl.$onEnter=function(){avalon.vmodels.root.$watch("currentState",function(currentState){void 0!==currentState&&(header.headerShow="index"!==currentState?!0:!1,"list"===currentState?(header.leftBackIndexShow=!0,header.editShow=!0,header.backHomeBtnShow=!1):"history"===currentState?(header.editShow=!1,header.leftBackIndexShow=!0,header.backHomeBtnShow=!0):(header.editShow=!1,header.leftBackIndexShow=!1,header.backHomeBtnShow=!0))})},$ctrl.$onRendered=function(){},$ctrl.$onBeforeUnload=function(){},$ctrl.$vmodels=[]})});
//# sourceMappingURL=header.js.map