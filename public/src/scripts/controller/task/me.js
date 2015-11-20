define([], function() {

    // get config
    var apiBaseUrl = avalon.illyGlobal.apiBaseUrl;
    var token = avalon.illyGlobal.token;

    // 获取全局wx-sdk接口
    var wx = avalon.wx;

    // prefix of resource
    var resourcePrefix = avalon.illyGlobal.resourceBaseUrl;

    // avatar manage
    var avatar = {
        defaultFullUrl: resourcePrefix + 'images/avatar/children/default1.png?imageView2/1/w/200/h/200',
        localId: '',
        serverId: ''
    };

    var me = avalon.define({

        $id: "me",

        // profile item can be update
        infoProfile: ['displayName', 'gender', 'phone', 'parent', 'onSchool', 'grade'],

        /* state prop start */
        editing: false,
        /* state prop end */

        /* page data start */
        copyProfile: '',
        username: '',
        displayName: '',
        gender: '',
        phone: '',
        parent: '',
        //avatar: '', // use partent task ctrl's avatar
        onSchool: '',
        grade: '',
        finishedHomeworkCount: '',
        finishedPreviewsCount: '',
        score: '',
        /* page data end */

        /* 内部功能函数 */
        resetData: function() {
            avatar.localId = '';
            avatar.serverId = '';
        },
        hasDiff: function() {
            var diff = me.infoProfile.every(function(item) {
                return me[item] === me.copyProfile[item];
            });
            return !diff;
        },
        setVM: function(source, setAvatar) {
            if (setAvatar !== false) { setAvatar = true; }// default
            me.username = source.username;
            me.displayName = source.displayName;
            me.gender = source.gender || '男';
            me.phone = source.phone;
            me.parent = source.parent;
            if (setAvatar) {
                if (source.avatar !== void 0) {
                    me.avatar = resourcePrefix + source.avatar + '?imageView2/1/w/200/h/200';
                } else {
                    me.avatar = avatar.defaultFullUrl; // default setAvatar of user
                }
            }
            me.onSchool = source.onSchool;
            me.grade = source.grade;
            me.finishedHomeworkCount = source.finishedHomeworkCount;
            me.finishedPreviewsCount = source.finishedPreviewsCount;
            me.score = source.score;
        },
        fetchData: function() {
            $http.ajax({
                url: apiBaseUrl + "profile",
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                dataType: "json",
                success: function(json) {
                    me.copyProfile = json;
                    me.setVM(json, true);
                }
            });
        },
        /* 内部功能函数 */

        /* 对微信sdk进行简单封装的功能函数 */
        chooseImage: function() {
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    avatar.localId = localIds && localIds[0];
                    //alert('choose ' + localIds.length + ' images!');
                    me.avatar = avatar.localId; // change it now 
                    me.uploadImage();
                }
            });
        },
        uploadImage: function() {
            wx.uploadImage({
                localId: avatar.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    avatar.serverId = serverId;
                    
                    setTimeout(function() { // then, update avatar
                        me.updateAvatar();
                    }, 200);
                }
            });
        },
        /* 对微信sdk进行简单封装的功能函数 */

        /* 对api进行简单封装的功能函数 */
        updateProfile: function() {
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'profile',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                data: {
                    displayName: me.displayName,
                    gender: me.gender,
                    phone: me.phone,
                    parent: me.parent,
                    onSchool: me.onSchool,
                    grade: me.grade
                },
                success: function() {
                    //avalon.log(res);
                },
                error: function(res) {
                    alert('对不起，账户信息更新失败...' + res);
                    me.resetAll(); // 回滚页面ui中账户信息，做到更新失败的回滚
                },
                ajaxFail: function(res) {
                    alert('对不起，账户信息更新失败...' + res);
                    me.resetAll(); // 回滚页面ui中账户信息，做到更新失败的回滚
                }
            });
        },
        updateAvatar: function() { // tell server-side to fetch new avatar from wx-server
            $http.ajax({
                method: 'PUT',
                url: apiBaseUrl + 'avatar',
                headers: {
                    //Authorization: 'Bearer ' + token
                },
                data: {
                    avatar: avatar.serverId
                },
                success: function(res) {
                    avalon.vmodels.task.showAlert('头像更换成功!', 2);
                },
                error: function(res) {
                    avalon.illyError('avatar ajax error', res);
                    avalon.vmodels.task.showAlert('对不起，头像更换失败，请重试！', 1);
                },
                ajaxFail: function(res) {
                    avalon.illyError('avatar ajax ', res);
                    avalon.vmodels.task.showAlert('对不起，头像更换失败，请重试！', 1);
                } 
            });
        },
        /* 对api进行简单封装的功能函数 */

        /* 对工具函数进行浅封装的直接用户交互函数 */
        edit: function() {
            me.editing = true;
        },
        resetAll: function() {
            me.setVM(me.copyProfile, false);
        },
        save: function() { // diff will update and no-diff will just local save
            if(me.hasDiff()) {
                me.updateProfile();
            }
            me.editing = false;
        },
        cancel: function() {
            me.resetAll();
            me.editing = false;
        }
        /* 对工具函数进行浅封装的直接用户交互函数 */

    }); // end of define 

    return avalon.controller(function($ctrl) {
        // 视图渲染后，意思是avalon.scan完成
        $ctrl.$onRendered = function() {

        };
        // 进入视图
        $ctrl.$onEnter = function() {

            me.resetData();
            me.fetchData();

        };
        // 对应的视图销毁前
        $ctrl.$onBeforeUnload = function() {

        };
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concat(DOM树上下文vmodels)
        $ctrl.$vmodels = [];
    });

});

