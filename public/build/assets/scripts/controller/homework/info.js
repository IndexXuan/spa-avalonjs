define([],function(){var apiBaseUrl=avalon.illyGlobal&&avalon.illyGlobal.apiBaseUrl,info=(avalon.illyGlobal.token,avalon.define({$id:"info",homeworkId:0,title:"",keyPoint:"",keyPointRecord:"",isPlaying:!1,duration:"加载中...",fetchDataForDetailCtrl:function(_id){if(avalon.vmodels.root.currentIsVisited){var json=avalon.getLocalCache("illy-homework-id-"+_id),detail=avalon.vmodels.detail;info.homeworkId=json._id,detail.homeworkId=json._id,info.title=json.title,detail.title=json.title,info.keyPoint=json.keyPoint,detail.keyPoint=json.keyPoint,info.keyPointRecord=json.keyPointRecord,detail.keyPointRecord=json.keyPointRecord,detail.exercises=json.quiz.exercises;var keyPointAudio=avalon.$(".info .keyPointAudio");return void(keyPointAudio&&keyPointAudio.setAttribute("src",avalon.illyGlobal.resourceBaseUrl+info.keyPointRecord))}$http.ajax({url:apiBaseUrl+"homework/"+_id,headers:{},dataType:"json",success:function(json){var detail=avalon.vmodels.detail;info.homeworkId=json._id,detail.homeworkId=json._id,info.title=json.title,detail.title=json.title,info.keyPoint=json.keyPoint,detail.keyPoint=json.keyPoint,info.keyPointRecord=json.keyPointRecord,detail.keyPointRecord=json.keyPointRecord,detail.exercises=json.quiz.exercises;var keyPointAudio=avalon.$(".info .keyPointAudio");keyPointAudio&&keyPointAudio.setAttribute("src",avalon.illyGlobal.resourceBaseUrl+info.keyPointRecord),avalon.setLocalCache("illy-homework-id-"+_id,json)},error:function(res){avalon.illyError("homework exercises ajax error",res)},ajaxFail:function(res){avalon.illyError("homework exercises ajax failed",res)}})},goNext:function(){avalon.router.go("app.detail.question",{homeworkId:info.homeworkId,questionId:1})},playRecord:function(){var audio=avalon.$(".keyPointAudio");audio.play(),info.isPlaying=!0,setTimeout(function(){info.isPlaying=!1},1e3*info.duration)},stopRecord:function(){var audio=avalon.$(".keyPointAudio");audio.pause(),info.isPlaying=!1},toggleRecord:function(){info.isPlaying?info.stopRecord():info.playRecord()}}));return avalon.controller(function($ctrl){$ctrl.$onRendered=function(){},$ctrl.$onEnter=function(params){var _id=params.homeworkId,detailVMCachedId=avalon.vmodels.detail.homeworkId;detailVMCachedId!==_id&&info.fetchDataForDetailCtrl(_id),setTimeout(function(){var audio=avalon.$(".keyPointAudio"),duration=audio&&audio.duration;info.duration=parseInt(duration,10)+1||"加载中..."},2e3),setTimeout(function(){var audio=avalon.$(".keyPointAudio"),duration=audio&&audio.duration;info.duration=parseInt(duration,10)+1||"加载中..."},6e3)},$ctrl.$onBeforeUnload=function(){info.stopRecord()},$ctrl.$vmodels=[]})});
//# sourceMappingURL=info.js.map