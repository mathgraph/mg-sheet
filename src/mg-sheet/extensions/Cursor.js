define(['lodash', 'mg-sheet/utils/common', 'mg-sheet/extensions/Entity'], function (_, utils, Entity) {

    var routes = {
        onMouseDown: 'mouseDown',
        onMouseUp: 'mouseUp',
        onMouseDrag: 'mouseDrag',
        onMouseMove: 'mouseMove',
        onKeyDown: 'keyDown',
        onKeyUp: 'keyUp',
        onClick: 'click',
        onMouseEnter: 'mouseEnter',
        onMouseLeave: 'mouseLeave',
        onDoubleClick: 'doubleClick'
    };

    Entity.initial(function () {
        var entity = this;
        entity.interactive = _.isUndefined(entity.sheet.interactive) ? true : entity.sheet.interactive;
        _.forOwn(routes, function (val, key) {
            entity.$__path[key] = function (event) {
                entity.interactive && entity.trigger(val, event);
            }
        });
    });

    return {
        name: 'Cursor',
        type: 'extension',
        constructor: function () {
            var sheet = this,
                tool = new paper.Tool();

            utils.events(sheet);
            paper.tool = tool;
            tool.activate();
            _.forOwn(routes, function (val, key) {
                tool[key] = function (event) {
                    sheet.trigger(val, event);
                }
            });

            sheet.eventMap = _.values(routes);
        }
    }

});