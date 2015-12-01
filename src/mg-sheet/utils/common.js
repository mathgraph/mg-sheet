/**
 * @namespace utils
 */
define(['lodash'], function (_) {
    var utils = {
        /**
         * Extend with extend object properties.
         * @example
         * var obj = {
         *      a: 0,
         *      x: 0,
         *      p: {
         *          a: 0,
         *          x: 0
         *      }
         * };
         * var obj2 = {
         *      x: 1,
         *      y: 1,
         *      p: {
         *          x: 1,
         *          y: 1
         *      }
         * };
         * utils.deepExtend(obj1, obj2);
         * // now obj1 equals:
         * {
         *      a: 0,
         *      x: 1,
         *      y: 1,
         *      p: {
         *          a: 0,
         *          x: 1,
         *          y: 1
         *      }
         * }
         *
         * @method utils.deepExtend
         * @param {object} dest
         * @param {...object} source
         */
        deepExtend: function (dest, source) {
            Array.prototype.slice.call(arguments, 1).forEach(function (s) {
                if (typeof s !== 'object') {
                    return
                }
                Object.keys(s).forEach(function (key) {
                    if (typeof s[key] === 'object' && s[key] !== null) {
                        if (typeof dest[key] !== 'object') {
                            dest[key] = {};
                        }
                        utils.deepExtend(dest[key], s[key]);
                    } else {
                        dest[key] = s[key];
                    }
                })
            });
        },
        /**
         * Add events system to obj
         * @method utils.events
         * @param {object} obj
         */
        events: function (obj) {

            /**
             * Events system
             * @mixin utils.Events
             */

            var listeners = {},
                binders = {},
                silent = {};

            /**
             * Returns all used events at this moment
             */
            Object.defineProperty(obj, 'eventMap', {
                get: function () {
                    return Object.keys(listeners);
                },
                set: function (events) {
                    events.forEach(function (event) {
                        if (!listeners[event]) {
                            listeners[event] = [];
                            binders[event] = [];
                        }
                    })
                },
                configurable: false,
                enumerable: true
            });

            obj.silent = function (event) {
                silent[event] = true;
            };
            obj.loud = function (event) {
                silent[event] = false;
            };

            /**
             * Fires an event
             * @method utils.Events#trigger
             * @param {string} event Event name
             * @param {object} data
             */
            obj.trigger = function (event, data) {
                if (silent[event]) {
                    return;
                }
                binders[event] && _.takeWhile(binders[event], function (func) {
                    var result = func(data);
                    _.isUndefined(result) && (result = true);
                    return result;
                });
            };
            /**
             * Add listener on event
             * @method utils.Events#on
             * @param {string} event
             * @param {function} func
             */
            obj.on = function (event, func) {
                if (!listeners[event]) {
                    listeners[event] = [];
                    binders[event] = [];
                }
                listeners[event].push(func);
                binders[event].push(func.bind(obj));
            };
            /**
             * Remove listener from event listeners
             * @method utils.Events#off
             * @param {string} event
             * @param {function} [func] Listener should be removed. If func not specified, from event will be removed all listeners
             */
            obj.off = function (event, func) {
                var index;
                if (!listeners[event]) {
                    return;
                }
                if (typeof func === 'function') {
                    index = listeners[event].indexOf(func);
                    listeners[event].splice(index, 1);
                    binders[event].splice(index, 1);
                } else {
                    listeners[event].splice(0);
                    binders[event].splice(0);
                }
            }
        },
        /**
         * Generates an unique number each time
         * @method utils.id
         * @returns {number}
         */
        id: (function () {
            var count = 0;
            return function () {
                return count++;
            }
        })(),

        exists: function (smth) {
            return typeof smth !== 'undefined'
        },
        clone: function (obg) {
            return JSON.parse(JSON.stringify(obg));
        },
        dist: function (point1, point2) {
            return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
        },
        absDiff: function (a, b) {
            return Math.abs(a - b);
        }

    };
    return utils;
});