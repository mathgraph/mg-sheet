require.config({
    baseUrl: './js',
    paths: {
        paper: '../bower_components/paper/dist/paper-full.min'
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
            main: 'sheet/sheet'
        }
    ]
});

require(['mg-sheet'], function (Sheet) {
    var s,
        point_down;

    s = new Sheet('canvas');
    tmp = s.draw_segment([0, 0], [300, 300]);

    current = undefined;
    s.on('mouseDown', function (event) {
    });
    s.on('mouseDrag', function (event) {
        if (!current) {
            point_down = event.point;
            current = s.draw_arrow(event.point, event.point);
        }
        current.to = event.point;
    });
    s.on('mouseUp', function (event) {
        if (!current) {
            return;
        }
        current = null;
    });
});