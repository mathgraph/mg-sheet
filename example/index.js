require.config({
    baseUrl: '../src',
    paths: {
        paper: '../bower_components/paper/dist/paper-full.min',
        lodash: '../bower_components/lodash/lodash.min'
    },
    shim: {
        paper: {
            exports: 'paper'
        }
    },
    packages: [
        {
            name: 'mg-sheet',
            location: './mg-sheet',
            main: 'sheet/sheet.full'
        }
    ]
});

require(['mg-sheet'], function (Sheet) {
    var s, point_down, fx, fy;

    s = new Sheet('canvas');

    fx = function (t) {
        return t * 10 * Math.cos(t);
    };
    fy = function (t) {
        return 200 * Math.sin(t);
    };
    tmp = s.draw_parametric(fx, fy, [-8.5 * Math.PI, 8.5 * Math.PI], [true, true], 0.01);

    tmp = s.draw_arrow([0, 0], [300, 300]).grid().labeled();
    tmp = s.draw_segment([0, 0], [300, -300]);
    current = undefined;
    s.on('mouseDown', function (event) {
    });
    s.on('mouseDrag', function (event) {
        if (!current) {
            point_down = event.point;
            current = s.draw_circle(event.point).grid().ticker();
            //current = s.draw_arrow(event.point, event.point).ticker().labeled().grid();
            current.markers.selected = true;
        }
        current.fit(point_down, event.point);
        //current.to = event.point;
    });
    s.on('mouseUp', function (event) {
        if (!current) {
            return;
        }
        current = null;
    });
});