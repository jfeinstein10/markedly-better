define(['angular',
	'storage'], 
	function(angular, storage) {

		var gui = require('nw.gui'),
		win = gui.Window.get();

		return angular.module('markedly.editor', [])
		.directive('editor', function($window) {
			return {
				link: function(scope, element, attrs) {
					var editor = ace.edit(element[0]);
					editor.setValue('');
					editor.setTheme("ace/theme/solarized_dark");
					editor.setKeyboardHandler("ace/keyboard/vim");
					editor.getSession().setMode("ace/mode/markdown");
					editor.getSession().setUseWrapMode(true);
          // catch resize events
          win.on('editor.resize', function() {
          	editor.resize();
          });
          win.on('tab.select', function(contents) {
          	editor.setValue(contents);
          	editor.gotoLine(0);
          });
          // emit change events
          editor.getSession().on('change', function(e) {
          	win.emit('editor.change', editor.getValue());
          });
          // resize on window resize
          var w = angular.element($window);
          w.bind('resize', function() {
          	win.emit('editor.resize');
          });
          if (storage.getActiveFile()) {
          	editor.setValue(storage.getActiveFile().contents);
            editor.gotoLine(0);
          }
        }
      };
    });
});
