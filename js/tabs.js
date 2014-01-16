define(['angular',
  'storage'], 
  function(angular, storage) {

    var gui = require('nw.gui'),
    win = gui.Window.get(),
    fs = require('fs'),
    path = require('path');

    return angular.module('markedly.tabs', [])
    .controller('tabs-controller', ['$scope',
      function($scope) {

        $scope.tabs = [];
        var activeTab = null;

        function setActive(tab) {
          if (!tab || tab == activeTab) { return; }
          tab.active = true;
          activeTab = tab;
          storage.saveActiveFile(tab);
          win.emit('tab.select', activeTab.contents);
        }
        function newFile() {
          var tab = { title: null,
            filepath: null,
            active: false,
            contents: ''
          };
          $scope.tabs.push(tab);
          setActive(tab);
        }

        $scope.tabSelect = setActive;
        $scope.removeTab = function(tab) {
          var index = $scope.tabs.indexOf(tab);
          if (index > -1) {
            $scope.tabs.splice(index, 1);
          }
          if (tab == activeTab) {
            activeTab = null;
            if ($scope.tabs.length == 0) {
              newFile();
            } else {
              index = index % $scope.tabs.length;
              setActive($scope.tabs[index]);
            }
          }
        }
        win.on('file.open', function(filepath) {
          for (var i = 0; i < $scope.tabs.length; i++) {
            var tab = $scope.tabs[i];
            if (tab.filepath == filepath) { 
              setActive($scope.tabs[i]);
              return;
            }
          }
          var contents = fs.readFileSync(filepath, { encoding: 'utf-8' });
          var tab = { title: path.basename(filepath), 
            filepath: filepath,
            active: false,
            contents: contents
          };
          $scope.tabs.push(tab);
          setActive(tab);
        });
        win.on('file.new', function() {
          newFile();
          $scope.$apply();
        });
        win.on('file.close', function() {
          $scope.removeTab(activeTab);
          $scope.$apply();
        });
        win.on('editor.change', function(text) {
          activeTab.contents = text;
          storage.saveActiveFile(activeTab);
        });
        win.on('file.save', function() {
          var tab = activeTab;
          if (tab.filepath) {
            fs.writeFileSync(tab.filepath, tab.contents);
          } else {
            win.emit('file.saveas');
          }
        });
        win.on('file.saveas.path', function(filepath) {
          for (var i = 0; i < $scope.tabs.length; i++) {
            var tab = $scope.tabs[i];
            if (tab == activeTab) {
              tab.filepath = activeTab.filepath = filepath;
              tab.title = activeTab.title = path.basename(filepath);
            }
          }
          storage.saveActiveFile(activeTab);
          $scope.$apply();
          win.emit('file.save');
        });

        // export pdf
        function getPdfTemplate(title, html) {
          return ['<!DOCTYPE html>\n',
          '<html>\n',
          '<head>\n',
          '<meta charset="utf-8">\n',
          '<title>'+title+'</title>\n',
          '<link rel="stylesheet" href="',
          'https://stackedit.io/res-min/themes/base.css" />\n',
          '<script type="text/x-mathjax-config">\n',
          "MathJax.Hub.Config({ tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}, messageStyle: 'none'});\n",
          '</script>\n',
          '<script type="text/javascript" src="',
          'https://stackedit.io/libs/MathJax/MathJax.js?config=TeX-AMS_HTML"></script>\n',
          '</head>\n',
          '<body class="pdf">'+html+'</body>\n',
          '</html>'].join("");
        }
        win.on('file.export_pdf', function() {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'https://stackedit-htmltopdf.herokuapp.com/', true);
          xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          xhr.setRequestHeader('page-size', 'A4');
          xhr.responseType = 'blob';
          xhr.onreadystatechange = function() {
            if(this.readyState == 4) {
              if(this.status == 200) {
                var pdf = this.response;
                saveAs(pdf, 'test.pdf');
              }
            }
          };
          var html = marked(activeTab.contents);
          console.log(html);
          var template = getPdfTemplate(activeTab.title, html);
          console.log(template);
          xhr.send(template);
        });


        // some shortcuts
        keymage('ctrl-tab', function() {
          var index = $scope.tabs.indexOf(activeTab) + 1;
          if (index >= $scope.tabs.length) {
            index = 0;
          }
          setActive($scope.tabs[index]);
          $scope.$apply();
        });
        keymage('ctrl-shift-tab', function() {
          var index = $scope.tabs.indexOf(activeTab) - 1;
          if (index < 0) {
            index = $scope.tabs.length - 1;
          }
          setActive($scope.tabs[index]);
          $scope.$apply();
        });

        // restore if possible
        if (storage.getActiveFile()) {
          var tab = storage.getActiveFile();
          $scope.tabs.push(tab);
          activeTab = tab;
          win.emit('tab.select', activeTab.contents);
        }
      }])

.controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
  var ctrl = this,
  tabs = ctrl.tabs = $scope.tabs = [];

  ctrl.select = function(tab) {
    angular.forEach(tabs, function(tab) {
      tab.active = false;
    });
    tab.active = true;
  };

  ctrl.addTab = function addTab(tab) {
    tabs.push(tab);
    if (tabs.length === 1 || tab.active) {
      ctrl.select(tab);
    }
  };

  ctrl.removeTab = function removeTab(tab) {
    var index = tabs.indexOf(tab);
      //Select a new tab if the tab to be removed is selected
      if (tab.active && tabs.length > 1) {
        //If this is the last tab, select the previous tab. else, the next tab.
        var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
        ctrl.select(tabs[newActiveIndex]);
      }
      tabs.splice(index, 1);
    };
  }])
.directive('tabset', function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    scope: {},
    controller: 'TabsetController',
    templateUrl: 'bower_components/angular-ui-bootstrap/template/tabs/tabset.html',
    link: function(scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
      scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
      scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
    }
  };
})
.directive('tab', ['$parse', function($parse) {
  return {
    require: '^tabset',
    restrict: 'EA',
    replace: true,
    templateUrl: 'bower_components/angular-ui-bootstrap/template/tabs/tab.html',
    transclude: true,
    scope: {
      heading: '@',
      onSelect: '&select', 
      onDeselect: '&deselect',
      onRemove: '&remove'
    },
    controller: function() {
        //Empty controller so other directives can require being 'under' a tab
      },
      compile: function(elm, attrs, transclude) {
        return function postLink(scope, elm, attrs, tabsetCtrl) {
          var getActive, setActive;
          if (attrs.active) {
            getActive = $parse(attrs.active);
            setActive = getActive.assign;
            scope.$parent.$watch(getActive, function updateActive(value, oldVal) {
              // Avoid re-initializing scope.active as it is already initialized
              // below. (watcher is called async during init with value ===
              // oldVal)
            if (value !== oldVal) {
              scope.active = !!value;
            }
          });
            scope.active = getActive(scope.$parent);
          } else {
            setActive = getActive = angular.noop;
          }

          scope.$watch('active', function(active) {
            // Note this watcher also initializes and assigns scope.active to the
            // attrs.active expression.
            setActive(scope.$parent, active);
            if (active) {
              tabsetCtrl.select(scope);
              scope.onSelect();
            } else {
              scope.onDeselect();
            }
          });

          scope.disabled = false;
          if ( attrs.disabled ) {
            scope.$parent.$watch($parse(attrs.disabled), function(value) {
              scope.disabled = !! value;
            });
          }

          scope.select = function() {
            if (!scope.disabled ) {
              scope.active = true;
            }
          };
          scope.remove = function() {
            if (!scope.disabled) {
              scope.onRemove();
            }
          }

          tabsetCtrl.addTab(scope);
          scope.$on('$destroy', function() {
            tabsetCtrl.removeTab(scope);
          });


          //We need to transclude later, once the content container is ready.
          //when this link happens, we're inside a tab heading.
          scope.$transcludeFn = transclude;
        };
      }
    };
  }]);
});
