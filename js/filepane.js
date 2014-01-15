define(['angular'], 
function(angular) {

    var gui = require('nw.gui'),
        win = gui.Window.get(),
		fs = require('fs'),
		path = require('path');

    return angular.module('markedly.filepane', [])
    .controller('filepane-controller', ['$scope',
        function($scope) {

        	$scope.filesystem = [];
        	$scope.loadChildren = function(dirpath) {
        		files = fs.readdirSync(dirpath);
        		return files.map(function(file) {
        			if (file.indexOf('.') == 0) return null;
        			var filepath = path.join(dirpath, file);
					return { filepath: filepath,
						name: file,
					    hasChildren: fs.statSync(filepath).isDirectory() };
				}).filter(function(file) {
					return file != null;
				});
			};
			var setDirpath = function(dirpath) {
				if (!dirpath) return;
        		$scope.filesystem = $scope.loadChildren(dirpath);
        		$scope.$apply();
			};

        	win.on('dir.open', function(dirpath) {
        		store.set('dir.open', dirpath);
        		setDirpath(dirpath);
			});
			$scope.$on('nodeSelected', function(event, node) {
				win.emit('file.open', node.filepath);
			});
			setDirpath(store.get('dir.open'));

        }]);
});
