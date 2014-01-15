define([], 
function() {

    var gui = require('nw.gui'),
        win = gui.Window.get(),
        fs = require('fs');

    var menu = new gui.Menu({
        type: 'menubar'
    });
    function menuItem(submenu, options, shortcut) {
        if (shortcut) {
            keymage(shortcut, options.click);
        }
        submenu.append(new gui.MenuItem(options));
    }
    function sepItem(submenu) {
        submenu.append(new gui.MenuItem({
            type: 'separator'
        }));
    }
    function openInput(selector, callback) {
        var chooser = $(selector);
        chooser.change(function(evt) {
            if (callback) {
                callback($(this).val());
            }
        });
        return function() {
            chooser.trigger('click');  
        }
    }

    // FILE
    var file = new gui.Menu();
    menuItem(file, {
        label: 'New',
        click: function() {
            win.emit('file.new');
        }
    }, 'defmod-n');
    menuItem(file, {
        label: 'Open...',
        click: openInput("#fileOpen", function(filepath) {
            win.emit('file.open', filepath);
        })
    }, 'defmod-o');
    menuItem(file, {
        label: 'Open Directory...',
        click: openInput("#dirOpen", function(dirpath) {
            win.emit('dir.open', dirpath);
        })
    }, 'defmod-shift-o');
    sepItem(file);
    menuItem(file, {
        label: 'Save',
        click: function() {
            win.emit('file.save');
        }
    }, 'defmod-s');
    menuItem(file, {
        label: 'Save As',
        click: function() {
            win.emit('file.saveas');
        }
    }, 'defmod-shift-s');
    win.on('file.saveas', function() {
        var fn = openInput('#fileSaveAs', function(filepath) {
            win.emit('file.saveas.path', filepath);
        });
        fn();
    });
    menu.append(new gui.MenuItem({ label: 'File', submenu: file }));

    // EDIT
    var edit = new gui.Menu();
    menu.append(new gui.MenuItem({ label: 'Edit', submenu: edit }));

    gui.Window.get().menu = menu;
});
