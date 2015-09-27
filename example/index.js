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
    var s,
        point_down;

    s = new Sheet('canvas');
    tmp = s.draw_arrow([0, 0], [300, 300]);
    tmp = s.draw_segment([0, 0], [300, -300]);
    current = undefined;
    s.on('mouseDown', function (event) {
    });
    s.on('mouseDrag', function (event) {
        if (!current) {
            point_down = event.point;
            current = s.draw_circle(event.point).ticker();
            current.markers.selected = true;
        }
        current.fit(point_down, event.point);
    });
    s.on('mouseUp', function (event) {
        if (!current) {
            return;
        }
        current = null;
    });
});