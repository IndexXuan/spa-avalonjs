define([],function(){function resetScroll(){document.documentElement.srcollTop=0,document.body.scrollTop=0}var apiBaseUrl=avalon.illyGlobal.apiBaseUrl,jinbiResourcePrefix=(avalon.illyGlobal.token,avalon.vmodels.task.illy_domain+"/assets/images"),resourcePrefix="http://resource.hizuoye.com/",wx=avalon.wx,cachedPrefix="illy-task-article-",article=avalon.define({$id:"article",taskId:1,articleId:1,scoreAward:0,title:"",image:"",content:"",createdTime:"2015-07-09",shareCount:88,visitCount:88,likeCount:88,isShared:!1,updateShare:function(){$http.ajax({method:"PUT",url:apiBaseUrl+"tasks/"+article.taskId+"/done",headers:{},success:function(res){avalon.vmodels.task.score=res.score},error:function(res){avalon.illyError("task done ajax error",res)},ajaxFail:function(res){avalon.illyError("task done ajax failed",res)}})},scrollTop:0,shareMaskShow:!0,showShareMask:function(){var scrollTop=document.body.scrollTop||document.documentElement.scrollTop;article.scrollTop=scrollTop,document.body.scrollTop=0,document.documentElement.scrollTop=0;var mask=document.querySelector(".shareMask");setTimeout(function(){mask&&(mask.style.display="block"),mask&&mask.classList.add("a-bounceinB")},16)},hideShareMask:function(){document.body.scrollTop=article.scrollTop,document.documentElement.scrollTop=article.scrollTop;var mask=document.querySelector(".shareMask");mask&&mask.classList.remove("a-bounceinB"),setTimeout(function(){mask&&mask.classList.add("a-bounceoutB")},16),setTimeout(function(){mask&&(mask.style.display="none"),mask&&mask.classList.remove("a-bounceoutB")},500)},hasLiked:!1,updateLike:function(){$http.ajax({method:"PUT",url:apiBaseUrl+"public/posts/"+article.articleId+"/like",headers:{},success:function(){var likeCount=article.likeCount||0;article.likeCount=++likeCount},error:function(res){avalon.illyError("updateLike ajax error",res)},ajaxFail:function(res){avalon.illyError("updateLike ajax failed",res)}})},like:function(){article.updateLike(),avalon.setLocalCache(cachedPrefix+article.taskId+"-like","hasLiked"),article.hasLiked=!0},fetchData:function(){if(article.visited){var local=avalon.getLocalCache(cachedPrefix+article.taskId);return article.articleId=local._id,article.title=local.title,article.image=resourcePrefix+local.image+"?imageview2/2/w/400/h/400",article.content=local.content,article.createdTime=local.createdTime,article.shareCount=local.shareCount,article.visitCount=local.visitCount,void(article.likeCount=local.like||0)}$http.ajax({url:apiBaseUrl+"tasks/"+article.taskId,headers:{},dataType:"json",success:function(json){article.articleId=json._id,article.title=json.title,article.image=resourcePrefix+json.image+"?imageView2/2/w/400/h/400",article.content=json.content,article.createdTime=json.createdTime,article.shareCount=json.shareCount,article.visitCount=json.visitCount,article.likeCount=json.like||0,avalon.setLocalCache(cachedPrefix+article.taskId,json),wx.onMenuShareTimeline({title:article.title,link:avalon.vmodels.task.illy_domain+"/outer/staticArticle.html?id="+article.articleId,imgUrl:document.querySelector(".cover-img > img").src||document.getElementsByTagName("img")[0].src,success:function(){article.hideShareMask(),article.shareCount++,article.isShared===!1&&(article.isShared=!0,resetScroll(),article.updateShare(),setTimeout(function(){$(".item1 > div.kodai").click()},1500))},cancel:function(){article.isShared||avalon.vmodels.task.showAlert("差一点就分享成功了, 拿积分兑大奖了!",3)}});var appMessageDesc="发现"+avalon.vmodels.task.schoolName+"的这篇<<"+article.title+">>很赞, 你也瞧瞧~";wx.onMenuShareAppMessage({title:article.title,link:avalon.vmodels.task.illy_domain+"/outer/staticArticle.html?id="+article.articleId,desc:appMessageDesc,imgUrl:document.querySelector(".cover-img > img").src||document.getElementsByTagName("img")[0].src,success:function(){avalon.vmodels.task.showAlert("分享成功! 朋友将会收到您的分享~",3)},cancel:function(){article.isShared||avalon.vmodels.task.showAlert("差一点就分享成功了!",3)}})}})}});return avalon.controller(function($ctrl){$ctrl.$onRendered=function(){},$ctrl.$onEnter=function(params){article.taskId=params.taskId,article.scoreAward=params.scoreAward,article.visited=avalon.vmodels.root.currentIsVisited,article.isShared=!1,article.fetchData();var isLiked=avalon.getLocalCache(cachedPrefix+article.taskId+"-like");"hasLiked"===isLiked?(article.hasLiked=!0,++article.likeCount):article.hasLiked=!1,article.$watch("isShared",function(newVal){if(newVal){(genClips=function(){$t=$(".item1");for(var amount=5,width=$t.width()/amount,height=$t.height()/amount,y=(Math.pow(amount,2),0),index=1,z=0;amount*width>=z;z+=width)$('<img class="clipped" src="'+jinbiResourcePrefix+"/jb"+index+'.png" />').appendTo($(".item1 .clipped-box")),z===amount*width-width&&(y+=height,z=-width),index>=5&&(index=1),index++,y===amount*height&&(z=9999999)})();var rand=function(min,max){return Math.floor(Math.random()*(max-min+1))+min},first=!1,clicked=!1;$(".item1 div.kodai").on("click",function(){clicked===!1&&($(".full").css({display:"none"}),$(".empty").css({display:"block"}),clicked=!0,setTimeout(function(){alert("任务完成，恭喜获得"+article.scoreAward+"积分！快去兑大奖吧~")},3e3),setTimeout(function(){article.isShared="isShared"},4e3),$(".item1 .clipped-box").css({display:"block"}),$(".clipped-box img").each(function(){var z,nx,ny,v=rand(120,90),angle=rand(80,89),theta=angle*Math.PI/180,g=-9.8,self=$(this),t=0,totalt=10,negate=[1,-1,0],direction=negate[Math.floor(Math.random()*negate.length)],randDeg=rand(-5,10),randScale=rand(.9,1.1),randDeg2=rand(30,5);$(this).css({transform:"scale("+randScale+") skew("+randDeg+"deg) rotateZ("+randDeg2+"deg)"}),z=setInterval(function(){var ux=Math.cos(theta)*v*direction,uy=Math.sin(theta)*v- -g*t;nx=ux*t,ny=uy*t+.25*g*Math.pow(t,2),-40>ny&&(ny=-40),$(self).css({bottom:ny+"px",left:nx+"px"}),t+=.1,t>totalt&&(clicked=!1,first=!0,clearInterval(z))},20)}))}),r=setInterval(function(){first===!0&&($(".empty").addClass("Shake"),first=!1)},300)}})},$ctrl.$onBeforeUnload=function(){},$ctrl.$vmodels=[]})});
//# sourceMappingURL=article.js.map