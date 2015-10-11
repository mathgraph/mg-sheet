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
    //tmp = s.draw_parametric(fx, fy, [-8.5 * Math.PI, 8.5 * Math.PI], [true, true], 0.01);


    //tmp = s.draw_arrow([0, 0], [300, 300]).ticker().grid().labeled().set('interactive', false);




    //start test polynomial

    // x^2 - y^2 = 40000 точки находятся на границе экрана
    tmp = s.draw_polynomial([[-1, 0, 2], [1, 2, 0], [-40000, 0, 0]], [[200, 0], [-200, 0]]);

    // y + 0.05 * x^2 = 0 выбрана точка не на границе, это неправиль, будет построенная лишь половина графика
    tmp = s.draw_polynomial([[1, 0, 1], [0.05, 2, 0]], [[0, 0]], {}, {strokeColor: "blue" });

    // 4 * y^2 + x^2 = 40000
    tmp = s.draw_polynomial([[4, 0, 2], [1, 2, 0], [-40000, 0, 0]], [[200, 0]], {}, {strokeColor: "green" });

    //  x^2 = y^2
    tmp = s.draw_polynomial([[2, 0, 2], [-1, 2, 0]], [[0, 0]], {startRadiusFactor: 2}, {strokeColor: "yellow", strokeWidth: 2 });
    //tmp.coefficients = [[2, 0, 1], [-1, 1, 0]];

    // end test polynomial


    //tmp = s.draw_arrow([0, 0], [300, 300]).ticker().grid().labeled();
    //tmp.hide();
    //tmp = s.draw_segment([0, 0], [300, -300]);
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