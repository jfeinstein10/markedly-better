function Preview(preview, buffer) {
    this.delay = 50;
    this.timeout = null;
    this.running = false;
    this.oldText = null;
    this.buffer = buffer; 
    this.buffer.attr("id", "buffer");
    this.buffer.hide(); 
    this.preview = preview;
    this.preview.attr("id", "preview");
    this.preview.show();
}

Preview.prototype.swapBuffers = function() {
    var buffer = this.preview, 
        preview = this.buffer;
    this.buffer = buffer; 
    this.buffer.attr("id", "buffer");
    this.buffer.hide(); 
    this.preview = preview;
    this.preview.scrollTop(this.buffer.scrollTop());
    this.preview.scrollLeft(this.buffer.scrollLeft());
    this.preview.attr("id", "preview");
    this.preview.show();
};

Preview.prototype.update = function(text) {
    if (this.timeout) { clearTimeout(this.timeout); }
    var $this = this;
    var callback = function() {
        $this.createPreview(text);
    };
    this.timeout = setTimeout(callback, this.delay);
};

Preview.prototype.createPreview = function(text) {
    this.timeout = null;
    if (this.running || text === this.oldtext) 
        return;
    this.oldtext = text;
    this.running = true;
    marked.mathIds = [];
    marked.copyMathIds = [];
    this.buffer.html(marked(text));
    // copy over reused math 
    for (var key in marked.copyMathIds) {
        var clone = marked.copyMathIds[key];
        $("#"+key).html($("#"+clone).html());
    }
    // sanitize old math
    for (var key in marked.oldMath) {
        var id = marked.oldMath[key];
        if (marked.mathIds.indexOf(id) < 0 && !marked.copyMathIds[id]) {
            delete marked.oldMath[key];
        }
    }
    // render new math
    marked.mathIds.forEach(function(id) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, id]); 
    });
    var $this = this;
    MathJax.Hub.Queue(["previewDone", $this]);
};

Preview.prototype.previewDone = function() {
    this.running = false;
    this.swapBuffers();
};
