define(['angular',
        'preview',
        'storage'],
function(angular, Preview, storage) {

    var gui = require('nw.gui'),
        win = gui.Window.get();

    return angular.module('markedly.directives', [])
    .directive('preview', function() {
        return {
            link: function(scope, element, attrs) {
                var $preview = element.find("#preview");
                var $buffer = element.find("#buffer");
                var preview = new Preview($preview, $buffer);
                win.on('editor.change', function(text) {
                    preview.update(text);
                });
                if (storage.getActiveFile()) {
                    preview.update(storage.getActiveFile().contents);
                }
            }
        };
    })
    .directive('tabDrop', function() {
        return {
            link: function(scope, element, attrs) {
                element.tabdrop();
            }
        };
    });
});
