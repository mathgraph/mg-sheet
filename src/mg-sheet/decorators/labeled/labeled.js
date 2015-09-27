define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    function makeLabel(config, content) {
        return new paper.PointText(config.text);
    }

    function drawLabels(entity, config) {
        var path, pathLength,
            labels, start, step, cur, label, offset,
            count = 0;
        entity = entity || this;
        config = config || {};
        utils.deepExtend(config, defaultConfig);

        entity.$__labels = entity.$__labels || new paper.Group();
        labels = entity.$__labels;

        path = entity.$__path;
        pathLength = path.length;

        labels.removeChildren();

        start = pathLength * config.start;
        step = config.step.unit === '%' ? pathLength * config.step.length : +config.step.length;

        if (config.direction.indexOf('>') !== -1) {
            cur = start;
            while (cur <= pathLength) {
                label = makeLabel(config);
                label.content = count++;
                //label.rotate(path.getNormalAt(cur).angle + 90|| 0);
                offset = path.getNormalAt(cur);
                offset.length = config.length;
                //label.translate(path.getPointAt(cur).add(offset));
                label.position = path.getPointAt(cur);
                label.translate(offset);
                labels.addChild(label);
                cur += step;
            }
        }

        if (config.direction.indexOf('<') !== -1) {
            cur = start;
            while (cur >= 0) {
                label = makeLabel(config);
                label.content = count++;
                offset = path.getNormalAt(cur);
                offset.length = config.length;
                //label.translate(path.getPointAt(cur).add(offset));
                label.position = path.getPointAt(cur);
                label.translate(offset);
                labels.addChild(label);
                cur -= step;
            }
        }
        entity.sheet.redraw();
        return entity;
    }

    return {
        type: 'decorator',
        name: 'labeled',
        decorate: function (entity) {
            entity.labeled = function (config) {
                drawLabels(entity, config)
                    .on('change', drawLabels.bind(entity));
                return entity;
            }
        }
    }

});