// gmu.part.start
/**
 * @file 媒体查询
 * @import zepto.js
 * @module GMU
 */

(function ($) {

    /**
     * 是原生的window.matchMedia方法的polyfill，对于不支持matchMedia的方法系统和浏览器，按照[w3c window.matchMedia](http://www.w3.org/TR/cssom-view/#dom-window-matchmedia)的接口
     * 定义，对matchMedia方法进行了封装。原理是用css media query及transitionEnd事件来完成的。在页面中插入media query样式及元素，当query条件满足时改变该元素样式，同时这个样式是transition作用的属性，
     * 满足条件后即会触发transitionEnd，由此创建MediaQueryList的事件监听。由于transition的duration time为0.001ms，故若直接使用MediaQueryList对象的matches去判断当前是否与query匹配，会有部分延迟，
     * 建议注册addListener的方式去监听query的改变。$.matchMedia的详细实现原理及采用该方法实现的转屏统一解决方案详见
     * [GMU Pages: 转屏解决方案($.matchMedia)](https://github.com/gmuteam/GMU/wiki/%E8%BD%AC%E5%B1%8F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88$.matchMedia)
     *
     * 返回值MediaQueryList对象包含的属性<br />
     * - ***matches*** 是否满足query<br />
     * - ***query*** 查询的css query，类似\'screen and (orientation: portrait)\'<br />
     * - ***addListener*** 添加MediaQueryList对象监听器，接收回调函数，回调参数为MediaQueryList对象<br />
     * - ***removeListener*** 移除MediaQueryList对象监听器<br />
     *
     *
     * @method $.matchMedia
     * @grammar $.matchMedia(query)  ⇒ MediaQueryList
     * @param {String} query 查询的css query，类似\'screen and (orientation: portrait)\'
     * @return {Object} MediaQueryList
     * @example
     * $.matchMedia('screen and (orientation: portrait)').addListener(fn);
     */
    $.matchMedia = (function() {
        var mediaId = 0,
            cls = 'gmu-media-detect',
            transitionEnd = $.fx.transitionEnd,
            cssPrefix = $.fx.cssPrefix,
            $style = $('<style></style>').append('.' + cls + '{' + cssPrefix + 'transition: width 0.001ms; width: 0; position: absolute; clip: rect(1px, 1px, 1px, 1px);}\n').appendTo('head');

        return function (query) {
            var id = cls + mediaId++,
                $mediaElem,
                listeners = [],
                ret;

            $style.append('@media ' + query + ' { #' + id + ' { width: 1px; } }\n') ;   //原生matchMedia也需要添加对应的@media才能生效

            // 统一用模拟的，时机更好。
            // if ('matchMedia' in window) {
            //     return window.matchMedia(query);
            // }

            $mediaElem = $('<div class="' + cls + '" id="' + id + '"></div>')
                .appendTo('body')
                .on(transitionEnd, function() {
                    ret.matches = $mediaElem.width() === 1;
                    $.each(listeners, function (i,fn) {
                        $.isFunction(fn) && fn.call(ret, ret);
                    });
                });

            ret = {
                matches: $mediaElem.width() === 1 ,
                media: query,
                addListener: function (callback) {
                    listeners.push(callback);
                    return this;
                },
                removeListener: function (callback) {
                    var index = listeners.indexOf(callback);
                    ~index && listeners.splice(index, 1);
                    return this;
                }
            };

            return ret;
        };
    }());
})(Zepto);
/**
 * @file 扩展转屏事件
 * @name ortchange
 * @short ortchange
 * @desc 扩展转屏事件orientation，解决原生转屏事件的兼容性问题
 * @import zepto.js, extend/matchMedia.js
 */

$(function () {
    /**
     * @name ortchange
     * @desc 扩展转屏事件orientation，解决原生转屏事件的兼容性问题
     * - ***ortchange*** : 当转屏的时候触发，兼容uc和其他不支持orientationchange的设备，利用css media query实现，解决了转屏延时及orientation事件的兼容性问题
     * $(window).on('ortchange', function () {        //当转屏的时候触发
     *     console.log('ortchange');
     * });
     */
    //扩展常用media query
    $.mediaQuery = {
        ortchange: 'screen and (width: ' + window.innerWidth + 'px)'
    };
    //通过matchMedia派生转屏事件
    $.matchMedia($.mediaQuery.ortchange).addListener(function () {
        $(window).trigger('ortchange');
    });
});/**
 * @file 模板解析
 * @import zepto.js
 * @module GMU
 */
(function( $, undefined ) {
    
    /**
     * 解析模版tpl。当data未传入时返回编译结果函数；当某个template需要多次解析时，建议保存编译结果函数，然后调用此函数来得到结果。
     * 
     * @method $.parseTpl
     * @grammar $.parseTpl(str, data)  ⇒ string
     * @grammar $.parseTpl(str)  ⇒ Function
     * @param {String} str 模板
     * @param {Object} data 数据
     * @example var str = "<p><%=name%></p>",
     * obj = {name: 'ajean'};
     * console.log($.parseTpl(str, data)); // => <p>ajean</p>
     */
    $.parseTpl = function( str, data ) {
        var tmpl = 'var __p=[];' + 'with(obj||{}){__p.push(\'' +
                str.replace( /\\/g, '\\\\' )
                .replace( /'/g, '\\\'' )
                .replace( /<%=([\s\S]+?)%>/g, function( match, code ) {
                    return '\',' + code.replace( /\\'/, '\'' ) + ',\'';
                } )
                .replace( /<%([\s\S]+?)%>/g, function( match, code ) {
                    return '\');' + code.replace( /\\'/, '\'' )
                            .replace( /[\r\n\t]/g, ' ' ) + '__p.push(\'';
                } )
                .replace( /\r/g, '\\r' )
                .replace( /\n/g, '\\n' )
                .replace( /\t/g, '\\t' ) +
                '\');}return __p.join("");',

            /* jsbint evil:true */
            func = new Function( 'obj', tmpl );
        
        return data ? func( data ) : func;
    };
})( Zepto );// Copyright (c) 2013, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://gmu.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @file 声明gmu命名空间
 * @namespace gmu
 * @import zepto.js
*/

/**
 * GMU是基于zepto的轻量级mobile UI组件库，符合jquery ui使用规范，提供webapp、pad端简单易用的UI组件。为了减小代码量，提高性能，组件再插件化，兼容iOS3+ / android2.1+，支持国内主流移动端浏览器，如safari, chrome, UC, qq等。
 * GMU由百度GMU小组开发，基于开源BSD协议，支持商业和非商业用户的免费使用和任意修改，您可以通过[get started](http://gmu.baidu.com/getstarted)快速了解。
 *
 * ###Quick Start###
 * + **官网：**http://gmu.baidu.com/
 * + **API：**http://gmu.baidu.com/doc
 *
 * ###历史版本###
 *
 * ### 2.0.5 ###
 * + **DEMO: ** http://gmu.baidu.com/demo/2.0.5
 * + **API：** http://gmu.baidu.com/doc/2.0.5
 * + **下载：** http://gmu.baidu.com/download/2.0.5
 *
 * @module GMU
 * @title GMU API 文档
 */
var gmu = gmu || {
    version: '@version',
    $: window.Zepto,

    /**
     * 调用此方法，可以减小重复实例化Zepto的开销。所有通过此方法调用的，都将公用一个Zepto实例，
     * 如果想减少Zepto实例创建的开销，就用此方法。
     * @method staticCall
     * @grammar gmu.staticCall( dom, fnName, args... )
     * @param  {DOM} elem Dom对象
     * @param  {String} fn Zepto方法名。
     * @param {*} * zepto中对应的方法参数。
     * @example
     * // 复制dom的className给dom2, 调用的是zepto的方法，但是只会实例化一次Zepto类。
     * var dom = document.getElementById( '#test' );
     *
     * var className = gmu.staticCall( dom, 'attr', 'class' );
     * console.log( className );
     *
     * var dom2 = document.getElementById( '#test2' );
     * gmu.staticCall( dom, 'addClass', className );
     */
    staticCall: (function( $ ) {
        var proto = $.fn,
            slice = [].slice,

            // 公用此zepto实例
            instance = $();

        instance.length = 1;

        return function( item, fn ) {
            instance[ 0 ] = item;
            return proto[ fn ].apply( instance, slice.call( arguments, 2 ) );
        };
    })( Zepto )
};/**
 * @file Event相关, 给widget提供事件行为。也可以给其他对象提供事件行为。
 * @import core/gmu.js
 * @module GMU
 */
(function( gmu, $ ) {
    var slice = [].slice,
        separator = /\s+/,

        returnFalse = function() {
            return false;
        },

        returnTrue = function() {
            return true;
        };

    function eachEvent( events, callback, iterator ) {

        // 不支持对象，只支持多个event用空格隔开
        (events || '').split( separator ).forEach(function( type ) {
            iterator( type, callback );
        });
    }

    // 生成匹配namespace正则
    function matcherFor( ns ) {
        return new RegExp( '(?:^| )' + ns.replace( ' ', ' .* ?' ) + '(?: |$)' );
    }

    // 分离event name和event namespace
    function parse( name ) {
        var parts = ('' + name).split( '.' );

        return {
            e: parts[ 0 ],
            ns: parts.slice( 1 ).sort().join( ' ' )
        };
    }

    function findHandlers( arr, name, callback, context ) {
        var matcher,
            obj;

        obj = parse( name );
        obj.ns && (matcher = matcherFor( obj.ns ));
        return arr.filter(function( handler ) {
            return handler &&
                    (!obj.e || handler.e === obj.e) &&
                    (!obj.ns || matcher.test( handler.ns )) &&
                    (!callback || handler.cb === callback ||
                    handler.cb._cb === callback) &&
                    (!context || handler.ctx === context);
        });
    }

    /**
     * Event类，结合gmu.event一起使用, 可以使任何对象具有事件行为。包含基本`preventDefault()`, `stopPropagation()`方法。
     * 考虑到此事件没有Dom冒泡概念，所以没有`stopImmediatePropagation()`方法。而`stopProgapation()`的作用就是
     * 让之后的handler都不执行。
     *
     * @class Event
     * @constructor
     * ```javascript
     * var obj = {};
     *
     * $.extend( obj, gmu.event );
     *
     * var etv = gmu.Event( 'beforeshow' );
     * obj.trigger( etv );
     *
     * if ( etv.isDefaultPrevented() ) {
     *     console.log( 'before show has been prevented!' );
     * }
     * ```
     * @grammar new gmu.Event( name[, props]) => instance
     * @param {String} type 事件名字
     * @param {Object} [props] 属性对象，将被复制进event对象。
     */
    function Event( type, props ) {
        if ( !(this instanceof Event) ) {
            return new Event( type, props );
        }

        props && $.extend( this, props );
        this.type = type;

        return this;
    }

    Event.prototype = {

        /**
         * @method isDefaultPrevented
         * @grammar e.isDefaultPrevented() => Boolean
         * @desc 判断此事件是否被阻止
         */
        isDefaultPrevented: returnFalse,

        /**
         * @method isPropagationStopped
         * @grammar e.isPropagationStopped() => Boolean
         * @desc 判断此事件是否被停止蔓延
         */
        isPropagationStopped: returnFalse,

        /**
         * @method preventDefault
         * @grammar e.preventDefault() => undefined
         * @desc 阻止事件默认行为
         */
        preventDefault: function() {
            this.isDefaultPrevented = returnTrue;
        },

        /**
         * @method stopPropagation
         * @grammar e.stopPropagation() => undefined
         * @desc 阻止事件蔓延
         */
        stopPropagation: function() {
            this.isPropagationStopped = returnTrue;
        }
    };

    /**
     * @class event
     * @static
     * @description event对象，包含一套event操作方法。可以将此对象扩张到任意对象，来增加事件行为。
     *
     * ```javascript
     * var myobj = {};
     *
     * $.extend( myobj, gmu.event );
     *
     * myobj.on( 'eventname', function( e, var1, var2, var3 ) {
     *     console.log( 'event handler' );
     *     console.log( var1, var2, var3 );    // =>1 2 3
     * } );
     *
     * myobj.trigger( 'eventname', 1, 2, 3 );
     * ```
     */
    gmu.event = {

        /**
         * 绑定事件。
         * @method on
         * @grammar on( name, fn[, context] ) => self
         * @param  {String}   name     事件名
         * @param  {Function} callback 事件处理器
         * @param  {Object}   context  事件处理器的上下文。
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        on: function( name, callback, context ) {
            var me = this,
                set;

            if ( !callback ) {
                return this;
            }

            set = this._events || (this._events = []);

            eachEvent( name, callback, function( name, callback ) {
                var handler = parse( name );

                handler.cb = callback;
                handler.ctx = context;
                handler.ctx2 = context || me;
                handler.id = set.length;
                set.push( handler );
            } );

            return this;
        },

        /**
         * 绑定事件，且当handler执行完后，自动解除绑定。
         * @method one
         * @grammar one( name, fn[, context] ) => self
         * @param  {String}   name     事件名
         * @param  {Function} callback 事件处理器
         * @param  {Object}   context  事件处理器的上下文。
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        one: function( name, callback, context ) {
            var me = this;

            if ( !callback ) {
                return this;
            }

            eachEvent( name, callback, function( name, callback ) {
                var once = function() {
                        me.off( name, once );
                        return callback.apply( context || me, arguments );
                    };

                once._cb = callback;
                me.on( name, once, context );
            } );

            return this;
        },

        /**
         * 解除事件绑定
         * @method off
         * @grammar off( name[, fn[, context] ] ) => self
         * @param  {String}   name     事件名
         * @param  {Function} callback 事件处理器
         * @param  {Object}   context  事件处理器的上下文。
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        off: function( name, callback, context ) {
            var events = this._events;

            if ( !events ) {
                return this;
            }

            if ( !name && !callback && !context ) {
                this._events = [];
                return this;
            }

            eachEvent( name, callback, function( name, callback ) {
                findHandlers( events, name, callback, context )
                        .forEach(function( handler ) {
                            delete events[ handler.id ];
                        });
            } );

            return this;
        },

        /**
         * 触发事件
         * @method trigger
         * @grammar trigger( name[, ...] ) => self
         * @param  {String | Event }   evt     事件名或gmu.Event对象实例
         * @param  {*} * 任意参数
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        trigger: function( evt ) {
            var i = -1,
                args,
                events,
                stoped,
                len,
                ev;

            if ( !this._events || !evt ) {
                return this;
            }

            typeof evt === 'string' && (evt = new Event( evt ));

            args = slice.call( arguments, 1 );
            evt.args = args;    // handler中可以直接通过e.args获取trigger数据
            args.unshift( evt );

            events = findHandlers( this._events, evt.type );

            if ( events ) {
                len = events.length;

                while ( ++i < len ) {
                    if ( (stoped = evt.isPropagationStopped()) ||  false ===
                            (ev = events[ i ]).cb.apply( ev.ctx2, args )
                            ) {

                        // 如果return false则相当于stopPropagation()和preventDefault();
                        stoped || (evt.stopPropagation(), evt.preventDefault());
                        break;
                    }
                }
            }

            return this;
        }
    };

    // expose
    gmu.Event = Event;
})( gmu, gmu.$ );/**
 * @file gmu底层，定义了创建gmu组件的方法
 * @import core/gmu.js, core/event.js, extend/parseTpl.js
 * @module GMU
 */

(function( gmu, $, undefined ) {
    var slice = [].slice,
        toString = Object.prototype.toString,
        blankFn = function() {},

        // 挂到组件类上的属性、方法
        staticlist = [ 'options', 'template', 'tpl2html' ],

        // 存储和读取数据到指定对象，任何对象包括dom对象
        // 注意：数据不直接存储在object上，而是存在内部闭包中，通过_gid关联
        // record( object, key ) 获取object对应的key值
        // record( object, key, value ) 设置object对应的key值
        // record( object, key, null ) 删除数据
        record = (function() {
            var data = {},
                id = 0,
                ikey = '_gid';    // internal key.

            return function( obj, key, val ) {
                var dkey = obj[ ikey ] || (obj[ ikey ] = ++id),
                    store = data[ dkey ] || (data[ dkey ] = {});

                val !== undefined && (store[ key ] = val);
                val === null && delete store[ key ];

                return store[ key ];
            };
        })(),

        event = gmu.event;

    function isPlainObject( obj ) {
        return toString.call( obj ) === '[object Object]';
    }

    // 遍历对象
    function eachObject( obj, iterator ) {
        obj && Object.keys( obj ).forEach(function( key ) {
            iterator( key, obj[ key ] );
        });
    }

    // 从某个元素上读取某个属性。
    function parseData( data ) {
        try {    // JSON.parse可能报错

            // 当data===null表示，没有此属性
            data = data === 'true' ? true :
                    data === 'false' ? false : data === 'null' ? null :

                    // 如果是数字类型，则将字符串类型转成数字类型
                    +data + '' === data ? +data :
                    /(?:\{[\s\S]*\}|\[[\s\S]*\])$/.test( data ) ?
                    JSON.parse( data ) : data;
        } catch ( ex ) {
            data = undefined;
        }

        return data;
    }

    // 从DOM节点上获取配置项
    function getDomOptions( el ) {
        var ret = {},
            attrs = el && el.attributes,
            len = attrs && attrs.length,
            key,
            data;

        while ( len-- ) {
            data = attrs[ len ];
            key = data.name;

            if ( key.substring(0, 5) !== 'data-' ) {
                continue;
            }

            key = key.substring( 5 );
            data = parseData( data.value );

            data === undefined || (ret[ key ] = data);
        }

        return ret;
    }

    // 在$.fn上挂对应的组件方法呢
    // $('#btn').button( options );实例化组件
    // $('#btn').button( 'select' ); 调用实例方法
    // $('#btn').button( 'this' ); 取组件实例
    // 此方法遵循get first set all原则
    function zeptolize( name ) {
        var key = name.substring( 0, 1 ).toLowerCase() + name.substring( 1 ),
            old = $.fn[ key ];

        $.fn[ key ] = function( opts ) {
            var args = slice.call( arguments, 1 ),
                method = typeof opts === 'string' && opts,
                ret,
                obj;

            $.each( this, function( i, el ) {

                // 从缓存中取，没有则创建一个
                obj = record( el, name ) || new gmu[ name ]( el,
                        isPlainObject( opts ) ? opts : undefined );

                // 取实例
                if ( method === 'this' ) {
                    ret = obj;
                    return false;    // 断开each循环
                } else if ( method ) {

                    // 当取的方法不存在时，抛出错误信息
                    if ( !$.isFunction( obj[ method ] ) ) {
                        throw new Error( '组件没有此方法：' + method );
                    }

                    ret = obj[ method ].apply( obj, args );

                    // 断定它是getter性质的方法，所以需要断开each循环，把结果返回
                    if ( ret !== undefined && ret !== obj ) {
                        return false;
                    }

                    // ret为obj时为无效值，为了不影响后面的返回
                    ret = undefined;
                }
            } );

            return ret !== undefined ? ret : this;
        };

        /*
         * NO CONFLICT
         * var gmuPanel = $.fn.panel.noConflict();
         * gmuPanel.call(test, 'fnname');
         */
        $.fn[ key ].noConflict = function() {
            $.fn[ key ] = old;
            return this;
        };
    }

    // 加载注册的option
    function loadOption( klass, opts ) {
        var me = this;

        // 先加载父级的
        if ( klass.superClass ) {
            loadOption.call( me, klass.superClass, opts );
        }

        eachObject( record( klass, 'options' ), function( key, option ) {
            option.forEach(function( item ) {
                var condition = item[ 0 ],
                    fn = item[ 1 ];

                if ( condition === '*' ||
                        ($.isFunction( condition ) &&
                        condition.call( me, opts[ key ] )) ||
                        condition === opts[ key ] ) {

                    fn.call( me );
                }
            });
        } );
    }

    // 加载注册的插件
    function loadPlugins( klass, opts ) {
        var me = this;

        // 先加载父级的
        if ( klass.superClass ) {
            loadPlugins.call( me, klass.superClass, opts );
        }

        eachObject( record( klass, 'plugins' ), function( opt, plugin ) {

            // 如果配置项关闭了，则不启用此插件
            if ( opts[ opt ] === false ) {
                return;
            }

            eachObject( plugin, function( key, val ) {
                var oringFn;

                if ( $.isFunction( val ) && (oringFn = me[ key ]) ) {
                    me[ key ] = function() {
                        var origin = me.origin,
                            ret;

                        me.origin = oringFn;
                        ret = val.apply( me, arguments );
                        origin === undefined ? delete me.origin :
                                (me.origin = origin);

                        return ret;
                    };
                } else {
                    me[ key ] = val;
                }
            } );

            plugin._init.call( me );
        } );
    }

    // 合并对象
    function mergeObj() {
        var args = slice.call( arguments ),
            i = args.length,
            last;

        while ( i-- ) {
            last = last || args[ i ];
            isPlainObject( args[ i ] ) || args.splice( i, 1 );
        }

        return args.length ?
                $.extend.apply( null, [ true, {} ].concat( args ) ) : last; // 深拷贝，options中某项为object时，用例中不能用==判断
    }

    // 初始化widget. 隐藏具体细节，因为如果放在构造器中的话，是可以看到方法体内容的
    // 同时此方法可以公用。
    function bootstrap( name, klass, uid, el, options ) {
        var me = this,
            opts;

        if ( isPlainObject( el ) ) {
            options = el;
            el = undefined;
        }

        // options中存在el时，覆盖el
        options && options.el && (el = $( options.el ));
        el && (me.$el = $( el ), el = me.$el[ 0 ]);

        opts = me._options = mergeObj( klass.options,
                getDomOptions( el ), options );

        me.template = mergeObj( klass.template, opts.template );

        me.tpl2html = mergeObj( klass.tpl2html, opts.tpl2html );

        // 生成eventNs widgetName
        me.widgetName = name.toLowerCase();
        me.eventNs = '.' + me.widgetName + uid;

        me._init( opts );

        // 设置setup参数，只有传入的$el在DOM中，才认为是setup模式
        me._options.setup = (me.$el && me.$el.parent()[ 0 ]) ? true: false;

        loadOption.call( me, klass, opts );
        loadPlugins.call( me, klass, opts );

        // 进行创建DOM等操作
        me._create();
        me.trigger( 'ready' );

        el && record( el, name, me ) && me.on( 'destroy', function() {
            record( el, name, null );
        } );

        return me;
    }

    /**
     * @desc 创建一个类，构造函数默认为init方法, superClass默认为Base
     * @name createClass
     * @grammar createClass(object[, superClass]) => fn
     */
    function createClass( name, object, superClass ) {
        if ( typeof superClass !== 'function' ) {
            superClass = gmu.Base;
        }

        var uuid = 1,
            suid = 1;

        function klass( el, options ) {
            if ( name === 'Base' ) {
                throw new Error( 'Base类不能直接实例化' );
            }

            if ( !(this instanceof klass) ) {
                return new klass( el, options );
            }

            return bootstrap.call( this, name, klass, uuid++, el, options );
        }

        $.extend( klass, {

            /**
             * @name register
             * @grammar klass.register({})
             * @desc 注册插件
             */
            register: function( name, obj ) {
                var plugins = record( klass, 'plugins' ) ||
                        record( klass, 'plugins', {} );

                obj._init = obj._init || blankFn;

                plugins[ name ] = obj;
                return klass;
            },

            /**
             * @name option
             * @grammar klass.option(option, value, method)
             * @desc 扩充组件的配置项
             */
            option: function( option, value, method ) {
                var options = record( klass, 'options' ) ||
                        record( klass, 'options', {} );

                options[ option ] || (options[ option ] = []);
                options[ option ].push([ value, method ]);

                return klass;
            },

            /**
             * @name inherits
             * @grammar klass.inherits({})
             * @desc 从该类继承出一个子类，不会被挂到gmu命名空间
             */
            inherits: function( obj ) {

                // 生成 Sub class
                return createClass( name + 'Sub' + suid++, obj, klass );
            },

            /**
             * @name extend
             * @grammar klass.extend({})
             * @desc 扩充现有组件
             */
            extend: function( obj ) {
                var proto = klass.prototype,
                    superProto = superClass.prototype;

                staticlist.forEach(function( item ) {
                    obj[ item ] = mergeObj( superClass[ item ], obj[ item ] );
                    obj[ item ] && (klass[ item ] = obj[ item ]);
                    delete obj[ item ];
                });

                // todo 跟plugin的origin逻辑，公用一下
                eachObject( obj, function( key, val ) {
                    if ( typeof val === 'function' && superProto[ key ] ) {
                        proto[ key ] = function() {
                            var $super = this.$super,
                                ret;

                            // todo 直接让this.$super = superProto[ key ];
                            this.$super = function() {
                                var args = slice.call( arguments, 1 );
                                return superProto[ key ].apply( this, args );
                            };

                            ret = val.apply( this, arguments );

                            $super === undefined ? (delete this.$super) :
                                    (this.$super = $super);
                            return ret;
                        };
                    } else {
                        proto[ key ] = val;
                    }
                } );
            }
        } );

        klass.superClass = superClass;
        klass.prototype = Object.create( superClass.prototype );


        /*// 可以在方法中通过this.$super(name)方法调用父级方法。如：this.$super('enable');
        object.$super = function( name ) {
            var fn = superClass.prototype[ name ];
            return $.isFunction( fn ) && fn.apply( this,
                    slice.call( arguments, 1 ) );
        };*/

        klass.extend( object );

        return klass;
    }

    /**
     * @method define
     * @grammar gmu.define( name, object[, superClass] )
     * @class
     * @param {String} name 组件名字标识符。
     * @param {Object} object
     * @desc 定义一个gmu组件
     * @example
     * ####组件定义
     * ```javascript
     * gmu.define( 'Button', {
     *     _create: function() {
     *         var $el = this.getEl();
     *
     *         $el.addClass( 'ui-btn' );
     *     },
     *
     *     show: function() {
     *         console.log( 'show' );
     *     }
     * } );
     * ```
     *
     * ####组件使用
     * html部分
     * ```html
     * <a id='btn'>按钮</a>
     * ```
     *
     * javascript部分
     * ```javascript
     * var btn = $('#btn').button();
     *
     * btn.show();    // => show
     * ```
     *
     */
    gmu.define = function( name, object, superClass ) {
        gmu[ name ] = createClass( name, object, superClass );
        zeptolize( name );
    };

    /**
     * @desc 判断object是不是 widget实例, klass不传时，默认为Base基类
     * @method isWidget
     * @grammar gmu.isWidget( anything[, klass] ) => Boolean
     * @param {*} anything 需要判断的对象
     * @param {String|Class} klass 字符串或者类。
     * @example
     * var a = new gmu.Button();
     *
     * console.log( gmu.isWidget( a ) );    // => true
     * console.log( gmu.isWidget( a, 'Dropmenu' ) );    // => false
     */
    gmu.isWidget = function( obj, klass ) {

        // 处理字符串的case
        klass = typeof klass === 'string' ? gmu[ klass ] || blankFn : klass;
        klass = klass || gmu.Base;
        return obj instanceof klass;
    };

    /**
     * @class Base
     * @description widget基类。不能直接使用。
     */
    gmu.Base = createClass( 'Base', {

        /**
         * @method _init
         * @grammar instance._init() => instance
         * @desc 组件的初始化方法，子类需要重写该方法
         */
        _init: blankFn,

        /**
         * @override
         * @method _create
         * @grammar instance._create() => instance
         * @desc 组件创建DOM的方法，子类需要重写该方法
         */
        _create: blankFn,


        /**
         * @method getEl
         * @grammar instance.getEl() => $el
         * @desc 返回组件的$el
         */
        getEl: function() {
            return this.$el;
        },

        /**
         * @method on
         * @grammar instance.on(name, callback, context) => self
         * @desc 订阅事件
         */
        on: event.on,

        /**
         * @method one
         * @grammar instance.one(name, callback, context) => self
         * @desc 订阅事件（只执行一次）
         */
        one: event.one,

        /**
         * @method off
         * @grammar instance.off(name, callback, context) => self
         * @desc 解除订阅事件
         */
        off: event.off,

        /**
         * @method trigger
         * @grammar instance.trigger( name ) => self
         * @desc 派发事件, 此trigger会优先把options上的事件回调函数先执行
         * options上回调函数可以通过调用event.stopPropagation()来阻止事件系统继续派发,
         * 或者调用event.preventDefault()阻止后续事件执行
         */
        trigger: function( name ) {
            var evt = typeof name === 'string' ? new gmu.Event( name ) : name,
                args = [ evt ].concat( slice.call( arguments, 1 ) ),
                opEvent = this._options[ evt.type ],

                // 先存起来，否则在下面使用的时候，可能已经被destory给删除了。
                $el = this.getEl();

            if ( opEvent && $.isFunction( opEvent ) ) {

                // 如果返回值是false,相当于执行stopPropagation()和preventDefault();
                false === opEvent.apply( this, args ) &&
                        (evt.stopPropagation(), evt.preventDefault());
            }

            event.trigger.apply( this, args );

            // triggerHandler不冒泡
            $el && $el.triggerHandler( evt, (args.shift(), args) );

            return this;
        },

        /**
         * @method tpl2html
         * @grammar instance.tpl2html() => String
         * @grammar instance.tpl2html( data ) => String
         * @grammar instance.tpl2html( subpart, data ) => String
         * @desc 将template输出成html字符串，当传入 data 时，html将通过$.parseTpl渲染。
         * template支持指定subpart, 当无subpart时，template本身将为模板，当有subpart时，
         * template[subpart]将作为模板输出。
         */
        tpl2html: function( subpart, data ) {
            var tpl = this.template;

            tpl =  typeof subpart === 'string' ? tpl[ subpart ] :
                    ((data = subpart), tpl);

            return data || ~tpl.indexOf( '<%' ) ? $.parseTpl( tpl, data ) : tpl;
        },

        /**
         * @method destroy
         * @grammar instance.destroy()
         * @desc 注销组件
         */
        destroy: function() {

            // 解绑element上的事件
            this.$el && this.$el.off( this.eventNs );

            this.trigger( 'destroy' );
            // 解绑所有自定义事件
            this.off();


            this.destroyed = true;
        }

    }, Object );

    // 向下兼容
    $.ui = gmu;
})( gmu, gmu.$ );/**
 * @file 图片轮播组件
 * @import extend/touch.js, extend/event.ortchange.js, core/widget.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    var cssPrefix = $.fx.cssPrefix,
        transitionEnd = $.fx.transitionEnd,

        // todo 检测3d是否支持。
        translateZ = ' translateZ(0)';
    
    /**
     * 图片轮播组件
     *
     * @class Slider
     * @constructor Html部分
     * ```html
     * <div id="slider">
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image1.png"></a>
     *       <p>1,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image2.png"></a>
     *       <p>2,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image3.png"></a>
     *       <p>3,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image4.png"></a>
     *       <p>4,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#slider').slider();
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Slider的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Slider:options)
     * @grammar $( el ).slider( options ) => zepto
     * @grammar new gmu.Slider( el, options ) => instance
     */
    gmu.define( 'Slider', {

        options: {

            /**
             * @property {Boolean} [loop=false] 是否连续滑动
             * @namespace options
             */
            loop: false,
            
            /**
             * @property {Number} [speed=400] 动画执行速度
             * @namespace options
             */
            speed: 400,

            /**
             * @property {Number} [index=0] 初始位置
             * @namespace options
             */
            index: 0,

            /**
             * @property {Object} [selector={container:'.ui-slider-group'}] 内部结构选择器定义
             * @namespace options
             */
            selector: {
                container: '.ui-slider-group'    // 容器的选择器
            }
        },

        template: {
            item: '<div class="ui-slider-item"><a href="<%= href %>">' +
                    '<img src="<%= pic %>" alt="" /></a>' +
                    '<% if( title ) { %><p><%= title %></p><% } %>' +
                    '</div>'
        },

        _create: function() {
            var me = this,
                $el = me.getEl(),
                opts = me._options;

            me.index = opts.index;

            // 初始dom结构
            me._initDom( $el, opts );

            // 更新width
            me._initWidth( $el, me.index );
            me._container.on( transitionEnd + me.eventNs,
                    $.proxy( me._tansitionEnd, me ) );

            // 转屏事件检测
            $( window ).on( 'ortchange' + me.eventNs, function() {
                me._initWidth( $el, me.index );
            } );
        },

        _initDom: function( $el, opts ) {
            var selector = opts.selector,
                viewNum = opts.viewNum || 1,
                items,
                container;

            // 检测容器节点是否指定
            container = $el.find( selector.container );

            // 没有指定容器则创建容器
            if ( !container.length ) {
                container = $( '<div></div>' );

                // 如果没有传入content, 则将root的孩子作为可滚动item
                if ( !opts.content ) {

                    // 特殊处理直接用ul初始化slider的case
                    if ( $el.is( 'ul' ) ) {
                        this.$el = container.insertAfter( $el );
                        container = $el;
                        $el = this.$el;
                    } else {
                        container.append( $el.children() );
                    }
                } else {
                    this._createItems( container, opts.content );
                }

                container.appendTo( $el );
            }

            // 检测是否构成循环条件
            if ( (items = container.children()).length < viewNum + 1 ) {
                opts.loop = false;
            }

            // 如果节点少了，需要复制几份
            while ( opts.loop && container.children().length < 3 * viewNum ) {
                container.append( items.clone() );
            }

            this.length = container.children().length;

            this._items = (this._container = container)
                    .addClass( 'ui-slider-group' )
                    .children()
                    .addClass( 'ui-slider-item' )
                    .toArray();

            this.trigger( 'done.dom', $el.addClass( 'ui-slider' ), opts );
        },

        // 根据items里面的数据挨个render插入到container中
        _createItems: function( container, items ) {
            var i = 0,
                len = items.length;

            for ( ; i < len; i++ ) {
                container.append( this.tpl2html( 'item', items[ i ] ) );
            }
        },

        _initWidth: function( $el, index, force ) {
            var me = this,
                width;

            // width没有变化不需要重排
            if ( !force && (width = $el.width()) === me.width ) {
                return;
            }

            me.width = width;
            me._arrange( width, index );
            me.height = $el.height();
            me.trigger( 'width.change' );
        },

        // 重排items
        _arrange: function( width, index ) {
            var items = this._items,
                i = 0,
                item,
                len;

            this._slidePos = new Array( items.length );

            for ( len = items.length; i < len; i++ ) {
                item = items[ i ];
                
                item.style.cssText += 'width:' + width + 'px;' +
                        'left:' + (i * -width) + 'px;';
                item.setAttribute( 'data-index', i );

                this._move( i, i < index ? -width : i > index ? width : 0, 0 );
            }

            this._container.css( 'width', width * len );
        },

        _move: function( index, dist, speed, immediate ) {
            var slidePos = this._slidePos,
                items = this._items;

            if ( slidePos[ index ] === dist || !items[ index ] ) {
                return;
            }

            this._translate( index, dist, speed );
            slidePos[ index ] = dist;    // 记录目标位置

            // 强制一个reflow
            immediate && items[ index ].clientLeft;
        },

        _translate: function( index, dist, speed ) {
            var slide = this._items[ index ],
                style = slide && slide.style;

            if ( !style ) {
                return false;
            }

            style.cssText += cssPrefix + 'transition-duration:' + speed + 
                    'ms;' + cssPrefix + 'transform: translate(' + 
                    dist + 'px, 0)' + translateZ + ';';
        },

        _circle: function( index, arr ) {
            var len;

            arr = arr || this._items;
            len = arr.length;

            return (index % len + len) % arr.length;
        },

        _tansitionEnd: function( e ) {

            // ~~用来类型转换，等价于parseInt( str, 10 );
            if ( ~~e.target.getAttribute( 'data-index' ) !== this.index ) {
                return;
            }
            
            this.trigger( 'slideend', this.index );
        },

        _slide: function( from, diff, dir, width, speed, opts ) {
            var me = this,
                to;

            to = me._circle( from - dir * diff );

            // 如果不是loop模式，以实际位置的方向为准
            if ( !opts.loop ) {
                dir = Math.abs( from - to ) / (from - to);
            }
            
            // 调整初始位置，如果已经在位置上不会重复处理
            this._move( to, -dir * width, 0, true );

            this._move( from, width * dir, speed );
            this._move( to, 0, speed );

            this.index = to;
            return this.trigger( 'slide', to, from );
        },

        /**
         * 切换到第几个slide
         * @method slideTo
         * @chainable
         * @param {Number} to 目标slide的序号
         * @param {Number} [speed] 切换的速度
         * @return {self} 返回本身
         */
        slideTo: function( to, speed ) {
            if ( this.index === to || this.index === this._circle( to ) ) {
                return this;
            }

            var opts = this._options,
                index = this.index,
                diff = Math.abs( index - to ),
                
                // 1向左，-1向右
                dir = diff / (index - to),
                width = this.width;

            speed = speed || opts.speed;

            return this._slide( index, diff, dir, width, speed, opts );
        },

        /**
         * 切换到上一个slide
         * @method prev
         * @chainable
         * @return {self} 返回本身
         */
        prev: function() {
            
            if ( this._options.loop || this.index > 0 ) {
                this.slideTo( this.index - 1 );
            }

            return this;
        },

        /**
         * 切换到下一个slide
         * @method next
         * @chainable
         * @return {self} 返回本身
         */
        next: function() {
            
            if ( this._options.loop || this.index + 1 < this.length ) {
                this.slideTo( this.index + 1 );
            }

            return this;
        },

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        getIndex: function() {
            return this.index;
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            this._container.off( this.eventNs );
            $( window ).off( 'ortchange' + this.eventNs );
            return this.$super( 'destroy' );
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event done.dom
         * @param {Event} e gmu.Event对象
         * @param {Zepto} $el slider元素
         * @param {Object} opts 组件初始化时的配置项
         * @description DOM创建完成后触发
         */
        
        /**
         * @event width.change
         * @param {Event} e gmu.Event对象
         * @description slider容器宽度发生变化时触发
         */
        
        /**
         * @event slideend
         * @param {Event} e gmu.Event对象
         * @param {Number} index 当前slide的序号
         * @description slide切换完成后触发
         */
        
        /**
         * @event slide
         * @param {Event} e gmu.Event对象
         * @param {Number} to 目标slide的序号
         * @param {Number} from 当前slide的序号
         * @description slide切换时触发（如果切换时有动画，此事件触发时，slide不一定已经完成切换）
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );

})( gmu, gmu.$ );/**
 * @file 图片轮播显示点功能
 * @import widget/slider/slider.js
 */
(function( gmu, $, undefined ) {
    $.extend( true, gmu.Slider, {

        template: {
            dots: '<p class="ui-slider-dots"><%= new Array( len + 1 )' +
                    '.join("<b></b>") %></p>'
        },

        options: {

            /**
             * @property {Boolean} [dots=true] 是否显示点
             * @namespace options
             * @for Slider
             * @uses Slider.dots
             */
            dots: true,

            /**
             * @property {Object} [selector={dots:'.ui-slider-dots'}] 所有点父级的选择器
             * @namespace options
             * @for Slider
             * @uses Slider.dots
             */
            selector: {
                dots: '.ui-slider-dots'
            }
        }
    } );

    /**
     * 图片轮播显示点功能
     * @class dots
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.option( 'dots', true, function() {
        
        var updateDots = function( to, from ) {
            var dots = this._dots;

            typeof from === 'undefined' || gmu.staticCall( dots[
                from % this.length ], 'removeClass', 'ui-state-active' );
            
            gmu.staticCall( dots[ to % this.length ], 'addClass',
                    'ui-state-active' );
        };

        this.on( 'done.dom', function( e, $el, opts ) {
            var dots = $el.find( opts.selector.dots );

            if ( !dots.length ) {
                dots = this.tpl2html( 'dots', {
                    len: this.length
                } );
                
                dots = $( dots ).appendTo( $el );
            }

            this._dots = dots.children().toArray();
        } );

        this.on( 'slide', function( e, to, from ) {
            updateDots.call( this, to, from );
        } );

        this.on( 'ready', function() {
            updateDots.call( this, this.index );
        } );
    } );
})( gmu, gmu.$ );/**
 * @file 图片轮播手指跟随插件
 * @import widget/slider/slider.js
 */
(function( gmu, $, undefined ) {
    
    var map = {
            touchstart: '_onStart',
            touchmove: '_onMove',
            touchend: '_onEnd',
            touchcancel: '_onEnd',
            click: '_onClick'
        },

        isScrolling,
        start,
        delta,
        moved;

    // 提供默认options
    $.extend( gmu.Slider.options, {

        /**
         * @property {Boolean} [stopPropagation=false] 是否阻止事件冒泡
         * @namespace options
         * @for Slider
         * @uses Slider.touch
         */
        stopPropagation: false,

        /**
         * @property {Boolean} [disableScroll=false] 是否阻止滚动
         * @namespace options
         * @for Slider
         * @uses Slider.touch
         */
        disableScroll: false
    } );

    /**
     * 图片轮播手指跟随插件
     * @class touch
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.register( 'touch', {
        _init: function() {
            var me = this,
                $el = me.getEl();

            me._handler = function( e ) {
                me._options.stopPropagation && e.stopPropagation();
                return map[ e.type ] && me[ map[ e.type ] ].call( me, e );
            };

            me.on( 'ready', function() {

                // 绑定手势
                $el.on( 'touchstart' + me.eventNs, me._handler );
                
                // 阻止误点击, 犹豫touchmove被preventDefault了，导致长按也会触发click
                me._container.on( 'click' + me.eventNs, me._handler );
            } );
        },

        _onClick: function() {
            return !moved;
        },

        _onStart: function( e ) {
                
            // 不处理多指
            if ( e.touches.length > 1 ) {
                return false;
            }

            var me = this,
                touche = e.touches[ 0 ],
                opts = me._options,
                eventNs = me.eventNs,
                num;

            start = {
                x: touche.pageX,
                y: touche.pageY,
                time: +new Date()
            };

            delta = {};
            moved = false;
            isScrolling = undefined;

            num = opts.viewNum || 1;
            me._move( opts.loop ? me._circle( me.index - num ) :
                    me.index - num, -me.width, 0, true );
            me._move( opts.loop ? me._circle( me.index + num ) :
                    me.index + num, me.width, 0, true );

            me.$el.on( 'touchmove' + eventNs + ' touchend' + eventNs +
                    ' touchcancel' + eventNs, me._handler );
        },

        _onMove: function( e ) {

            // 多指或缩放不处理
            if ( e.touches.length > 1 || e.scale &&
                    e.scale !== 1 ) {
                return false;
            }

            var opts = this._options,
                viewNum = opts.viewNum || 1,
                touche = e.touches[ 0 ],
                index = this.index,
                i,
                len,
                pos,
                slidePos;

            opts.disableScroll && e.preventDefault();

            delta.x = touche.pageX - start.x;
            delta.y = touche.pageY - start.y;

            if ( typeof isScrolling === 'undefined' ) {
                isScrolling = Math.abs( delta.x ) <
                        Math.abs( delta.y );
            }

            if ( !isScrolling ) {
                e.preventDefault();

                if ( !opts.loop ) {

                    // 如果左边已经到头
                    delta.x /= (!index && delta.x > 0 ||

                            // 如果右边到头
                            index === this._items.length - 1 && 
                            delta.x < 0) ?

                            // 则来一定的减速
                            (Math.abs( delta.x ) / this.width + 1) : 1;
                }

                slidePos = this._slidePos;

                for ( i = index - viewNum, len = index + 2 * viewNum;
                        i < len; i++ ) {

                    pos = opts.loop ? this._circle( i ) : i;
                    this._translate( pos, delta.x + slidePos[ pos ], 0 );
                }

                moved = true;
            }
        },

        _onEnd: function() {

            // 解除事件
            this.$el.off( 'touchmove' + this.eventNs + ' touchend' +
                    this.eventNs + ' touchcancel' + this.eventNs,
                    this._handler );

            if ( !moved ) {
                return;
            }

            var me = this,
                opts = me._options,
                viewNum = opts.viewNum || 1,
                index = me.index,
                slidePos = me._slidePos,
                duration = +new Date() - start.time,
                absDeltaX = Math.abs( delta.x ),

                // 是否滑出边界
                isPastBounds = !opts.loop && (!index && delta.x > 0 ||
                    index === slidePos.length - viewNum && delta.x < 0),

                // -1 向右 1 向左
                dir = delta.x > 0 ? 1 : -1,
                speed,
                diff,
                i,
                len,
                pos;

            if ( duration < 250 ) {

                // 如果滑动速度比较快，偏移量跟根据速度来算
                speed = absDeltaX / duration;
                diff = Math.min( Math.round( speed * viewNum * 1.2 ),
                        viewNum );
            } else {
                diff = Math.round( absDeltaX / (me.perWidth || me.width) );
            }
            
            if ( diff && !isPastBounds ) {
                me._slide( index, diff, dir, me.width, opts.speed,
                        opts, true );
                
                // 在以下情况，需要多移动一张
                if ( viewNum > 1 && duration >= 250 &&
                        Math.ceil( absDeltaX / me.perWidth ) !== diff ) {

                    me.index < index ? me._move( me.index - 1, -me.perWidth,
                            opts.speed ) : me._move( me.index + viewNum,
                            me.width, opts.speed );
                }
            } else {
                
                // 滑回去
                for ( i = index - viewNum, len = index + 2 * viewNum;
                    i < len; i++ ) {

                    pos = opts.loop ? me._circle( i ) : i;
                    me._translate( pos, slidePos[ pos ], 
                            opts.speed );
                }
            }
        }
    } );
})( gmu, gmu.$ );/**
 * @file 自动播放插件
 * @import widget/slider/slider.js
 */
(function( gmu, $ ) {
    $.extend( true, gmu.Slider, {
        options: {
            /**
             * @property {Boolean} [autoPlay=true] 是否开启自动播放
             * @namespace options
             * @for Slider
             * @uses Slider.autoplay
             */
            autoPlay: true,
            /**
             * @property {Number} [interval=4000] 自动播放的间隔时间（毫秒）
             * @namespace options
             * @for Slider
             * @uses Slider.autoplay
             */
            interval: 4000
        }
    } );

    /**
     * 自动播放插件
     * @class autoplay
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.register( 'autoplay', {
        _init: function() {
            var me = this;
            me.on( 'slideend ready', me.resume )

                    // 清除timer
                    .on( 'destory', me.stop );

            // 避免滑动时，自动切换
            me.getEl()
                    .on( 'touchstart' + me.eventNs, $.proxy( me.stop, me ) )
                    .on( 'touchend' + me.eventNs, $.proxy( me.resume, me ) );
        },

        /**
         * 恢复自动播放。
         * @method resume
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        resume: function() {
            var me = this,
                opts = me._options;

            if ( opts.autoPlay && !me._timer ) {
                me._timer = setTimeout( function() {
                    me.slideTo( me.index + 1 );
                    me._timer = null;
                }, opts.interval );
            }
            return me;
        },

        /**
         * 停止自动播放
         * @method stop
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        stop: function() {
            var me = this;

            if ( me._timer ) {
                clearTimeout( me._timer );
                me._timer = null;
            }
            return me;
        }
    } );
})( gmu, gmu.$ );/**
 * @file 图片懒加载插件
 * @import widget/slider/slider.js
 */
(function( gmu ) {

    gmu.Slider.template.item = '<div class="ui-slider-item">' +
            '<a href="<%= href %>">' +
            '<img lazyload="<%= pic %>" alt="" /></a>' +
            '<% if( title ) { %><p><%= title %></p><% } %>' +
            '</div>';

    /**
     * 图片懒加载插件
     * @class lazyloadimg
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.register( 'lazyloadimg', {
        _init: function() {
            this.on( 'ready slide', this._loadItems );
        },

        _loadItems: function() {
            var opts = this._options,
                loop = opts.loop,
                viewNum = opts.viewNum || 1,
                index = this.index,
                i,
                len;

            for ( i = index - viewNum, len = index + 2 * viewNum; i < len;
                    i++ ) {

                this.loadImage( loop ? this._circle( i ) : i );
            }
        },

        /**
         * 加载指定item中的图片
         * @method loadImage
         * @param {Number} index 要加载的图片的序号
         * @for Slider
         * @uses Slider.lazyloadimg
         */
        loadImage: function( index ) {
            var item = this._items[ index ],
                images;

            if ( !item || !(images = gmu.staticCall( item, 'find',
                    'img[lazyload]' ), images.length) ) {

                return this;
            }

            images.each(function() {
                this.src = this.getAttribute( 'lazyload' );
                this.removeAttribute( 'lazyload' );
            });
        }
    } );
})( gmu );


/*!
 * iScroll v4.2.2 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function(window, doc){
    var m = Math,_bindArr = [],
        dummyStyle = doc.createElement('div').style,
        vendor = (function () {
            var vendors = 'webkitT,MozT,msT,OT,t'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle ) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',


    // Style properties
        transform = prefixStyle('transform'),
        transitionProperty = prefixStyle('transitionProperty'),
        transitionDuration = prefixStyle('transitionDuration'),
        transformOrigin = prefixStyle('transformOrigin'),
        transitionTimingFunction = prefixStyle('transitionTimingFunction'),
        transitionDelay = prefixStyle('transitionDelay'),

    // Browser capabilities
        isAndroid = (/android/gi).test(navigator.appVersion),
        isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

        has3d = prefixStyle('perspective') in dummyStyle,
        hasTouch = 'ontouchstart' in window && !isTouchPad,
        hasTransform = !!vendor,
        hasTransitionEnd = prefixStyle('transition') in dummyStyle,

        RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
        START_EV = hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
        END_EV = hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
        TRNEND_EV = (function () {
            if ( vendor === false ) return false;

            var transitionEnd = {
                ''			: 'transitionend',
                'webkit'	: 'webkitTransitionEnd',
                'Moz'		: 'transitionend',
                'O'			: 'otransitionend',
                'ms'		: 'MSTransitionEnd'
            };

            return transitionEnd[vendor];
        })(),

        nextFrame = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) { return setTimeout(callback, 1); };
        })(),
        cancelFrame = (function () {
            return window.cancelRequestAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                clearTimeout;
        })(),

    // Helpers
        translateZ = has3d ? ' translateZ(0)' : '',

    // Constructor
        iScroll = function (el, options) {
            var that = this,
                i;

            that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
            that.wrapper.style.overflow = 'hidden';
            that.scroller = that.wrapper.children[0];

            that.translateZ = translateZ;
            // Default options
            that.options = {
                hScroll: true,
                vScroll: true,
                x: 0,
                y: 0,
                bounce: true,
                bounceLock: false,
                momentum: true,
                lockDirection: true,
                useTransform: true,
                useTransition: false,
                topOffset: 0,
                checkDOMChanges: false,		// Experimental
                handleClick: true,


                // Events
                onRefresh: null,
                onBeforeScrollStart: function (e) { e.preventDefault(); },
                onScrollStart: null,
                onBeforeScrollMove: null,
                onScrollMove: null,
                onBeforeScrollEnd: null,
                onScrollEnd: null,
                onTouchEnd: null,
                onDestroy: null

            };

            // User defined options
            for (i in options) that.options[i] = options[i];

            // Set starting position
            that.x = that.options.x;
            that.y = that.options.y;

            // Normalize options
            that.options.useTransform = hasTransform && that.options.useTransform;

            that.options.useTransition = hasTransitionEnd && that.options.useTransition;



            // Set some default styles
            that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
            that.scroller.style[transitionDuration] = '0';
            that.scroller.style[transformOrigin] = '0 0';
            if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';

            if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
            else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';



            that.refresh();

            that._bind(RESIZE_EV, window);
            that._bind(START_EV);


            if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
                that._checkDOMChanges();
            }, 500);
        };

// Prototype
    iScroll.prototype = {
        enabled: true,
        x: 0,
        y: 0,
        steps: [],
        scale: 1,
        currPageX: 0, currPageY: 0,
        pagesX: [], pagesY: [],
        aniTime: null,
        isStopScrollAction:false,

        handleEvent: function (e) {
            var that = this;
            switch(e.type) {
                case START_EV:
                    if (!hasTouch && e.button !== 0) return;
                    that._start(e);
                    break;
                case MOVE_EV: that._move(e); break;
                case END_EV:
                case CANCEL_EV: that._end(e); break;
                case RESIZE_EV: that._resize(); break;
                case TRNEND_EV: that._transitionEnd(e); break;
            }
        },

        _checkDOMChanges: function () {
            if (this.moved ||  this.animating ||
                (this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

            this.refresh();
        },

        _resize: function () {
            var that = this;
            setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
        },

        _pos: function (x, y) {
            x = this.hScroll ? x : 0;
            y = this.vScroll ? y : 0;

            if (this.options.useTransform) {
                this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
            } else {
                x = m.round(x);
                y = m.round(y);
                this.scroller.style.left = x + 'px';
                this.scroller.style.top = y + 'px';
            }

            this.x = x;
            this.y = y;

        },



        _start: function (e) {
            var that = this,
                point = hasTouch ? e.touches[0] : e,
                matrix, x, y,
                c1, c2;

            if (!that.enabled) return;

            if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

            if (that.options.useTransition ) that._transitionTime(0);

            that.moved = false;
            that.animating = false;

            that.distX = 0;
            that.distY = 0;
            that.absDistX = 0;
            that.absDistY = 0;
            that.dirX = 0;
            that.dirY = 0;
            that.isStopScrollAction = false;

            if (that.options.momentum) {
                if (that.options.useTransform) {
                    // Very lame general purpose alternative to CSSMatrix
                    matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
                    x = +matrix[4];
                    y = +matrix[5];
                } else {
                    x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
                    y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
                }

                if (m.round(x) != m.round(that.x) || m.round(y) != m.round(that.y)) {
                    that.isStopScrollAction = true;
                    if (that.options.useTransition) that._unbind(TRNEND_EV);
                    else cancelFrame(that.aniTime);
                    that.steps = [];
                    that._pos(x, y);
                    if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
                }
            }



            that.startX = that.x;
            that.startY = that.y;
            that.pointX = point.pageX;
            that.pointY = point.pageY;

            that.startTime = e.timeStamp || Date.now();

            if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

            that._bind(MOVE_EV, window);
            that._bind(END_EV, window);
            that._bind(CANCEL_EV, window);
        },

        _move: function (e) {
            var that = this,
                point = hasTouch ? e.touches[0] : e,
                deltaX = point.pageX - that.pointX,
                deltaY = point.pageY - that.pointY,
                newX = that.x + deltaX,
                newY = that.y + deltaY,

                timestamp = e.timeStamp || Date.now();

            if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

            that.pointX = point.pageX;
            that.pointY = point.pageY;

            // Slow down if outside of the boundaries
            if (newX > 0 || newX < that.maxScrollX) {
                newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
            }
            if (newY > that.minScrollY || newY < that.maxScrollY) {
                newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
            }

            that.distX += deltaX;
            that.distY += deltaY;
            that.absDistX = m.abs(that.distX);
            that.absDistY = m.abs(that.distY);

            if (that.absDistX < 6 && that.absDistY < 6) {
                return;
            }

            // Lock direction
            if (that.options.lockDirection) {
                if (that.absDistX > that.absDistY + 5) {
                    newY = that.y;
                    deltaY = 0;
                } else if (that.absDistY > that.absDistX + 5) {
                    newX = that.x;
                    deltaX = 0;
                }
            }

            that.moved = true;

            // internal for header scroll

            that._beforePos ? that._beforePos(newY, deltaY) && that._pos(newX, newY) : that._pos(newX, newY);

            that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

            if (timestamp - that.startTime > 300) {
                that.startTime = timestamp;
                that.startX = that.x;
                that.startY = that.y;
            }

            if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
        },

        _end: function (e) {
            if (hasTouch && e.touches.length !== 0) return;

            var that = this,
                point = hasTouch ? e.changedTouches[0] : e,
                target, ev,
                momentumX = { dist:0, time:0 },
                momentumY = { dist:0, time:0 },
                duration = (e.timeStamp || Date.now()) - that.startTime,
                newPosX = that.x,
                newPosY = that.y,
                newDuration;


            that._unbind(MOVE_EV, window);
            that._unbind(END_EV, window);
            that._unbind(CANCEL_EV, window);

            if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);


            if (!that.moved) {

                if (hasTouch && this.options.handleClick && !that.isStopScrollAction) {
                    that.doubleTapTimer = setTimeout(function () {
                        that.doubleTapTimer = null;

                        // Find the last touched element
                        target = point.target;
                        while (target.nodeType != 1) target = target.parentNode;

                        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
                            ev = doc.createEvent('MouseEvents');
                            ev.initMouseEvent('click', true, true, e.view, 1,
                                point.screenX, point.screenY, point.clientX, point.clientY,
                                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                                0, null);
                            ev._fake = true;
                            target.dispatchEvent(ev);
                        }
                    },  0);
                }


                that._resetPos(400);

                if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
                return;
            }

            if (duration < 300 && that.options.momentum) {
                momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
                momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

                newPosX = that.x + momentumX.dist;
                newPosY = that.y + momentumY.dist;

                if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
                if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
            }

            if (momentumX.dist || momentumY.dist) {
                newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);



                that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

                if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
                return;
            }



            that._resetPos(200);
            if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
        },

        _resetPos: function (time) {
            var that = this,
                resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
                resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

            if (resetX == that.x && resetY == that.y) {
                if (that.moved) {
                    that.moved = false;
                    if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
                    if (that._afterPos) that._afterPos();
                }

                return;
            }

            that.scrollTo(resetX, resetY, time || 0);
        },



        _transitionEnd: function (e) {
            var that = this;

            if (e.target != that.scroller) return;

            that._unbind(TRNEND_EV);

            that._startAni();
        },


        /**
         *
         * Utilities
         *
         */
        _startAni: function () {
            var that = this,
                startX = that.x, startY = that.y,
                startTime = Date.now(),
                step, easeOut,
                animate;

            if (that.animating) return;

            if (!that.steps.length) {
                that._resetPos(400);
                return;
            }

            step = that.steps.shift();

            if (step.x == startX && step.y == startY) step.time = 0;

            that.animating = true;
            that.moved = true;

            if (that.options.useTransition) {
                that._transitionTime(step.time);
                that._pos(step.x, step.y);
                that.animating = false;
                if (step.time) that._bind(TRNEND_EV);
                else that._resetPos(0);
                return;
            }

            animate = function () {
                var now = Date.now(),
                    newX, newY;

                if (now >= startTime + step.time) {
                    that._pos(step.x, step.y);
                    that.animating = false;
                    if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
                    that._startAni();
                    return;
                }

                now = (now - startTime) / step.time - 1;
                easeOut = m.sqrt(1 - now * now);
                newX = (step.x - startX) * easeOut + startX;
                newY = (step.y - startY) * easeOut + startY;
                that._pos(newX, newY);
                if (that.animating) that.aniTime = nextFrame(animate);
            };

            animate();
        },

        _transitionTime: function (time) {
            time += 'ms';
            this.scroller.style[transitionDuration] = time;

        },

        _momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
            var deceleration = 0.0006,
                speed = m.abs(dist) * (this.options.speedScale||1) / time,
                newDist = (speed * speed) / (2 * deceleration),
                newTime = 0, outsideDist = 0;

            // Proportinally reduce speed if we are outside of the boundaries
            if (dist > 0 && newDist > maxDistUpper) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistUpper = maxDistUpper + outsideDist;
                speed = speed * maxDistUpper / newDist;
                newDist = maxDistUpper;
            } else if (dist < 0 && newDist > maxDistLower) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistLower = maxDistLower + outsideDist;
                speed = speed * maxDistLower / newDist;
                newDist = maxDistLower;
            }

            newDist = newDist * (dist < 0 ? -1 : 1);
            newTime = speed / deceleration;

            return { dist: newDist, time: m.round(newTime) };
        },

        _offset: function (el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;

            while (el = el.offsetParent) {
                left -= el.offsetLeft;
                top -= el.offsetTop;
            }

            if (el != this.wrapper) {
                left *= this.scale;
                top *= this.scale;
            }

            return { left: left, top: top };
        },



        _bind: function (type, el, bubble) {
            _bindArr.concat([el || this.scroller, type, this]);
            (el || this.scroller).addEventListener(type, this, !!bubble);
        },

        _unbind: function (type, el, bubble) {
            (el || this.scroller).removeEventListener(type, this, !!bubble);
        },


        /**
         *
         * Public methods
         *
         */
        destroy: function () {
            var that = this;

            that.scroller.style[transform] = '';



            // Remove the event listeners
            that._unbind(RESIZE_EV, window);
            that._unbind(START_EV);
            that._unbind(MOVE_EV, window);
            that._unbind(END_EV, window);
            that._unbind(CANCEL_EV, window);



            if (that.options.useTransition) that._unbind(TRNEND_EV);

            if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);

            if (that.options.onDestroy) that.options.onDestroy.call(that);

            //清除所有绑定的事件
            for (var i = 0, l = _bindArr.length; i < l;) {
                _bindArr[i].removeEventListener(_bindArr[i + 1], _bindArr[i + 2]);
                _bindArr[i] = null;
                i = i + 3
            }
            _bindArr = [];

            //干掉外边的容器内容
            /*var div = doc.createElement('div');
            div.appendChild(this.wrapper);
            div.innerHTML = '';
            that.wrapper = that.scroller = div = null;*/
        },

        refresh: function () {
            var that = this,
                offset;



            that.wrapperW = that.wrapper.clientWidth || 1;
            that.wrapperH = that.wrapper.clientHeight || 1;

            that.minScrollY = -that.options.topOffset || 0;
            that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
            that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
            that.maxScrollX = that.wrapperW - that.scrollerW;
            that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
            that.dirX = 0;
            that.dirY = 0;

            if (that.options.onRefresh) that.options.onRefresh.call(that);

            that.hScroll = that.options.hScroll && that.maxScrollX < 0;
            that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);


            offset = that._offset(that.wrapper);
            that.wrapperOffsetLeft = -offset.left;
            that.wrapperOffsetTop = -offset.top;


            that.scroller.style[transitionDuration] = '0';
            that._resetPos(400);
        },

        scrollTo: function (x, y, time, relative) {
            var that = this,
                step = x,
                i, l;

            that.stop();

            if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];

            for (i=0, l=step.length; i<l; i++) {
                if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
                that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
            }

            that._startAni();
        },

        scrollToElement: function (el, time) {
            var that = this, pos;
            el = el.nodeType ? el : that.scroller.querySelector(el);
            if (!el) return;

            pos = that._offset(el);
            pos.left += that.wrapperOffsetLeft;
            pos.top += that.wrapperOffsetTop;

            pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
            pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
            time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

            that.scrollTo(pos.left, pos.top, time);
        },

        scrollToPage: function (pageX, pageY, time) {
            var that = this, x, y;

            time = time === undefined ? 400 : time;

            if (that.options.onScrollStart) that.options.onScrollStart.call(that);


            x = -that.wrapperW * pageX;
            y = -that.wrapperH * pageY;
            if (x < that.maxScrollX) x = that.maxScrollX;
            if (y < that.maxScrollY) y = that.maxScrollY;


            that.scrollTo(x, y, time);
        },

        disable: function () {
            this.stop();
            this._resetPos(0);
            this.enabled = false;

            // If disabled after touchstart we make sure that there are no left over events
            this._unbind(MOVE_EV, window);
            this._unbind(END_EV, window);
            this._unbind(CANCEL_EV, window);
        },

        enable: function () {
            this.enabled = true;
        },

        stop: function () {
            if (this.options.useTransition) this._unbind(TRNEND_EV);
            else cancelFrame(this.aniTime);
            this.steps = [];
            this.moved = false;
            this.animating = false;
        },

        isReady: function () {
            return !this.moved &&  !this.animating;
        }
    };

    function prefixStyle (style) {
        if ( vendor === '' ) return style;

        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    }

    dummyStyle = null;	// for the sake of it

    if (typeof exports !== 'undefined') exports.iScroll = iScroll;
    else window.iScroll = iScroll;

    // 给$.fn上挂iScroll方法
    (function( $, ns, undefined ){
        if(!$)return;

        var _iScroll = ns.iScroll,

            slice = [].slice,
            
            record = (function() {
                var data = {},
                    id = 0,
                    ikey = '_sid';    // internal key.

                return function( obj, val ) {
                    var key = obj[ ikey ] || (obj[ ikey ] = ++id);

                    val !== undefined && (data[ key ] = val);
                    val === null && delete data[ key ];

                    return data[ key ];
                };
            })(),

            iScroll;

        ns.iScroll = iScroll = function( el, options ){
            var args = [].slice.call( arguments, 0 ),
                ins = new _iScroll( el, options );

            record( el, ins );
            return ins;
        };
        iScroll.prototype = _iScroll.prototype;


        $.fn.iScroll = function( opts ) {
            var args = slice.call( arguments, 1 ),
                method = typeof opts === 'string' && opts,
                ret,
                obj;

            $.each( this, function( i, el ) {

                // 从缓存中取，没有则创建一个
                obj = record( el ) || iScroll( el, $.isPlainObject( opts ) ?
                        opts : undefined );

                // 取实例
                if ( method === 'this' ) {
                    ret = obj;
                    return false;    // 断开each循环
                } else if ( method ) {

                    // 当取的方法不存在时，抛出错误信息
                    if ( !$.isFunction( obj[ method ] ) ) {
                        throw new Error( 'iScroll没有此方法：' + method );
                    }

                    ret = obj[ method ].apply( obj, args );

                    // 断定它是getter性质的方法，所以需要断开each循环，把结果返回
                    if ( ret !== undefined && ret !== obj ) {
                        return false;
                    }

                    // ret为obj时为无效值，为了不影响后面的返回
                    ret = undefined;
                }
            } );

            return ret !== undefined ? ret : this;
        };

    })( window.Zepto || null, window );
})(window, document);
/**
 * Change list
 * 修改记录
 *
 * 1. 2012-08-14 解决滑动中按住停止滚动，松开后被点元素触发点击事件。
 *
 * 具体修改:
 * a. 202行 添加isStopScrollAction: false 给iScroll的原型上添加变量
 * b. 365行 _start方法里面添加that.isStopScrollAction = false; 默认让这个值为false
 * c. 390行 if (x != that.x || y != that.y)条件语句里面 添加了  that.isStopScrollAction = true; 当目标值与实际值不一致，说明还在滚动动画中
 * d. 554行 that.isStopScrollAction || (that.doubleTapTimer = setTimeout(function () {
 *          ......
 *          ......
 *          }, that.options.zoom ? 250 : 0));
 *   如果isStopScrollAction为true就不派送click事件
 *
 *
 * 2. 2012-08-14 给options里面添加speedScale属性，提供外部控制冲量滚动速度
 *
 * 具体修改
 * a. 108行 添加speedScale: 1, 给options里面添加speedScale属性，默认为1
 * b. 798行 speed = m.abs(dist) * this.options.speedScale / time, 在原来速度的基础上*speedScale来改变速度
 *
 * 3. 2012-08-21 修改部分代码，给iscroll_plugin墙用的
 *
 * 具体修改
 * a. 517行  在_pos之前，调用_beforePos,如果里面不返回true,  将不会调用_pos
 *  // internal for header scroll
 *  if (that._beforePos)
 *      that._beforePos(newY, deltaY) && that._pos(newX, newY);
 *  else
 *      that._pos(newX, newY);
 *
 * b. 680行 在滚动结束后调用 _afterPos.
 * // internal for header scroll
 * if (that._afterPos) that._afterPos();
 *
 * c. 106行构造器里面添加以下代码
 * // add var to this for header scroll
 * that.translateZ = translateZ;
 *
 * 为处理溢出
 * _bind 方法
 * destroy 方法
 * 最开头的 _bindArr = []
 *
 */
/**
 * @file GMU定制版iscroll，基于[iScroll 4.2.2](http://cubiq.org/iscroll-4), 去除zoom, pc兼容，snap, scrollbar等功能。同时把iscroll扩展到了Zepto的原型中。
 * @name iScroll
 * @import zepto.js
 * @desc GMU定制版iscroll，基于{@link[http://cubiq.org/iscroll-4] iScroll 4.2.2}, 去除zoom, pc兼容，snap, scrollbar等功能。同时把iscroll扩展到了***Zepto***的原型中。
 */

/**
 * @name iScroll
 * @grammar new iScroll(el,[options])  ⇒ self
 * @grammar $('selecotr').iScroll([options])  ⇒ zepto实例
 * @desc 将iScroll加入到了***$.fn***中，方便用Zepto的方式调用iScroll。
 * **el**
 * - ***el {String/ElementNode}*** iscroll容器节点
 *
 * **Options**
 * - ***hScroll*** {Boolean}: (可选, 默认: true)横向是否可以滚动
 * - ***vScroll*** {Boolean}: (可选, 默认: true)竖向是否可以滚动
 * - ***momentum*** {Boolean}: (可选, 默认: true)是否带有滚动效果
 * - ***checkDOMChanges*** {Boolean, 默认: false}: (可选)每个500毫秒判断一下滚动区域的容器是否有新追加的内容，如果有就调用refresh重新渲染一次
 * - ***useTransition*** {Boolean, 默认: false}: (可选)是否使用css3来来实现动画，默认是false,建议开启
 * - ***topOffset*** {Number}: (可选, 默认: 0)可滚动区域头部缩紧多少高度，默认是0， ***主要用于头部下拉加载更多时，收起头部的提示按钮***
 * @example
 * $('div').iscroll().find('selector').atrr({'name':'aaa'}) //保持链式调用
 * $('div').iScroll('refresh');//调用iScroll的方法
 * $('div').iScroll('scrollTo', 0, 0, 200);//调用iScroll的方法, 200ms内滚动到顶部
 */


/**
 * @name destroy
 * @desc 销毁iScroll实例，在原iScroll的destroy的基础上对创建的dom元素进行了销毁
 * @grammar destroy()  ⇒ undefined
 */

/**
 * @name refresh
 * @desc 更新iScroll实例，在滚动的内容增减时，或者可滚动区域发生变化时需要调用***refresh***方法来纠正。
 * @grammar refresh()  ⇒ undefined
 */

/**
 * @name scrollTo
 * @desc 使iScroll实例，在指定时间内滚动到指定的位置， 如果relative为true, 说明x, y的值是相对与当前位置的。
 * @grammar scrollTo(x, y, time, relative)  ⇒ undefined
 */
/**
 * @name scrollToElement
 * @desc 滚动到指定内部元素
 * @grammar scrollToElement(element, time)  ⇒ undefined
 * @grammar scrollToElement(selector, time)  ⇒ undefined
 */
/**
 * @name scrollToPage
 * @desc 跟scrollTo很像，这里传入的是百分比。
 * @grammar scrollToPage(pageX, pageY, time)  ⇒ undefined
 */
/**
 * @name disable
 * @desc 禁用iScroll
 * @grammar disable()  ⇒ undefined
 */
/**
 * @name enable
 * @desc 启用iScroll
 * @grammar enable()  ⇒ undefined
 */
/**
 * @name stop
 * @desc 定制iscroll滚动
 * @grammar stop()  ⇒ undefined
 */

/**
 *  @file 实现了通用highlight方法。
 *  @name Highlight
 *  @desc 点击高亮效果
 *  @import zepto.js
 */
(function( $ ) {
    var $doc = $( document ),
        $el,    // 当前按下的元素
        timer;    // 考虑到滚动操作时不能高亮，所以用到了100ms延时

    // 负责移除className.
    function dismiss() {
        var cls = $el.attr( 'hl-cls' );

        clearTimeout( timer );
        $el.removeClass( cls ).removeAttr( 'hl-cls' );
        $el = null;
        $doc.off( 'touchend touchmove touchcancel', dismiss );
    }

    /**
     * @name highlight
     * @desc 禁用掉系统的高亮，当手指移动到元素上时添加指定class，手指移开时，移除该class.
     * 当不传入className是，此操作将解除事件绑定。
     * 
     * 此方法支持传入selector, 此方式将用到事件代理，允许dom后加载。
     * @grammar  highlight(className, selector )   ⇒ self
     * @grammar  highlight(className )   ⇒ self
     * @grammar  highlight()   ⇒ self
     * @example var div = $('div');
     * div.highlight('div-hover');
     *
     * $('a').highlight();// 把所有a的自带的高亮效果去掉。
     */
    $.fn.highlight = function( className, selector ) {
        return this.each(function() {
            var $this = $( this );

            $this.css( '-webkit-tap-highlight-color', 'rgba(255,255,255,0)' )
                    .off( 'touchstart.hl' );

            className && $this.on( 'touchstart.hl', function( e ) {
                var match;

                $el = selector ? (match = $( e.target ).closest( selector,
                        this )) && match.length && match : $this;

                // selctor可能找不到元素。
                if ( $el ) {
                    $el.attr( 'hl-cls', className );
                    timer = setTimeout( function() {
                        $el.addClass( className );
                    }, 100 );
                    $doc.on( 'touchend touchmove touchcancel', dismiss );
                }
            } );
        });
    };
})( Zepto );
/**
 * @file 导航栏组件
 * @import core/widget.js, extend/highlight.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    
    /**
     * 导航栏组件
     *
     * @class Navigator
     * @constructor Html部分
     * ```html
     * 
     * ```
     *
     * javascript部分
     * ```javascript
     * 
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化导航栏的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Navigator:options)
     * @grammar $( el ).navigator( options ) => zepto
     * @grammar new gmu.Navigator( el, options ) => instance
     */
    gmu.define( 'Navigator', {
        options: {

            /**
             * @property {Array} [content=null] 菜单数组
             * @namespace options
             */
            content: null,

            /**
             * @property {String} [event='click'] 交互事件名
             * @namespace options
             */
            event: 'click'
        },

        template: {
            list: '<ul>',
            item: '<li><a<% if( href ) { %> href="<%= href %>"<% } %>>' +
                    '<%= text %></a></li>'
        },

        _create: function() {
            var me = this,
                opts = me._options,
                $el = me.getEl(),
                $list = $el.find( 'ul' ).first(),
                name = 'ui-' + me.widgetName,
                renderer,
                html;

            // 如果没有包含ul节点，则说明通过指定content来create
            // 建议把create模式给拆出去。很多时候都是先写好在dom中了。
            if ( !$list.length && opts.content ) {
                $list = $( me.tpl2html( 'list' ) );
                renderer = me.tpl2html( 'item' );

                html = '';
                opts.content.forEach(function( item ) {

                    // 如果不提供默认值，然后同时某些key没有传值，parseTpl会报错
                    item = $.extend( {
                        href: '',
                        text: ''
                    }, typeof item === 'string' ? {
                        text: item
                    } : item );

                    html += renderer( item );
                });

                $list.append( html ).appendTo( $el );
            } else {
                
                // 处理直接通过ul初始化的情况
                if ( $el.is( 'ul, ol' ) ) {
                    $list = $el.wrap( '<div>' );
                    $el = $el.parent();
                }

                if ( opts.index === undefined ) {

                    // 如果opts中没有指定index, 则尝试从dom中查看是否有比较为ui-state-active的
                    opts.index = $list.find( '.ui-state-active' ).index();
                    
                    // 没找到还是赋值为0
                    ~opts.index || (opts.index = 0);
                }
            }

            me.$list = $list.addClass( name + '-list' );
            me.trigger( 'done.dom', $el.addClass( name ), opts );

            // bind Events
            $list.highlight( 'ui-state-hover', 'li' );
            $list.on( opts.event + me.eventNs,
                    'li:not(.ui-state-disable)>a', function( e ) {
                me._switchTo( $( this ).parent().index(), e );
            } );

            me.index = -1;
            me.switchTo( opts.index );
        },

        _switchTo: function( to, e ) {
            if ( to === this.index ) {
                return;
            }

            var me = this,
                list = me.$list.children(),
                evt = gmu.Event( 'beforeselect', e ),
                cur;
                
            me.trigger( evt, list.get( to ) );
            
            if ( evt.isDefaultPrevented() ) {
                return;
            }

            cur = list.removeClass( 'ui-state-active' )
                    .eq( to )
                    .addClass( 'ui-state-active' );

            me.index = to;
            return me.trigger( 'select', to, cur[ 0 ] );
        },

        /**
         * 切换到导航栏的某一项
         * @param {Number} to 序号
         * @method switchTo
         */
        switchTo: function( to ) {
            return this._switchTo( ~~to );
        },

        /**
         * 取消选择
         * @method unselect
         */
        unselect: function() {
            this.index = -1;
            this.$list.children().removeClass( 'ui-state-active' );
        },

        /**
         * 获取当前选中的序号
         * @method getIndex
         */
        getIndex: function() {
            return this.index;
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event beforeselect
         * @param {Event} e gmu.Event对象
         * @param {Element} 目标元素
         * @description 当选择的序号发生切换前触发
         */
        
        /**
         * @event select
         * @param {Event} e gmu.Event对象
         * @param {Event} 当前选择的序号
         * @param {Element} 上一次选择的元素
         * @description 当选择的序号发生切换后触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );
})( gmu, gmu.$ );/**
 * @file 当滚动到边缘的时候，自动把下一个滚出来
 * @import widget/navigator/navigator.js, widget/navigator/$scrollable.js
 */
(function( gmu, $, undefined ) {
    gmu.Navigator.options.isScrollToNext = true;

    /**
     * 当滚动到边缘的时候，自动把下一个滚出来
     * @class isScrollToNext
     * @namespace Navigator
     * @pluginfor Navigator
     */
    gmu.Navigator.option( 'isScrollToNext', true, function() {
        var me = this,
            prevIndex;

        me.on( 'select', function( e, to, el ) {
            
            // 第一调用的时候没有prevIndex, 固根据this.index来控制方向。
            if ( prevIndex === undefined ) {
                prevIndex = me.index ? 0 : 1;
            }

            var dir = to > prevIndex,

                // 如果是想左则找prev否则找next
                target = $( el )[ dir ? 'next' : 'prev' ](),

                // 如果没有相邻的，自己的位置也需要检测。存在这种情况
                // 被点击的按钮，只显示了一半
                offset = target.offset() || $( el ).offset(),
                within = me.$el.offset(),
                listOffset;

            if ( dir ? offset.left + offset.width > within.left +
                    within.width : offset.left < within.left ) {
                listOffset = me.$list.offset();

                me.$el.iScroll( 'scrollTo', dir ? within.width -
                        offset.left + listOffset.left - offset.width :
                        listOffset.left - offset.left, 0, 400 );
            }

            prevIndex = to;
        } );
    } );
})( gmu, gmu.$ );/**
 * @file Navigator的可滚插件， 采用iScroll来实现。
 * @module GMU
 * @import widget/navigator/navigator.js, extend/iscroll.js, extend/event.ortchange.js
 */
(function( gmu, $, undefined ) {

    /**
     * @property {Object} [iScroll={}] iScroll配置
     * @namespace options
     * @for Navigator
     * @uses Navigator.scrollable
     */
    gmu.Navigator.options.iScroll = {
        hScroll: true,
        vScroll: false,
        hScrollbar: false,
        vScrollbar: false
    };

    /**
     * Navigator的可滚插件， 采用iScroll来实现。
     *
     * @class scrollable
     * @namespace Navigator
     * @pluginfor Navigator
     */
    gmu.Navigator.register( 'scrollable', {

        _init: function() {
            var me = this,
                opts = me._options;

            me.on( 'done.dom', function() {
                me.$list.wrap( '<div class="ui-scroller"></div>' );

                me.trigger( 'init.iScroll' );
                me.$el.iScroll( $.extend( {}, opts.iScroll ) );
            } );

            $( window ).on( 'ortchange' + me.eventNs,
                    $.proxy( me.refresh, me ) );

            me.on('destroy', function(){
                me.$el.iScroll( 'destroy' );
                $( window ).off( 'ortchange' + me.eventNs );
            } );
        },

        /**
         * 刷新iscroll
         * @method refresh
         * @for Navigator
         * @uses Navigator.scrollable
         */
        refresh: function() {
            this.trigger( 'refresh.iScroll' ).$el.iScroll( 'refresh' );
        }

        /**
         * @event refresh.iScroll
         * @param {Event} e gmu.Event对象
         * @description iscroll刷新前触发
         */
    } );
})( gmu, gmu.$ );/**
 * @file 当滚动到边缘的时候，自动把下一个滚出来
 * @import widget/navigator/navigator.js, widget/navigator/$scrollable.js
 */
(function( gmu, $, undefined ) {
    gmu.Navigator.options.isScrollToNext = true;

    /**
     * 当滚动到边缘的时候，自动把下一个滚出来
     * @class isScrollToNext
     * @namespace Navigator
     * @pluginfor Navigator
     */
    gmu.Navigator.option( 'isScrollToNext', true, function() {
        var me = this,
            prevIndex;

        me.on( 'select', function( e, to, el ) {
            
            // 第一调用的时候没有prevIndex, 固根据this.index来控制方向。
            if ( prevIndex === undefined ) {
                prevIndex = me.index ? 0 : 1;
            }

            var dir = to > prevIndex,

                // 如果是想左则找prev否则找next
                target = $( el )[ dir ? 'next' : 'prev' ](),

                // 如果没有相邻的，自己的位置也需要检测。存在这种情况
                // 被点击的按钮，只显示了一半
                offset = target.offset() || $( el ).offset(),
                within = me.$el.offset(),
                listOffset;

            if ( dir ? offset.left + offset.width > within.left +
                    within.width : offset.left < within.left ) {
                listOffset = me.$list.offset();

                me.$el.iScroll( 'scrollTo', dir ? within.width -
                        offset.left + listOffset.left - offset.width :
                        listOffset.left - offset.left, 0, 400 );
            }

            prevIndex = to;
        } );
    } );
})( gmu, gmu.$ );
