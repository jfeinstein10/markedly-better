// configure requirejs
requirejs.config({
    baseUrl: 'js',
    paths: {
        angular : '../bower_components/angular/angular.min',
        bootstrap : '../bower_components/bootstrap/dist/js/boostrap.min',
        highlightjs : '../bower_components/highlightjs/highlight.pack',
        jqtree : '../bower_components/jqtree/tree.jquery',
        jqueryui : '../bower_components/',
        jquery : '../bower_components/jquery/jquery',
        keymaster : '../bower_components/keymaster/keymaster',
    },
    shim: {
        'angular': { exports: 'angular' },
        'jquery': { exports: '$' },
        'jqueryui': ['jquery']
    },
    priority: [
        'angular'
    ],
});


//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";


define(['angular', 
        'filepane',
        'editor',
        'tabs',
        'menu',
        'directives',
        'libs/splitter'], 
function(angular) {
    var app = angular.module('markedly', 
        ['markedly.directives',
        'markedly.editor',
        'markedly.filepane',
        'markedly.tabs',
        'bgDirectives']);

    var $html = angular.element(document.getElementsByTagName('html')[0]);
    angular.element().ready(function() {
        angular.resumeBootstrap([app['name']]);
    });
});
