(function (paper) {

    /**
     * @typedef {object} Sheet.Style
     *
     * @property {string} strokeColor Color for brush. Defaults: 'black'
     * @property {number} strokeWidth Thickness for brush. Defaults: 5
     * @property {string} fillColor Fill color. Defaults: 'transparent'
     */
    var default_style = {
        strokeColor: 'black',
        strokeWidth: 5,
        fillColor: 'transparent'
    };
    var default_config = {
        //flipX: false,
        //flipY: true,
        centralize: true,
        interactive: true,
        style: default_style
    };

    /**
     * Creates one sheet object on canvas
     *
     * @class Sheet
     * @classdesc One sheet in album
     *
     * @todo flipX and flipY
     * @todo cursor
     * @todo magnet
     * @todo selector
     *
     * @property {Element} domElem DOM element of canvas
     * @property {number} height Height of sheet
     * @property {number} width Width of sheet
     * @property {Sheet.Entity[]} entities Objects placed on this sheet
     * @property {object} __project Paper.js project for this sheet
     * @property {object} __project.tool Paper.js tool for handling view events
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
            sheet.__project.currentStyle = sheet.style;
        }

        sheet.__project.tool = new paper.Tool();
        sheet.__project.tool.maxDistance = 0;

        sheet.__project.tool.onMouseClick = gen_listener(sheet, 'click');
        sheet.__project.tool.onMouseDown = gen_listener(sheet, 'mouseDown');
        sheet.__project.tool.onMouseUp = gen_listener(sheet, 'mouseUp');
        sheet.__project.tool.onMouseMove = gen_listener(sheet, 'mouseMove');
        sheet.__project.tool.onMouseDrag = gen_listener(sheet, 'mouseDrag');
        sheet.__project.tool.onDoubleClick = gen_listener(sheet, 'doubleClick');
        sheet.__project.tool.onKeyDown = gen_listener(sheet, 'keyDown');
        sheet.__project.tool.onKeyUp = gen_listener(sheet, 'keyUp');

        utils.events(sheet);
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

            entity.sheet.entities.push(entity);

            entity.interactive = entity.sheet.interactive;

            utils.events(entity);

            entity.__path.onMouseClick = gen_listener(entity, 'click');
            entity.__path.onMouseDown = gen_listener(entity, 'mouseDown');
            entity.__path.onMouseUp = gen_listener(entity, 'mouseUp');
            entity.__path.onMouseMove = gen_listener(entity, 'mouseMove');
            entity.__path.onMouseDrag = gen_listener(entity, 'mouseDrag');
            entity.__path.onMouseEnter = gen_listener(entity, 'mouseEnter');
            entity.__path.onMouseLeave = gen_listener(entity, 'mouseLeave');
            entity.__path.onDoubleClick = gen_listener(entity, 'doubleClick');
            entity.__path.onKeyDown = gen_listener(entity, 'keyDown');
            entity.__path.onKeyUp = gen_listener(entity, 'keyUp');

            entity.trigger('init');

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
        }
    };

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

})(paper);