// ==================== state config start @include ==================== //

    /*
    *  @interface avalon.state.config 全局配置
    *  @param {Object} config 配置对象
    *  @param {Function} config.onBeforeUnload 开始切前的回调，this指向router对象，第一个参数是fromState，第二个参数是toState，return false可以用来阻止切换进行
    *  @param {Function} config.onAbort onBeforeUnload return false之后，触发的回调，this指向mmState对象，参数同onBeforeUnload
    *  @param {Function} config.onUnload url切换时候触发，this指向mmState对象，参数同onBeforeUnload
    *  @param {Function} config.onBegin  开始切换的回调，this指向mmState对象，参数同onBeforeUnload，如果配置了onBegin，则忽略begin
    *  @param {Function} config.onLoad 切换完成并成功，this指向mmState对象，参数同onBeforeUnload
    *  @param {Function} config.onViewEnter 视图插入动画函数，有一个默认效果
    *  @param {Node} config.onViewEnter.arguments[0] 新视图节点
    *  @param {Node} config.onViewEnter.arguments[1] 旧的节点
    *  @param {Function} config.onError 出错的回调，this指向对应的state，第一个参数是一个object，object.type表示出错的类型，比如view表示加载出错，object.name则对应出错的view name，object.xhr则是当使用默认模板加载器的时候的httpRequest对象，第二个参数是对应的state
    */

    // 每次view载入都会执行的回调，适合来做一些统一操作
    avalon.state.config({
        onError: function() {
            root.currentAction = 'onError';
        },
        onBeforeUnload: function() { // 太宽泛了，放到具体ctrl里处理
            root.currentAction = 'onBeforeUnload';
        },
        onUnload: function() { // url变化时触发
            root.currentAction = 'onUnload';
        },
        onBegin: function() {
            root.currentAction = 'onBegin';
        },
        onLoad: function() { // 切换完成并成功
            root.currentAction = 'onLoad';
        }
    }); 

    // ====================  state config end @include ==================== //
