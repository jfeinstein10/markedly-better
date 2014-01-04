//
// File system
//
function FileSystem() {
    this.root = new DirectoryDescriptor('root', 'root');
};
FileSystem.prototype.getTree = function() {
    return this.root.getTreeRep().children;
};
FileSystem.prototype.export = function() {
    return JSON.stringify(this.root.toJSON());
};
FileSystem.import = function(jsonString) {
    var json = JSON.parse(jsonString);
    DirectoryDescriptor.fromJSON(json);
    return new FileSystem();
};


//
// Directory structure
//
function DirectoryDescriptor(title) {
    this.storageIndex = 'folder.'+title; 
    initStorage(this, 'isDirectory');
    initStorage(this, 'title');
    initStorage(this, 'children');
    if (!this.children) {
        this.children = [];
    }
    this.isDirectory = true;
    this.title = title;
};
DirectoryDescriptor.prototype.addChild = function(file) {
    if (this.children.indexOf(file.storageIndex) < 0) {
        this.children = this.children.concat([file.storageIndex]);
    }
};
DirectoryDescriptor.prototype.removeChild = function(file) {
    this.children = this.children.filter(function(a) { return a != file.storageIndex; });
};
DirectoryDescriptor.prototype.getTreeRep = function() {
    var recTree = this.children.map(function(childIndex) {
        if (childIndex.indexOf('folder.') == 0) {
            var title = childIndex.replace('folder.', '');
            return new DirectoryDescriptor(title).getTreeRep();
        } else {
            var title = childIndex.replace('file.', '');
            return new FileDescriptor(title).getTreeRep();
        }
    });
    return { label: this.title, 
        storageIndex: this.storageIndex,
        isDirectory: this.isDirectory,
        children: recTree 
    };
};
DirectoryDescriptor.prototype.destroy = function() {
    delete localStorage[this.storageIndex];
    delete localStorage[this.storageIndex+'.isDirectory'];
    delete localStorage[this.storageIndex+'.title'];
    delete localStorage[this.storageIndex+'.children'];
};
DirectoryDescriptor.prototype.toJSON = function() {
    return { storageIndex: this.storageIndex,
        isDirectory: this.isDirectory,
        title: this.title,
        children: this.children.map(function(c) { 
            if (c.indexOf('folder.') == 0) {
                var title = c.replace('folder.', '');
                return new DirectoryDescriptor(title).toJSON();
            } else {
                var title = c.replace('file.', '');
                return new FileDescriptor(title).toJSON();
            }
        })
    };
};
DirectoryDescriptor.fromJSON = function(json) {
    var storageIndex = json.storageIndex; 
    localStorage[storageIndex+'.isDirectory'] = JSON.stringify(json.isDirectory);
    localStorage[storageIndex+'.title'] = JSON.stringify(json.title);
    localStorage[storageIndex+'.children'] = JSON.stringify(
            json.children.map(function(child) {
                return child.storageIndex;
            }));
    json.children.forEach(function(child) {
        if (child.isDirectory) {
            DirectoryDescriptor.fromJSON(child);
        } else {
            FileDescriptor.fromJSON(child);
        }
    });
};


//
// File structure
//
function FileDescriptor(title) {
    this.storageIndex = 'file.'+title;
    initStorage(this, 'isDirectory');
    initStorage(this, 'title');
    initStorage(this, 'contents');
    this.isDirectory = false;
    this.title = title;
};
FileDescriptor.prototype.getTreeRep = function() {
    return { label: this.title,
        storageIndex: this.storageIndex,
        isDirectory: this.isDirectory 
    };
};
FileDescriptor.prototype.destroy = function() {
    delete localStorage[this.storageIndex];
    delete localStorage[this.storageIndex+'.isDirectory'];
    delete localStorage[this.storageIndex+'.title'];
    delete localStorage[this.storageIndex+'.contents'];
};
FileDescriptor.prototype.toJSON = function() {
    return { storageIndex: this.storageIndex,
        isDirectory: this.isDirectory,
        title: this.title,
        contents: this.contents
    };
};
FileDescriptor.fromJSON = function(json) {
    var storageIndex = json.storageIndex; 
    localStorage[storageIndex+'.isDirectory'] = JSON.stringify(json.isDirectory);
    localStorage[storageIndex+'.title'] = JSON.stringify(json.title);
    localStorage[storageIndex+'.contents'] = JSON.stringify(json.contents);
};


//
// Helper
//
// obj must have a 'storageIndex' property
var initStorage = function(obj, name) {
    getStorage(obj, name);
    defineStorage(obj, name);
};
var getStorage = function(obj, name) {
    var key = obj.storageIndex+'.'+name;
    if (localStorage[key]) {
        obj['_'+name] = JSON.parse(localStorage[key]);
    }
};
var defineStorage = function(obj, name) {
    Object.defineProperty(obj, name, { 
        get: function() {
                 return obj['_'+name];
             },
        set: function(val) {
                 obj['_'+name] = val;
                 localStorage[obj.storageIndex+'.'+name] = JSON.stringify(val);
             }
    });
};
var generateId = function(length) {
    length = length || 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
