define(['paper',
    'mg-sheet/utils',
    'mg-sheet/primitives/draw_arrow', 'mg-sheet/primitives/draw_broken', 'mg-sheet/primitives/draw_circle',
    'mg-sheet/primitives/draw_curve', 'mg-sheet/primitives/draw_segment',
    'mg-sheet/controls/control_selector'], function (paper, utils) {

    /**
     * @typedef {object} Sheet.Style
     *
     * @property {string} strokeColor Color for brush. Defaults: 'black'
     * @property {number} strokeWidth Thickness for brush. Defaults: 5
     * @property {string} fillColor Fill color. Defaults: 'transparent'
     * @todo Undefined color is transparent
     */
    var default_style = {
        strokeColor: 'red',
        strokeWidth: 2,
        fillColor: undefined
    };
    var default_config = {
        centralize: true,
        interactive: true,
        style: default_style
    };

    /**
     * All supported events for Sheet and Entity
     * @type {string[]}
     */
    var eventMap = ['click', 'mouseDown', 'mouseUp', 'mouseMove', 'mouseDrag',
        'mouseEnter', 'mouseLeave', 'doubleClick', 'keyDown', 'keyUp'];

    /**
     * Capitalize first letter. Need for compatibility with paper.js events
     * @method Sheet~capitalizeFirst
     * @param s
     * @returns {string}
     */
    var capitalizeFirst = function (s) {
        return s[0].toUpperCase() + s.slice(1);
    };

    var applyControls = function (eventMap, obj, charger, target) {
        eventMap.forEach(function (name) {
            obj.on(name, function (event) {
                Object.keys(charger).forEach(function (ctrlName) {
                    var ctrl = charger[ctrlName];
                    if (ctrl.target === target && ctrl.enabled && utils.exists(ctrl[name])) {
                        ctrl[name](obj, event);
                    }
                });
            });
        });
    };

    /**
     * Creates one sheet object on canvas
     *
     * @class Sheet
     * @classdesc One sheet in album
     *
     * @todo cursor
     * @todo magnet
     *
     * @property {Element} domElem DOM element of canvas
     * @property {number} height Height of sheet
     * @property {number} width Width of sheet
     * @property {Sheet.Entity[]} entities Objects placed on this sheet
     * @property {object} __project Paper.js project for this sheet
     * @property {object} __project.tool Paper.js tool for handling view events
     * @property {object} charger Charger with all supported in this sheet controls
     *
     * @mixes utils.Events
     *
     * @fires Sheet.MouseEvent:click
     * @fires Sheet.MouseEvent:mouseMove
     * @fires Sheet.MouseEvent:mouseDown
     * @fires Sheet.MouseEvent:mouseUp
     * @fires Sheet.MouseEvent:mouseDrag
     * @fires Sheet.MouseEvent:doubleClick
     * @fires Sheet.MouseEvent:mouseEnter
     * @fires Sheet.MouseEvent:mouseLeave
     * @fires Sheet.KeyboardEvent:keyDown
     * @fires Sheet.KeyboardEvent:keyUp
     *
     * @param {String} canvas Canvas DOM id
     * @param {Object} [config] Configuration
     * @param {boolean} config.centralize Synchronize center of sheet and center of canvas, if false center of sheet will place in top left corner of canvas. Defaults: true
     * @param {boolean} config.interactive Can sheet handle mouse and keyboard events? Defaults: true
     * @param {Sheet.Style} config.style Current style for all new objects on sheet. Defaults: see {@link Sheet.Style} defaults
     */
    Sheet = function(canvas, config) {
        var sheet = this;

        sheet.domElem = document.getElementById(canvas);
        paper.setup(sheet.domElem);

        sheet.__project = paper.projects[paper.projects.length - 1];
        sheet.width = sheet.__project.view.viewSize.width;
        sheet.height = sheet.__project.view.viewSize.height;
        sheet.entities = [];

        utils.deepExtend(sheet, default_config, config);

        if (sheet.centralize) {
            sheet.__project.view.center = [0, 0];
        }
        sheet.__project.currentStyle = sheet.style;

        sheet.__project.tool = new paper.Tool();
        sheet.__project.tool.maxDistance = 0;

        eventMap.forEach(function (name) {
            sheet.__project.tool['on' + capitalizeFirst(name)] = gen_listener(sheet, name);
        });

        utils.events(sheet);

        sheet.charger = {};
        Object.keys(Sheet.Charger).forEach(function (item, index) {
            sheet.use(Sheet.Charger[item], true);
        });

        applyControls(eventMap, sheet, sheet.charger, 'sheet');

    };

    /**
     * Adding new primitive factory to Sheet
     * @method Sheet.registerPrimitive
     * @param factory Factory for primitive object (i.g. line, circle, etc...)
     */
    Sheet.registerPrimitive = function (factory) {
        Sheet.prototype[factory.name] = function () {
            this.__project.activate();
            var entity = factory.apply(this, arguments);
            utils.deepExtend(entity, Sheet.Entity);
            Object.defineProperty(entity, 'id', {
                value: utils.id(),
                writable: false,
                configurable: false,
                enumerable: true
            });
            entity.init();
            return entity;
        }
    };

    /**
     * Redraw sheet
     * @method Sheet#redraw
     */
    Sheet.prototype.redraw = function () {
        this.__project.view.draw();
    };
    /**
     * Remove object from sheet
     * @param {Sheet.Entity} o Object which should be removed
     * @method Sheet#remove
     */
    Sheet.prototype.remove = function (o) {
        this.entities.splice(this.indexOf(o), 1);
    };
    /**
     * Filter for taking entities by conditional function
     * @param {function} condition Conditional function, should return true, if you want include entity to result array
     * @returns {Sheet.Entity[]}
     */
    Sheet.prototype.filter = function (condition) {
        var result = [];
        this.entities.forEach(function (entity) {
            if (condition(entity)) {
                result.push(entity);
            }
        });
        return result;
    };

    /**
     * This mixin must be implemented by each object on sheet
     * @mixin Sheet.Entity
     */
    Sheet.Entity = {
        /**
         * Initialize function
         * @method Sheet.Entity#init
         * @fires Sheet.Entity:init
         * @fires Sheet.MouseEvent:click
         * @fires Sheet.MouseEvent:mouseDown
         * @fires Sheet.MouseEvent:mouseUp
         * @fires Sheet.MouseEvent:mouseMove
         * @fires Sheet.MouseEvent:mouseDrag
         * @fires Sheet.MouseEvent:mouseEnter
         * @fires Sheet.MouseEvent:mouseLeave
         * @fires Sheet.MouseEvent:doubleClick
         * @fires Sheet.KeyboardEvent:keyDown
         * @fires Sheet.KeyboardEvent:keyUp
         * @mixes utils.Events
         */
        init: function () {
            var entity = this;

            if (entity.__initialized) {
                return;
            }

            entity.sheet.entities.push(entity);

            entity.interactive = entity.sheet.interactive;

            utils.events(entity);

            eventMap.forEach(function (name) {
                entity.__path['on' + capitalizeFirst(name)] = gen_listener(entity, name);
            });

            applyControls(eventMap, entity, entity.sheet.charger, 'entity');

            entity.trigger('init');

            entity.sheet.trigger('drawEntity', entity);
            entity.sheet.redraw();

        },
        /**
         * Remove self from sheet
         * @method Sheet.Object#remove
         * @fires Sheet.Object:remove
         */
        remove: function () {
            var entity = this;
            entity.__path.remove();
            sheet.entities.remove(entity);
            entity.trigger('remove');
        },
        /**
         * Hide self
         * @method Sheet.Object#hide
         * @fires Sheet.Object:hide
         */
        hide: function () {
            var entities = this;
            entities.__path.hide();
            entities.trigger('hide');
        },
        /**
         * Show self
         * @method Sheet.Object#show
         * @fires Sheet.Object:show
         */
        show: function () {
            var entity = this;
            entity.__path.show();
            entity.trigger('show');
        },
        __initialized: false,
        /**
         * Object for additional information about entity
         */
        markers: {}
    };

    /**
     * Static charger. Controls from this charger auto includes in every instance chargers.
     * @type {object}
     */
    Sheet.Charger = {};

    /**
     * @typedef {object} Sheet.Control
     * @property {string} name
     * @property {string} mode daemon
     * @property {string} target entity or sheet
     */
    /**
     * Add new control to static charger
     * @param {Sheet.Control} desc Control description
     */
    Sheet.registerControl = function (desc) {
        Sheet.Charger[desc.name] = desc;
    };
    /**
     * Place control to instance charger
     * @method Sheet.use
     * @param control
     * @param {boolean} [enabled]
     * @returns {Sheet.Control}
     */
    Sheet.prototype.use = function (control, enabled) {
        var sheet = this;
        var ctrl = Object.create(control);
        sheet.charger[control.name] = ctrl;
        ctrl.sheet = sheet;
        var _enabled = false;
        Object.defineProperty(ctrl, 'enabled', {
            get: function () {
                return _enabled
            },
            set: function (v) {
                _enabled = !!v;
                if (ctrl.mode === 'single' && _enabled) {
                    Object.keys(sheet.charger).forEach(function (ctrlName) {
                        if (sheet.charger[ctrlName] === 'single') {
                            sheet.charger[ctrlName].enabled = false;
                        }
                    })
                }
            },
            enumerable: true,
            configurable: false
        });
        ctrl.enabled = !!enabled;
        return ctrl;
    };

    Sheet.extend = function (smth) {
        if (smth.type === 'primitive') {
            Sheet.registerPrimitive(smth.factory);
        } else if (smth.type === 'control') {
            Sheet.registerControl(smth.description);
        }
    };

    Array.prototype.slice.call(arguments, 2).forEach(function (item, index) {
        Sheet.extend(item);
    });

    /**
     * Generate function who check if obj has an interactivity options and fires event if it has
     * @method Sheet~gen_listener
     * @param {object} obj
     * @param {string} name Event name
     * @returns {Function}
     */
    function gen_listener(obj, name) {
        return function (event) {
            if (obj.interactive) {
                obj.trigger(name, event);
            }
        }
    }

    /**
     * @typedef {object} Sheet.MouseEvent
     * When mouse event on object who fired. More details: {@link http://paperjs.org/reference/toolevent/}
     * @property {string} type
     * @property {point} point
     * @property {point} lastPoint
     * @property {point} downPoint
     * @property {point} middlePoint
     * @property {number} delta
     * @property {number} count
     * @property {object} modifiers
     */

    /**
     * @event Sheet.MouseEvent:click
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:mouseMove
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:mouseDrag
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:mouseDown
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:mouseUp
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:doubleClick
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:mouseEnter
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.MouseEvent:mouseLeave
     * @param {Sheet.MouseEvent} data
     */
    /**
     * @event Sheet.KeyboardEvent:keyDown
     * @param {Sheet.KeyboardEvent} data
     */
    /**
     * @event Sheet.KeyboardEvent:keyUp
     * @param {Sheet.KeyboardEvent} data
     */

    /**
     * @typedef {object} Sheet.KeyboardEvent
     * When keyboard event fired. More details: {@link http://paperjs.org/reference/keyevent/}
     * @property {string} type
     * @property {string} character
     * @property {string} key
     */

    /**
     * @typedef {object} Sheet.Point
     * @property {number} x
     * @property {number} y
     */

    /**
     * Fires after Entity created
     * @event Sheet.Entity:init
     */

    return Sheet;
});