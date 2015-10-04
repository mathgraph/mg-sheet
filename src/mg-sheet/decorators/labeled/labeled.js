define(['lodash', './config'], function (_, defaultConfig) {

    function makeLabel(config, content) {
        return new paper.PointText(config.text);
    }

    function drawLabels(entity, content, config) {
        var path, pathLength,
            labels, start, step, count = 0;
        config = config || {};
        _.defaultsDeep(config, defaultConfig);
        content = content || function (o) {
                return o.toFixed(config.toFixed);
            };

        entity.$__labels = entity.$__labels || new paper.Group();
        labels = entity.$__labels;

        path = entity.$__path;
        pathLength = path.length;

        labels.removeChildren();

        start = pathLength * config.start;
        step = config.step.unit === '%' ? pathLength * config.step.length : +config.step.length;

        _([start])
            .concat(_.contains(config.direction, '>') ? _.range(start + step, pathLength, step) : [])
            .concat(_.contains(config.direction, '<') ? _.range(start - step, 0, -step) : [])
            .each(function (offset) {
                var normal, label;
                label = makeLabel(config);
                label.content = content(offset - start);
                normal = path.getNormalAt(offset);
                normal.length = config.length;
                normal.x = normal.x || 0;
                normal.y = normal.y || 0;
                label.position = path.getPointAt(offset);
                label.rotate(config.angle || 0);
                label.translate(normal);
                labels.addChild(label);
            })
            .value();

        entity.sheet.redraw();
        return entity;
    }

    return {
        type: 'decorator',
        name: 'labeled',
        decorate: function (entity) {
            entity.labeled = function (content, config) {
                if (!_.isFunction(content)) {
                    config = content;
                    content = null;
                }
                drawLabels(entity, content, config)
                    .on('change', drawLabels.bind(null, entity, content, config));
                return entity;
            }
        },
        hide: function (entity) {
            entity.$__labels && (entity.$__labels.visible = false);
            entity.sheet.redraw();
            return entity;
        },
        show: function (entity) {
            entity.$__labels && (entity.$__labels.visible = true);
            entity.sheet.redraw();
            return entity;
        },
        remove: function (entity) {
            entity.$__labels && entity.$__labels.remove();
            entity.sheet.redraw();
            return entity;
        }
    }

});