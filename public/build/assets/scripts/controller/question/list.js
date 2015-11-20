define([],function(){var apiBaseUrl=avalon.illyGlobal.apiBaseUrl,localLimit=(avalon.illyGlobal.token,6),list=avalon.define({$id:"list",swipeToDeleteOn:!1,isVisited:!1,noContent:!1,noContentText:"还没有做过作业哦，<br/>快去完成作业，得到老师评价吧~",defaultQuestionImage:"../assets/images/iconfont-questionImage.png",lists:[],isLoading:!1,offset:0,noMoreData:!1,btnShowMore:!1,fetchData:function(offset,concat){list.isLoading=!0;var limit=localLimit;offset=offset||0,$http.ajax({url:apiBaseUrl+"questions?state=0&limit="+limit+"&offset="+offset,headers:{},dataType:"json",success:function(lists){list.lists=concat===!0?list.lists.concat(lists):lists,setTimeout(function(){var newLists=list.lists;newLists&&0===newLists.length&&(list.noContent=!0)},200),0===lists.length&&(list.noMoreData=!0),list.isLoading=!1},error:function(res){avalon.illyError("list ajax error",res),list.lists.length<=1&&(list.noContent=!0)},ajaxFail:function(res){avalon.illyError("list ajax failed"+res),list.lists.length<=1&&(list.noContent=!0)}})},showMore:function(e){e.preventDefault();var offset=list.lists.length;list.fetchData(offset,!0)},maxMoveX:0,edit:function(){$(".J-list-wrapper .inner").css("-webkit-transform","translateX("+-list.maxMoveX+"px)"),avalon.vmodels.header.editShow=!1,avalon.vmodels.header.editDoneShow=!0},editDone:function(){$(".J-list-wrapper .inner").css("-webkit-transform","translateX(0px)"),avalon.vmodels.header.editShow=!0,avalon.vmodels.header.editDoneShow=!1},deleteQuestion:function(questionId){$http.ajax({method:"DELETE",url:apiBaseUrl+"questions/"+questionId,headers:{},dataType:"json",success:function(){list.lists.forEach(function(item,i){item._id===questionId&&list.lists.splice(i,1)})},error:function(res){avalon.illyError("question delete ajax error",res)},ajaxFail:function(res){avalon.illyError("question delete ajax failed"+res)}})}});return list.lists.$watch("length",function(newLength){void 0!==newLength&&localLimit>newLength?(list.btnShowMore=!1,0===newLength&&(list.noContent=!0)):list.btnShowMore=!0}),avalon.controller(function($ctrl){$ctrl.$onBeforeUnload=function(){list.editDone()},$ctrl.$onEnter=function(){avalon.vmodels.result.current="list",list.isVisited=avalon.vmodels.root.currentIsVisited;var needFetch=!1;void 0!==avalon.vmodels.index&&""!==avalon.vmodels.index.serverId&&(needFetch=!0,avalon.vmodels.index.serverId=""),(!list.isVisited||needFetch)&&list.fetchData()},$ctrl.$onRendered=function(){!function(){var viewWidth=$(window).width(),wrapper=".J-list-wrapper",touchTarget=".ui-layer",maxMoveX=viewWidth/4;if(avalon.vmodels.list.maxMoveX=maxMoveX,list.swipeToDeleteOn){var startX,moveDelta,moveX,endX,moveDirection,canMoveAreaX=viewWidth/5,swipeLeftDone=!1,isMovedEnough=40,swipeRightDoneAniName="a-bounceinR";$(wrapper).on("touchstart",touchTarget,function(e){startX=e.touches[0].pageX,moveDelta=void 0,e.preventDefault()}),$(wrapper).on("touchmove",touchTarget,function(e){var self=$(this),pageX=e.touches[0].pageX;return endX=pageX,moveDelta=pageX-startX,moveDirection=0>moveDelta?"left":"right",canMoveAreaX>startX?void e.preventDefault():swipeLeftDone===!1&&"right"===moveDirection?void e.preventDefault():swipeLeftDone===!0&&"right"===moveDirection?($(this).addClass(swipeRightDoneAniName),setTimeout(function(){$(this).removeClass(swipeRightDoneAniName)}.bind(this),200),void $(this).css("-webkit-transform","translateX(0px)")):swipeLeftDone===!0&&"left"===moveDirection?void e.preventDefault():("left"===moveDirection&&Math.abs(moveDelta)<maxMoveX?moveX=moveDelta:"left"===moveDirection&&Math.abs(moveDelta)>=maxMoveX&&(moveX=-maxMoveX),void self.css("-webkit-transform","translateX("+moveX+"px)"))}),$(wrapper).on("touchend",touchTarget,function(){endX>0&&startX>endX&&Math.abs(moveDelta)>isMovedEnough?($(this).css("-webkit-transform","translateX("+-maxMoveX+"px)"),swipeLeftDone=!0):endX>0&&endX>startX&&moveDelta>isMovedEnough?($(this).addClass(swipeRightDoneAniName),setTimeout(function(){$(this).removeClass(swipeRightDoneAniName)}.bind(this),200),$(this).css("-webkit-transform","translateX(0px)"),swipeLeftDone=!1):Math.abs(moveDelta)<10||void 0===moveDelta?swipeLeftDone===!1&&$(this).click():$(this).css("-webkit-transform","translateX(0px)")})}}(),$(".J-list-wrapper").on("click",".fn-layer",function(){var questionId=$(this).attr("data-questionid");list.deleteQuestion(questionId),$(this).hide()})},$ctrl.$vmodels=[]})});
//# sourceMappingURL=list.js.map