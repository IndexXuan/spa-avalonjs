define([],function(){var apiBaseUrl=avalon.illyGlobal.apiBaseUrl,token=avalon.illyGlobal.token;null===token&&avalon.illyGlobal.noTokenHandler();var resourcePrefix=avalon.illyGlobal.resourceBaseUrl,rank=avalon.define({$id:"rank",ranks:[],myScore:0,myRank:0,displayName:"",avatar:""});return avalon.controller(function($ctrl){$ctrl.$onRendered=function(){},$ctrl.$onEnter=function(){$http.ajax({url:apiBaseUrl+"score/rank/me",headers:{},success:function(res){rank.displayName=res.displayName,rank.avatar=res.avatar?resourcePrefix+res.avatar:resourcePrefix+"images/avatar/children/default1.png",rank.myRank=res.rank,rank.myScore=res.score},error:function(res){avalon.illyError("my rank info ajax error",res)},ajaxFail:function(res){avalon.illyError("my rank info ajax failed",res)}}),$http.ajax({url:apiBaseUrl+"score/rank/topTen",headers:{},success:function(res){rank.ranks=res},error:function(res){avalon.illyError("topTen rank info ajax error",res)},ajaxFail:function(res){avalon.illyError("topTen rank info ajax failed",res)}})},$ctrl.$onBeforeUnload=function(){},$ctrl.$vmodels=[]})});
//# sourceMappingURL=rank.js.map