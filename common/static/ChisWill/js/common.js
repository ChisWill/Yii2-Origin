;!(function () {
    // 缩写console.log
    window.tes = function () {
        for (var key in arguments) {
            console.log(arguments[key]);
        }
    };
    // 更优雅的事件绑定姿势
    $.fn.coffee = function (obj) {
        for (var eventName in obj) {
            for (var selector in obj[eventName]) {
                $(this).on(eventName, selector, obj[eventName][selector]);
            }
        }
    };
    // 扩展全局静态方法
    $.extend({
        /**
         * 获取js插件的配置文件
         *
         * @param  json optionName 默认配置
         * @param  json options    自定义配置，将会覆盖默认配置
         * @return json             返回最终的配置
         */
        config: function (optionName, options) {
            options = options || {};
            switch (optionName) {
                case 'ajaxSubmit':
                    var defaultOptions = {
                        dataType: "json",
                        success: function (msg) {
                            $.alert(msg.info);
                        }
                    };
                    break;
                case 'fancybox':
                    var defaultOptions = {
                        padding: 5,
                        margin: 0,
                        minWidth: 200,
                        minHeight: 200,
                        maxHeight: 750
                    };
                    break;
                case 'datepicker':
                    var defaultOptions = {
                        type: 'date',
                        calendar: true,
                        showBottom: false
                    };
                    break;
                case 'timepicker':
                    var defaultOptions = {
                        type: 'time'
                    };
                    break;
                case 'datetimepicker':
                    var defaultOptions = {
                        type: 'datetime',
                        calendar: true
                    };
                    break;
                case 'dateRange':
                    var defaultOptions = {
                        type: 'date',
                        calendar: true,
                        btns: ['clear', 'now']
                    };
                    break;
                case 'timeRange':
                    var defaultOptions = {
                        type: 'datetime',
                        calendar: true
                    };
                    break;
                case 'dragSort':
                    var defaultOptions = {
                        animation: 150
                    };
                    break;
                case 'groupSort':
                    var defaultOptions = {
                        group: 'group',
                        animation: 150
                    };
                    break;
                case 'iCheck':
                    var defaultOptions = {
                        checkboxClass: 'icheckbox_minimal-blue',
                        radioClass: 'iradio_minimal-blue',
                        increaseArea: '20%'
                    };
                    break;
            }
            return $.extend(defaultOptions, options);
        },

        /**
         * 初始化插件参数，并执行监听事件
         * 
         * @param string methodName  js扩展的执行名称
         * @param string prefixClass 指定需要绑定的class前缀名称,如果不指定，则默认使用$methodName
         */
        listen: function (methodName, prefixClass) {
            prefixClass = prefixClass || methodName;
            // 记录已经存在的class
            var exist = {};
            // 获取class中含有扩展名的标签并遍历
            $("[class*=" + prefixClass + "]").each(function () {
                // 从该标签的被识别到的具体class名称
                var reg = new RegExp('[\\w-]*' + prefixClass + '[\\.\\w-]*', 'ig'),
                    clsArr = $(this).attr("class").match(reg),
                    cls = clsArr[0];
                if (!exist[cls]) {
                    exist[cls] = true;
                    // 记录要执行插件的元素的class，如果匹配到的class大于1个，则放入数组最后，否则放在最前
                    if (clsArr.length > 1) {
                        $._listen.push(cls);
                    } else {
                        $._listen.unshift(cls);
                    }
                }
            });
            for (var key in $._listen) {
                // 初始化各扩展插件
                Function('$(".' + $._listen[key] + '").' + methodName + '($.config("' + methodName + '", $._config["' + $._listen[key] + '"]));')();
            }
            $._listen = [];
        },

        /**
         * Socket.IO 的客户端，须要先引入php端的 SocketIOAsset
         *
         * @param  string url     监听端口
         * @param  array  options 初始化参数
         * @return object         Socket.IO 对象
         */
        io: function (url, options) {
            if (typeof url == 'object') {
                options = url;
                url = '';
            }
            url = url || _config["socketioUrl"];
            return io(url, options);
        },

        /**
         * 将非标量数据解析成字符串
         * 
         * @param  string|json $info 消息
         * @return string            解析后的字符串
         */
        parseInfo: function (info, delimiter) {
            if (typeof info !== 'object') {
                return info;
            }
            delimiter = delimiter || "\n";
            var str = '',
                d = '',
                key;
            for (key in info) {
                if (typeof info === 'object') {
                    str += d + $.parseInfo(info[key]);
                } else {
                    str += d + info[key];
                }
                d = delimiter;
            }
            return str;
        },

        /**
         * 用法类似 PHP 的 `date()` 函数
         * 
         * @param  string format 格式标识与PHP版的相同
         * @param  mixed  date   毫秒级的时间戳或时间对象，不传默认为当前时间
         * @return string        格式化话后的结果
         */
        date: function (format, date) {
            if (!format) {
                return '';
            }
            if (!date) {
                date = new Date;
            } else {
                if (!isNaN(date)) {
                    date = Number(date);
                }
                date = new Date(date);
            }
            var dealNum = function (num) {
                if (num < 10) {
                    return '0' + num;
                } else {
                    return num;
                }
            };
            var formatArr = ['Y', 'm', 'd', 'H', 'i', 's'];
            for (var i = 0; i < formatArr.length; i++) {
                switch (formatArr[i]) {
                    case 'Y':
                        format = format.replace(formatArr[i], date.getFullYear());
                        break;
                    case 'm':
                        format = format.replace(formatArr[i], dealNum(date.getMonth() + 1));
                        break;
                    case 'd':
                        format = format.replace(formatArr[i], dealNum(date.getDate()));
                        break;
                    case 'H':
                        format = format.replace(formatArr[i], dealNum(date.getHours()));
                        break;
                    case 'i':
                        format = format.replace(formatArr[i], dealNum(date.getMinutes()));
                        break;
                    case "s":
                        format = format.replace(formatArr[i], dealNum(date.getSeconds()));
                        break;
                }
            }
            return format;
        },

        /**
         * 增加支持json对象的alert，如果引入了php端的 LayerAsset ，则会以插件的方式弹窗
         * 
         * @param string|json info     消息
         * @param function    callback 弹窗关闭后的回调函数
         */
        alert: function (info, callback) {
            if (typeof layer !== 'undefined') {
                info = $.parseInfo(info, '<br>');
                layer.open({
                    shadeClose: true,
                    content: info,
                    end: callback
                });
            } else {
                info = $.parseInfo(info);
                alert(info);
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },

        /**
         * js插件方式弹出confirm框，如果引入了php端的 LayerAsset ，则会以插件的方式弹窗
         * 
         * @param string   info     消息
         * @param callback callback 确认按钮的回调函数
         */
        confirm: function (info, callback) {
            if (typeof layer !== 'undefined') {
                info = $.parseInfo(info, '<br>');
                var index = layer.confirm(info, {
                    shadeClose: true
                }, function () {
                    callback();
                    layer.close(index);
                });
            } else {
                if (typeof callback == 'function') {
                    if (confirm(info)) {
                        callback();
                    }
                }
            }
        },

        /**
         * js插件方式弹出prompt框，如果引入了php端的 LayerAsset ，则会以插件的方式弹窗
         * 
         * @param string   info     消息
         * @param string   value    默认的输入文本
         * @param callback callback 确认按钮的回调函数
         */
        prompt: function (info, value, callback) {
            if (typeof value === 'function') {
                callback = value;
                value = '';
            }
            if (typeof layer !== 'undefined') {
                layer.prompt({
                    formType: 0,
                    title: info,
                    value: value,
                    yes: function (index, layero) {
                        var value = layero.find(".layui-layer-input").val();
                        callback(value);
                        layer.close(index);
                    }
                });
            } else {
                if (typeof callback == 'function') {
                    callback(prompt(info, value));
                }
            }
        },

        /**
         * 弹出会自动关闭的消息层，须要引入php端的 LayerAsset
         * 
         * @param  string|json info     消息
         * @param  callback    callback 消息消失后执行的方法
         */
        msg: function (info, callback) {
            if (typeof layer !== 'undefined') {
                info = $.parseInfo(info, '<br>');
                layer.msg(info, {
                    icon: 0,
                    time: 1500
                }, callback);
            } else {
                $.alert(info, callback);
            }
        },

        /**
         * 弹出加载层，须要引入php端的 LayerAsset
         * 
         * @param  json    options 配置参数
         * @return integer
         */
        loading: function () {
            if (typeof layer !== 'undefined') {
                return layer.load(2, {shade: [0.3, 'gray']});
            } else {
                return 0;
            }
        },

        /**
         * 获取 url 中的参数部分
         * 
         * @param  string url url地址
         * @return json       json形式的url参数
         */
        getUrlParams: function (url) {
            var pos = url.indexOf('?');
            if (pos < 0) {
                return {};
            }
            var qs = url.substring(pos + 1).split('&');
            for (var i = 0, result = {}; i < qs.length; i++) {
                qs[i] = qs[i].split('=');
                result[decodeURIComponent(qs[i][0])] = decodeURIComponent(qs[i][1]);
            }
            return result;
        },

        /**
         * 获取 url 中的路径部分
         * @param  string url url地址
         * @return string     路径
         */
        getUrlPath: function (url) {
            try {
                var pieces = url.split("//");
                var path = pieces[1].substring(pieces[1].indexOf("/"));
                if (path.indexOf("?") != -1) {
                    path = path.split("?")[0];
                }
                return path;
            } catch (e) {
                return '';
            }
        },

        /**
         * 浏览器兼容的方式获取键盘事件代码
         * 
         * @param  object  ev DOM的事件对象
         * @return integer    键盘事件代码
         */
        getEventKey: function (ev) {
            var e = ev || event;
            return e.keyCode || e.which || e.charCode;
        },

        /**
         * 判断当前是否是IE浏览器
         * 
         * @return boolean
         */
        isIe: function () {
            return /msie/.test(navigator.userAgent.toLowerCase());
        },

        /**
         * 判断一个变量是否是json对象
         *
         * @param  any $obj 任意变量
         * @return boolean
         */
        isJson: function (obj) {
            return typeof obj === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object object]' && !obj.length;
        },

        /**
         * js键盘事件代码
         */
        keyCode: {
            'BACKSPACE': 0x8,
            'TAB': 0X9,
            'ENTER': 0xD,
            'SHIFT': 0x10,
            'CTRL': 0x11,
            'ALT': 0x12,
            'BREAK': 0x13,
            'CAPS': 0x14,
            'ESC': 0x1B,
            'PAGEUP': 0x21,
            'PAGEDOWN': 0x22,
            'END': 0x23,
            'HOME': 0x24,
            'LEFT': 0x25,
            'UP': 0x26,
            'RIGHT': 0x27,
            'DOWN': 0x28,
            'PRTSC': 0x2C,
            'INSERT': 0x2D,
            '0': 0x30,
            '1': 0x31,
            '2': 0x32,
            '3': 0x33,
            '4': 0x34,
            '5': 0x35,
            '6': 0x36,
            '7': 0x37,
            '8': 0x38,
            '9': 0x39,
            'A': 0x41,
            'B': 0x42,
            'C': 0x43,
            'D': 0x44,
            'E': 0x45,
            'F': 0x46,
            'G': 0x47,
            'H': 0x48,
            'I': 0x49,
            'J': 0x4A,
            'K': 0x4B,
            'L': 0x4C,
            'M': 0x4D,
            'N': 0x4E,
            'O': 0x4F,
            'P': 0x50,
            'Q': 0x51,
            'R': 0x52,
            'S': 0x53,
            'T': 0x54,
            'U': 0x55,
            'V': 0x56,
            'W': 0x57,
            'X': 0x58,
            'Y': 0x59,
            'Z': 0x5A,
            'WINDOW': 0x5B,
            'NUM': 0x90,
            '/': 0xBF
        },

        /**
         * 自定义的全局静态配置的存储位置，主要为程序内部使用，不要直接使用！
         */
        _config: {},
        _listen: []
    });

    // 扩展全局jQuery实例方法
    $.fn.extend({
        /**
         * 允许配置进度条的表单/文件的AJAX提交方法，主要使用场景如下：
         * 1. 选择表单绑定，绑定的是提交事件
         * 2. 直接选择`input[file]`，绑定的是change事件
         *
         * @param string    url      提交的地址，不填则提交当前页面
         * @param json      data     额外提交的数据
         * @param function  success  成功的回调方法
         * @param json      params   额外的参数配置，包含以下选项
         * - before: function(this, data), 自定义`AJAX`提交前的额外操作，可以对提交参数进行调整
         * - preview: function(src, self), 预览的回调方法，如果绑定的是`input[file]`，`return false`可以阻止提交
         * - progress: function(percent), 显示当前进度的回调方法，返回当前提交进度的百分比数字
         */
        uploadFile: function (url, data, success, params) {
            if ($.isJson(url)) {
                params = success;
                success = data;
                data = url;
                url = '';
            } else if ($.isFunction(url)) {
                params = data;
                success = url;
                data = {};
                url = '';
            }
            if ($.isFunction(data)) {
                params = success;
                success = data;
                data = {};
            }
            data = data || {};
            params = params || {};
            var $this = $(this),
                getFileInfo = function (file, callback) {
                    if (typeof FileReader == 'undefined') {
                        return false;
                    }
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(file.files[0]);
                    fileReader.onloadend = function () {
                        var type = this.result.substring(this.result.indexOf(':') + 1, this.result.indexOf('/'));
                        if (type === 'image') {
                            callback(this.result, file);
                        }
                    };
                },
                ajaxSubmit = function (url, data, success, params) {
                    $.ajax({
                        url: url,
                        type: 'POST',
                        cache: false,
                        contentType: "multipart/form-data",
                        data: data,
                        processData: false,
                        contentType: false,
                        xhr: function () {
                            xhr = $.ajaxSettings.xhr();
                            if (!$.isFunction(params.progress)) {
                                return xhr;
                            }
                            if (xhr.upload && 'onprogress' in xhr.upload) {
                                xhr.upload.addEventListener('progress', function (e) {
                                    var loaded = e.loaded,
                                        total = e.total,
                                        percent = Math.floor(100 * loaded / total);
                                    params.progress(percent, params.self);
                                }, false);
                            }
                            return xhr;
                        },
                        success: function (msg) {
                            success(msg, params.self);
                        }
                    });
                };

            switch ($this.prop('tagName')) {
                case 'FORM':
                    $this.each(function () {
                        var $file = $(this).find('input[type="file"]'),
                            name = $file.attr('name');
                        if ($file.length > 0) {
                            if (name.search('[A-Z].*\\[.+\\]') === -1) {
                                if (name.indexOf('[') !== -1) {
                                    $file.attr('name', 'Upload[' + name.substr(0, name.indexOf('[')) + '][]');
                                } else {
                                    $file.attr('name', 'Upload[' + name + ']');
                                }
                            }
                            if ($.isFunction(params.preview)) {
                                $file.change(function () {
                                    getFileInfo(this, params.preview);
                                });
                            }
                        }
                    });
                    $this.submit(function () {
                        if ($.isFunction(params.before) && !params.before(this, data)) {
                            return false;
                        }
                        url = url || $(this).attr('action');
                        var formData = new FormData(this);
                        for (var k in data) {
                            formData.append(k, data[k]);
                        }
                        params.self = this;
                        ajaxSubmit(url, formData, success, params);
                        return false;
                    });
                    break;
                case 'INPUT':
                    $this.each(function () {
                        var name = $(this).attr('name');
                        if (name.search('[A-Z].*\\[.+\\]') === -1) {
                            $(this).attr('name', 'Upload[' + name + ']');
                        }
                    });
                    $this.change(function () {
                        var $self = $(this),
                            formData = new FormData;
                        if ($.isFunction(params.before) && !params.before(this, data)) {
                            return false;
                        }
                        formData.append($self.attr('name'), this.files[0]);
                        for (var k in data) {
                            formData.append(k, data[k]);
                        }
                        if ($.isFunction(params.preview)) {
                            getFileInfo(this, params.preview);
                        }
                        params.self = this;
                        ajaxSubmit(url, formData, success, params);
                    });
                    break;
            }
        },
        /**
         * 验证码按钮的通用方法，通过按钮的[data]属性来传入参数
         */
        verifyCode: function () {
            $(this).click(function () {
                var mobileSelector = $(this).data('mobile') || '#user-mobile',
                    captchaSelector = $(this).data('captcha') || '#user-captcha',
                    mobileReg = /^1[3578]\d{9}$/,
                    mobile = $(mobileSelector).val(),
                    captcha = $(captchaSelector).val(),
                    $this = $(this),
                    text = $this.val(),
                    minute = 60,
                    data = {
                        mobile: mobile,
                        captcha: captcha
                    };
                // 验证手机号
                if (!mobileReg.test(mobile)) {
                    $.alert('手机号格式不正确');
                } else {
                    if ($this.data('send') == 1) {
                        return false;
                    }
                    $.post($(this).data('action'), data, function (msg) {
                        if (msg.state) {
                            $this.data('send', 1);
                            var timeCount = function (minute) {
                                if (minute <= -1) {
                                    $this.data('send', 0);
                                    $this.val(text);
                                } else {
                                    $this.val(minute + ' 秒');
                                    minute--;
                                    setTimeout(function () {
                                        timeCount(minute);
                                    }, 1000);
                                }
                            };
                            timeCount(minute);
                        } else {
                            $.alert(msg.info);
                        }
                    });
                }
                return false;
            });
        },

        /**
         * laydate的快捷方法：日期选择，须要引入php端的 DatePickerAsset
         * 
         * @param json options 配置参数
         */
        datepicker: function (options) {
            $(this).each(function () {
                laydate.render($.extend(options, {
                    elem: this
                }));
            });
            $(this).attr('autocomplete', 'off');
        },

        /**
         * laydate的快捷方法：时间选择，须要引入php端的 DatePickerAsset
         * 
         * @param json options 配置参数
         */
        timepicker: function (options) {
            $(this).datepicker(options);
        },

        /**
         * laydate的快捷方法：日期时间选择，须要引入php端的 DatePickerAsset
         * 
         * @param json options 配置参数
         */
        datetimepicker: function (options) {
            $(this).datepicker(options);
        },


        /**
         * laydate的快捷方法：日期选择区间，须要引入php端的 DatePickerAsset
         *
         * @param json $options 配置参数
         */
        dateRange: function (options, map) {
            // 定义对应的关键字映射组合
            map = map || ['startdate', 'enddate']
            // 先获取当前的选择器
            var selector = this.selector.toLowerCase();
            // 如果获取不到，表示是用$(this).dateRange形式调用的，则改为用正则匹配指定规则的class属性
            if (!selector) {
                selector = '.' + $(this).attr('class').match('/' + map[0] + '[\w\s]*/i');
            }
            // 根据映射组合，找出当前选择器包含的关键字
            var otherSelector = selector.replaceLast(map[0], map[1]);
            var start = laydate.render($.extend(options, {
                elem: selector,
                done: function (value, date) {
                    if (value) {
                        end.config.min = date;
                        end.config.min.month = date.month - 1;
                    } else {
                        end.config.min = {
                            date: 1,
                            hours: 0,
                            minutes: 0,
                            month: 0,
                            seconds: 0,
                            year: 1900,
                        };
                    }
                    $(selector).trigger('blur');
                    $(otherSelector).trigger('focus');
                }
            }));
            var end = laydate.render($.extend(options, {
                elem: otherSelector,
                done: function (value, date) {
                    if (value) {
                        start.config.max = date
                        start.config.max.month = date.month - 1;
                    } else {
                        start.config.max = {
                            date: 31,
                            hours: 0,
                            minutes: 0,
                            month: 11,
                            seconds: 0,
                            year: 2099
                        };
                    }
                }
            }));
            $(selector).attr('autocomplete', 'off');
            $(otherSelector).attr('autocomplete', 'off');
        },

        /**
         * laydate的快捷方法：日期时间选择区间，须要引入php端的 DatePickerAsset
         *
         * @param json $options 配置参数
         */
        timeRange: function (options) {
            $(this).dateRange(options, ['starttime', 'endtime']);
        },

        /**
         * 在指定元素周围弹出会自动消失的消息层，须要引入php端的 LayerAsset
         * 
         * @param  string|json   info     消息
         * @param  function|json options  配置参数
         */
        tips: function (info, options) {
            if (typeof layer !== 'undefined') {
                if (typeof options == 'function') {
                    options = {
                        end: options
                    };
                }
                options = $.extend({
                    tips: [1, '#39E'],
                    time: 1200
                }, options);
                info = $.parseInfo(info, '<br>');
                layer.tips(info, this, options);
            }
        },

        /**
         * Sortable插件的快捷方法：指定列表的拖拽排序，须要先引入php端的 SortableAsset
         *
         * @param json $options 配置参数
         */
        dragSort: function (options) {
            this.each(function () {
                Sortable.create(this, options);
            });
        },

        /**
         * Sortable插件的快捷方法：指定一组列表的拖拽排序，可以相互穿插拖拽，须要先引入php端的 SortableAsset
         *
         * @param json $options 配置参数
         */
        groupSort: function (options) {
            [].forEach.call(this, function ($item) {
                Sortable.create($item, options);
            });
        },

        /**
         * 获取指定元素的绝对偏移位置
         * 
         * @return json JSON格式的元素偏移位置
         */
        getAbsPos: function () {
            var top = this[0].offsetTop;
            var left = this[0].offsetLeft;
            var dom = this[0].offsetParent;
            while (dom) {
                top += dom.offsetTop;
                left += dom.offsetLeft;
                dom = dom.offsetParent;
            };
            return {
                top: top,
                left: left
            };
        },

        /**
         * 获取input框的提示div的Jquery对象
         * 
         * @param  json    options 提示div的style属性
         * @param  boolean isRelative 是否为相对定位的坐标
         * @return object
         */
        getHintDiv: function (options, isRelative) {
            var $input = this,
                style = '',
                styleOptions = options || {},
                inputPos = $input.getAbsPos(),
                isRelative = typeof options === 'boolean' ? options : isRelative || false,
                defaultStyle = {
                    'width': $input[0].clientWidth + 'px',
                    'left': inputPos.left + 'px',
                    'top': inputPos.top + $input[0].clientHeight + 'px',
                    'max-height': '200px',
                    'overflow-y': 'auto',
                    'position': 'absolute',
                    'border': '1px solid #cdcdcd',
                    'border-radius': '4px',
                    'background': 'white',
                    'z-index': 9999,
                    'word-wrap': 'break-word',
                    'cursor': 'pointer'
                };

            if (isRelative === true) {
                defaultStyle.left = $input[0].offsetLeft + 'px';
                defaultStyle.top = $input[0].offsetTop + $input[0].clientHeight + 'px';
            }
            styleOptions = $.extend(defaultStyle, styleOptions);

            for (var attr in styleOptions) {
                style += attr + ':' + styleOptions[attr] + ';';
            }

            return $("<div>").attr('style', style).addClass('hint-div');
        },

        /**
         * 下拉框的输入后下拉框提示
         * 被绑定的input框，如果有
         * `html` 属性，则表示启用编辑模式，将html属性的值显示为input框内，input框原来的值放到隐藏提交域中
         * `hint_name` 属性，则表示启用双重搜索模式，input框和隐藏域的name属性都保留，并进行提交
         * 
         * 该请求返回的数据应该是数组，并满足下格式
         * ```js
         * [
         *     {
         *         id: '表单提交实际需要的值',
         *         value: '下拉框选中后，显示在input框内的文本',
         *         html: '下拉框<option>的html内容'
         *     }
         * ]
         * ```
         * 如果省略了 `value` 则会使用 `html` 替代
         *
         * @param string url ajax请求的url链接，请求的参数名为 keyword ，如果不传入该参数则会去获取该元素的 [url] 属性
         */
        bindHint: function (url) {
            var $this = this;
            var hintId = 'data-hint-id';
            // 生成唯一码
            var generateKey = function () {
                var key;
                do {
                    key = (Math.random() + '').substr(2, 3);
                } while ($("[" + hintId + "='" + key + "']").length > 0);
                return key;
            };
            // 生成隐藏的输入框作为表单提交
            $this.each(function () {
                var hintName = $(this).data('hint-name');
                if (typeof hintName == 'undefined') {
                    var inputName = $(this).attr('name');
                } else {
                    var inputName = hintName;
                }
                var key = generateKey(),
                    $hiddenInput = $("<input>").attr({
                        type: 'hidden',
                        id: hintId + key,
                        autocomplete: 'off',
                        name: inputName
                    });
                if (typeof hintName == 'undefined') {
                    $(this).attr(hintId, key).attr('name', '').after($hiddenInput);
                } else {
                    $(this).attr(hintId, key).after($hiddenInput);
                }
                if (!$(this).attr('url') && typeof url !== 'undefined') {
                    $(this).attr('url', url);
                }
                if ($(this).attr('html')) {
                    $hiddenInput.val($(this).val());
                    $(this).val($(this).attr('html'));
                }
            });
            // 阻止默认提交表单事件
            $this.keypress(function (e) {
                if ($.getEventKey(e) == $.keyCode['ENTER']) {
                    e.preventDefault();
                }
            });
            // 键盘输入间隔时间，单位毫秒
            var inputInterval = 350,
                timeArr = [],
                timeout;
            // 绑定输入框按键事件
            $this.keyup(function (e) {
                var $input = $(this),
                    eventKey = $.getEventKey(e),
                    value = $(this).val(),
                    url = $input.attr('url');
                // 每次按键，记录当前时间
                timeArr.push((new Date()).getTime());
                var inputCount = timeArr.length;
                // 以下按键不触发ajax请求
                var forbidArr = [
                    $.keyCode['ENTER'], $.keyCode['CTRL'], $.keyCode['SHIFT'], $.keyCode['ALT'],
                    $.keyCode['LEFT'], $.keyCode['UP'], $.keyCode['RIGHT'], $.keyCode['DOWN'],
                    $.keyCode['PAGEUP'], $.keyCode['PAGEDOWN'], $.keyCode['HOME'], $.keyCode['END'],
                    $.keyCode['BREAK'], $.keyCode['INSERT'], $.keyCode['NUM'], $.keyCode['CAPS'],
                    $.keyCode['PRTSC'], $.keyCode['WINDOW'], $.keyCode['ESC']
                ];
                // 键盘输入的间隔时间，如果小于指定值，则清除计时器
                if (inputCount > 1 && timeArr[inputCount - 1] - timeArr[inputCount - 2] <= inputInterval) {
                    clearTimeout(timeout);
                }
                // 如果按键在禁止列表中，则不触发
                if ($.inArray(eventKey, forbidArr) == -1 && value) {
                    timeout = setTimeout(function () {
                        timeArr = [];
                        $.get(url, {
                            keyword: value
                        }, function (msg) {
                            if (msg.state) {
                                showHint(msg.info, $input);
                            } else {
                                showHint([], $input);
                            }
                        }, 'json');
                    }, inputInterval);
                } else if (!value) {
                    // 如果当前输入框没有值，则应清除下拉框
                    $("#hintDiv" + $input.attr(hintId)).hide();
                }
            });

            var showHint = function (data, $input) {
                var $hintDiv = $("#hintDiv" + $input.attr(hintId)),
                    $hintInput = $("#" + hintId + $input.attr(hintId));
                if (!data || data.length === 0) {
                    $hintDiv.hide();
                    return false;
                }
                if ($hintDiv.length === 0) {
                    bindKeyEvent($input);

                    $hintDiv = $input.getHintDiv(true).attr('id', 'hintDiv' + $input.attr(hintId));
                    $input.after($hintDiv);

                    $hintDiv.on('click', 'div', function () {
                        displayItem($input, $(this));
                    });
                    $hintDiv.on('mouseover', 'div', function () {
                        $(this).css('background-color', '#d3d7d4').siblings().css('background-color', '#fff');
                    });
                }
                $hintDiv.show();
                var $content = $("<div>");
                for (var key in data) {
                    $content.append($("<div>").attr({
                        style: 'cursor: point',
                        value: data[key].value,
                        sid: data[key].id
                    }).text(data[key].html));
                }
                $hintDiv.html($content.html());
            };

            var bindKeyEvent = function ($input) {
                $input.keyup(function (e) {
                    var $hintDiv = $("#hintDiv" + $input.attr(hintId)),
                        $hintInput = $("#" + hintId + $input.attr(hintId)),
                        selectedClass = 'selected',
                        $selectedItem = $hintDiv.find("div." + selectedClass);
                    if ($(this).val() === '') {
                        $hintInput.val('');
                    }
                    if ($hintDiv.css('display') !== 'none') {
                        switch ($.getEventKey(e)) {
                            case $.keyCode['UP']:
                                var $prevItem = $selectedItem.prev();
                                if ($selectedItem.length > 0 && $prevItem.length > 0) {
                                    $selectedItem.removeClass(selectedClass);
                                    $prevItem.addClass(selectedClass);
                                } else {
                                    var $lastItem = $hintDiv.find("div:last"),
                                        parentTop = $hintDiv.offset().top,
                                        selfTop = $lastItem.offset().top,
                                        distance = selfTop - parentTop;
                                    $hintDiv.animate({
                                        scrollTop: distance
                                    }, 200);
                                    $lastItem.addClass(selectedClass).siblings().removeClass(selectedClass);
                                }
                                return false;
                            case $.keyCode['DOWN']:
                                var $nextItem = $selectedItem.next();
                                if ($selectedItem.length > 0 && $nextItem.length > 0) {
                                    $selectedItem.removeClass(selectedClass);
                                    $nextItem.addClass(selectedClass);
                                } else {
                                    $hintDiv.find("div:first").addClass(selectedClass).siblings().removeClass(selectedClass);
                                }
                                return false;
                            case $.keyCode['ENTER']:
                                if ($selectedItem.length > 0) {
                                    displayItem($input, $selectedItem);
                                }
                                return false;
                        }
                    }
                });
            };

            var displayItem = function ($input, $item) {
                if (!$item.attr('value')) {
                    $input.val($item.html());
                } else {
                    $input.val($item.attr('value'));
                }
                var $hintDiv = $("#hintDiv" + $input.attr(hintId)),
                    $hintInput = $("#" + hintId + $input.attr(hintId));
                $hintInput.val($item.attr('sid'));
                $hintDiv.hide();
            };
        }
    });

    /**
     * 为已有插件设置参数，目的在于可以沿用默认参数
     *
     * @param json $options 配置参数
     */
    String.prototype.config = function (options) {
        var cls = this.toString();
        if (!options) {
            return $.config(cls);
        }
        $._config[cls] = options;
    };

    /**
     * 替换字符串最后出现的单词
     *
     * @param  string $search  被替换的字符串
     * @param  string $replace 替换的字符串
     * @return string          替换后的结果
     */
    String.prototype.replaceLast = function (search, replace) {
        var string = this.toString();
        var pos = string.lastIndexOf(search);
        return string.substring(0, pos) + replace + string.substring(pos + search.length, string.length);
    };

    /**
     * 将字符串采用 marked插件 进行解析，须要先引入php端的 MarkedAsset
     *
     * @param  json    options 配置参数
     * @return string          解析后的结果
     */
    String.prototype.parseHtml = function (options) {
        var defaultOptions = {};
        options = $.extend(options, defaultOptions);
        return marked.parser(marked.lexer(this.toString(), options));
    };

    /**
     * 字符串背景高亮
     * 
     * @param  string keyword 要被高亮的字符串
     * @return string         被高亮后的字符串
     */
    String.prototype.highlight = function (keyword, highlightClass) {
        if (keyword === undefined || keyword === '' || keyword === null) {
            return this.toString();
        }
        var html = this.toString(),
            highlightClass = highlightClass || 'highlight';
            htmlPieces = html.match(/[^<>]+|<(\/?)([A-Za-z]+)([^<>]*)>/g),
            reg = /[\^\.\\\|\(\)\*\+\-\$\[\]\?]/g,
            prefixTag = '<span class="' + highlightClass + '">',
            suffixTag = '</span>',
            flags = {};

        flags["^"] = "\\^";
        flags["."] = "\\.";
        flags["\\"] = "\\\\";
        flags["|"] = "\\|";
        flags["("] = "\\(";
        flags[")"] = "\\)";
        flags["*"] = "\\*";
        flags["+"] = "\\+";
        flags["-"] = "\\-";
        flags["$"] = "\$";
        flags["["] = "\\[";
        flags["]"] = "\\]";
        flags["?"] = "\\?";
        var str = keyword.replace(reg, function (match) {
            return flags[match];
        });
        reg = new RegExp(str, "ig");
        var r = new RegExp('\<.*?\>', 'ig');
        for (var i = 0, len = htmlPieces.length; i < len; i++) {
            if (!r.test(htmlPieces[i])) {
                htmlPieces[i] = htmlPieces[i].replace(reg, prefixTag + keyword + suffixTag);
            }
        }
        return htmlPieces.join('');
    }
    
    // 集成 yii.js 中的 `AJAX重定向`和`AJAX自动填充Csrf`功能
    var yii = (function ($) {
        var pub = {
            /**
             * @return string|undefined the CSRF parameter name. Undefined is returned if CSRF validation is not enabled.
             */
            getCsrfParam: function () {
                return $('meta[name=csrf-param]').attr('content');
            },

            /**
             * @return string|undefined the CSRF token. Undefined is returned if CSRF validation is not enabled.
             */
            getCsrfToken: function () {
                return $('meta[name=csrf-token]').attr('content');
            },

            /**
             * Updates all form CSRF input fields with the latest CSRF token.
             * This method is provided to avoid cached forms containing outdated CSRF tokens.
             */
            refreshCsrfToken: function () {
                var token = pub.getCsrfToken();
                if (token) {
                    $('form input[name="' + pub.getCsrfParam() + '"]').val(token);
                }
            },

            initModule: function (module) {
                if (module.isActive === undefined || module.isActive) {
                    if ($.isFunction(module.init)) {
                        module.init();
                    }
                    $.each(module, function () {
                        if ($.isPlainObject(this)) {
                            pub.initModule(this);
                        }
                    });
                }
            },

            init: function () {
                initCsrfHandler();
                initRedirectHandler();
            }
        };

        function initRedirectHandler() {
            // handle AJAX redirection
            $(document).ajaxComplete(function (event, xhr, settings) {
                var url = xhr && xhr.getResponseHeader('X-Redirect');
                if (url) {
                    window.location = url;
                }
            });
        }

        function initCsrfHandler() {
            // automatically send CSRF token for all AJAX requests
            $.ajaxPrefilter(function (options, originalOptions, xhr) {
                if (!options.crossDomain && pub.getCsrfParam()) {
                    xhr.setRequestHeader('X-CSRF-Token', pub.getCsrfToken());
                }
            });
            pub.refreshCsrfToken();
        }

        return pub;
    })(jQuery);

    yii.initModule(yii);
})();