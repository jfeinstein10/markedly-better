define(['angular'],
function(angular) {

    var gui = require('nw.gui'),
        win = gui.Window.get();

    angular.module('bgDirectives', [])
    .directive('bgSplitter', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                orientation: '@'
            },      
            template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
            controller: function ($scope) {
                $scope.panes = [];

                this.addPane = function(pane){
                    if ($scope.panes.length > 1) 
                        throw 'splitters can only have two panes';
                    $scope.panes.push(pane);
                    return $scope.panes.length;
                };
            },
            link: function(scope, element, attrs) {
                var handler = angular.element('<div class="split-handler"></div>');
                var pane1 = scope.panes[0];
                var pane2 = scope.panes[1];
                var vertical = scope.orientation == 'vertical';
                var pane1Min = pane1.minSize || 0;
                var pane2Min = pane2.minSize || 0;
                var pane1Start = pane1.startSize || -1;
                var pane2Start = pane2.startSize || -1;
                var drag = false;

                pane1.elem.after(handler);

                var resize = function(pos) {
                    var bounds = element[0].getBoundingClientRect();
                    if (vertical) {
                        var height = bounds.bottom - bounds.top;
                        // adjust if necessary
                        if (pos < pane1Min) 
                            pos = pane1Min;
                        if (height - pos < pane2Min) 
                            pos = height - pane2Min;
                        // now set the percentages
                        var per = 100 * pos / height;
                        handler.css('top', per + '%');
                        pane1.elem.css('height', per + '%');
                        pane2.elem.css('top', per + '%');
                    } else {
                        var width = bounds.right - bounds.left;
                        // adjust if necessary 
                        if (pos < pane1Min) 
                            pos = pane1Min;
                        if (width - pos < pane2Min) 
                            pos = width - pane2Min;
                        // now set the percentages
                        var per = 100 * pos / width;
                        handler.css('left', per + '%');
                        pane1.elem.css('width', per + '%');
                        pane2.elem.css('left', per + '%');
                    }
                };

                if (pane1Start > 0) {
                    resize(pane1Start);
                } else if (pane2Start > 0) {
                    var boundsStart = element[0].getBoundingClientRect();
                    if (vertical) {
                        resize(bounds.bottom - bounds.top - pane2Start);
                    } else {
                        resize(bounds.right - bounds.left - pane2Start);
                    }
                }

                element.bind('mousemove', function (ev) {
                    if (!drag) return;

                    var bounds = element[0].getBoundingClientRect();
                    var pos = 0;

                    if (vertical) {
                        var height = bounds.bottom - bounds.top;
                        pos = ev.clientY - bounds.top;
                    } else {
                        var width = bounds.right - bounds.left;
                        pos = ev.clientX - bounds.left;
                    }
                    resize(pos);
                    win.emit('editor.resize');
                });

                handler.bind('mousedown', function (ev) { 
                    ev.preventDefault();
                    drag = true; 
                });

                angular.element(document).bind('mouseup', function (ev) {
                    if (drag) win.emit('editor.resize');
                    drag = false;
                });
            }
        };
    })
    .directive('bgPane', function () {
        return {
            restrict: 'E',
            require: '^bgSplitter',
            replace: true,
            transclude: true,
            scope: {
                minSize: '=',
                startSize: '='
            },
            template: '<div class="split-pane{{index}}" ng-transclude></div>',
            link: function(scope, element, attrs, bgSplitterCtrl) {
                scope.elem = element;
                scope.index = bgSplitterCtrl.addPane(scope);
            }
        };
    });
});
