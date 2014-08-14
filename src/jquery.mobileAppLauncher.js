/*!
  jQuery mobileAppLauncher plugin
  @name jquery.mobileAppLauncher.js
  @author Anwar Javed (anwarjaved@gmail.com)
  @version 1.0
  @date 08/12/2014
  @copyright (c) Anwar Javed, All rights reserved.
  @license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/

(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    var pluginName = "mobileAppLauncher";

    var _bind = function (el, eventName, fn) {
        $(el).on(eventName + '.' + pluginName, fn);
    };

    var _unbind = function (el, eventName) {
        $(el).off(eventName + '.' + pluginName);
    };

    var defaults = {
        intent: null
    };

    function createHiddenTarget() {
        var el = document.createElement("a");
        el.style.display = 'none';
        document.body.appendChild(el);
        return el;
    }

    var isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);

    (function () {

        function Plugin(element, options) {
            var self = this;
            self.el = $(element);

            self.options = $.extend({}, $[pluginName].defaults, options);

            self.pluginInfo = {
                name: pluginName,
                version: '1.0',
                author: 'Anwar Javed (anwarjaved@gmail.com)',
                website: 'https://github.com/anwarjaved/mobileAppLauncher'
            };

            self.init();
        }

        function createIntentUrl(intent, url) {

            if (url) {
                var index = url.indexOf(':');

                if (index !== -1) {
                    return intent + url.substring(index);
                }
            }


            return intent + "://";
        }

        function launchApp(event) {

            var el = $(this);


            var heartbeat;
            var iframeTimer;

            var appUrl = el.data('app-intent');

            function clearTimers() {
                clearTimeout(heartbeat);
                clearTimeout(iframeTimer);
            }

            function intervalHeartbeat() {
                if (document.webkitHidden || document.hidden) {
                    clearTimers();
                }
            }

            function tryIframeApproach() {
                var iframe = document.createElement("iframe");
                iframe.style.visibility = "hidden";
                iframe.style.border = "none";
                iframe.style.width = "1px";
                iframe.style.height = "1px";
                iframe.onload = function () {
                    clearTimers();
                    document.location = appUrl;
                };

                iframe.src = appUrl;
                document.body.appendChild(iframe);
            }


            event.preventDefault();
            heartbeat = setInterval(intervalHeartbeat, 200);

            tryIframeApproach();
        }


        Plugin.prototype = {

            init: function () {
                var self = this;
                if (isMobile) {
                    if (self.options.intent) {
                        if (!self.el.data('app-intent')) {
                            var url = self.el.attr('href') || self.el.data('href');

                            self.el.data('app-intent', createIntentUrl(self.options.intent, url));
                        }
                    }

                    _bind(self.el, 'click', launchApp);
                }

            },

            destroy: function () {
                if (isMobile) {
                    var self = this;
                    _unbind(self.el, 'click', launchApp);
                }
            }
        };

        $.fn[pluginName] = function (options) {
            var args = arguments;

            if (options === undefined || typeof options === 'object') {
                return this.each(function () {

                    if (!this['plugin_' + pluginName]) {
                        this['plugin_' + pluginName] = new Plugin(this, options);

                    }
                });
            } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
                var returns;

                this.each(function () {
                    var instance = this['plugin_' + pluginName];

                    if (instance instanceof Plugin && typeof instance[options] === 'function') {
                        returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                    }

                    if (options === 'destroy') {
                        delete this['plugin_' + pluginName];
                    }
                });

                return returns !== undefined ? returns : this;
            }
        };


        var elHidden;


        $[pluginName] = {
            defaults: defaults,
            open: function (intent, url) {

                if (!elHidden) {
                    elHidden = $(createHiddenTarget());

                    $.fn.mobileAppLauncher.apply(elHidden);
                }

                url = url || window.location.href;

                elHidden.data('app-intent', createIntentUrl(intent, url));

                elHidden.attr('href', url);

                elHidden.trigger('click');
            }
        };
    })();
}));