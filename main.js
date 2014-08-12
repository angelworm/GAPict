var $ = $ || function(){};

var GA = {};

GA.Gene = function(width, height, path_count) {
    this.w = width;
    this.h = height;
    this.size = path_count || 1;
    this.gene = [];
};

GA.Gene.prototype.randomGeneGenAt = function(index) {
    var data = [
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,
        Math.random() * this.w, Math.random() * this.h,

        Math.random() * 255, Math.random() * 255, Math.random() * 255, Math.random()
    ];
    
    for(var i = 0; i < data.length; i++) {
        this.gene[i + index] = data[i];
    }
};

GA.Gene.prototype.randomGeneGen = function() {
    for(var i = 0; i < this.size; i++) {
        this.randomGeneGenAt(i * 20);
    }
};

GA.Gene.prototype.drawGeneAt = function(ctx, index) {
    var data = this.gene;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(data[index + 0], data[index + 1]);
    ctx.bezierCurveTo(data[index +  2], data[index +  3], data[index +  4] * 2 - data[index +  6], data[index +  5] * 2 - data[index +  7], data[index +  4], data[index +  5]);
    ctx.bezierCurveTo(data[index +  6], data[index +  7], data[index +  8] * 2 - data[index + 10], data[index +  9] * 2 - data[index + 11], data[index +  8], data[index +  9]);
    ctx.bezierCurveTo(data[index + 10], data[index + 11], data[index + 12] * 2 - data[index + 14], data[index + 13] * 2 - data[index + 15], data[index + 12], data[index + 13]);
    ctx.bezierCurveTo(data[index + 14], data[index + 15], data[index +  0] * 2 - data[index +  2], data[index +  1] * 2 - data[index +  3], data[index +  0], data[index +  1]);
    ctx.fillStyle = 'rgba('+Math.round(data[index + 16])+', '+Math.round(data[index + 17])+', '+Math.round(data[index + 18])+', '+data[index + 19]+')';
    ctx.fill();
    ctx.restore();
};

GA.Gene.prototype.drawGene = function(ctx) {
    for(var i = 0; i < this.size; i++) {
        this.drawGeneAt(ctx, i * 20);
    }
};

GA.Gene.prototype.cross = function(b) {
    var ret = new GA.Gene(this.w, this.h, this.size);
    var ia = Math.round(Math.radndom() * this.size * 20);
    var ib = Math.round(Math.radndom() * this.size * 20);
    var inside_gene = b;
    
    if(ia < ib){
        ret.gene = this.gene.concat();
        inside_gene = b;
    } else {
        var tmp = ia; ia = ib; ib = tmp;
        ret.gene = b.gene.concat();
        inside_gene = this;
    }

    var imin = Math.min(ia, ib);
    var imax = Math.max(ia, ib);

    for(var i = imin; i < imax; i++) {
        ret.gene[i] = b.gene[i];
    }
    return ret;
};

GA.Gene.prototype.mutate = function(b) {
    var ret = new GA.Gene(this.w, this.h, this.size);
    ret.randomGeneGen();
    return this.cross(ret);
};

GA.testGene = function(basectx, renderctx, gene) {
    renderctx.fillStyle = "#FFF";
    renderctx.fillRect(0, 0, renderctx.canvas.width, renderctx.canvas.height);
    gene.drawGene(renderctx);
    var base_data = basectx.getImageData(0, 0, basectx.canvas.width, basectx.canvas.height);
    var render_data = renderctx.getImageData(0, 0, renderctx.canvas.width, renderctx.canvas.height);
    var fitness = 0;
    for(var i = 0; i < base_data.length; i++) {
        fitness += Math.abs(base_data[i] - render_data[i]) / 255;
    }
    fitness = 1 - fitness / base_data.length;
    return fitness;
};

function initCanvas(img) {
    var $ce1 = $("#ga-base");
    var $ce2 = $("#ga-best");

    var newX = img.width;
    var newY = img.height;

    $ce1.attr("width", newX);
    $ce1.attr("height", newY);

    var ce_ctx = $ce1.get(0).getContext('2d');
    ce_ctx.drawImage(img, 0, 0, newX, newY);

    $ce2.attr("width", newX);
    $ce2.attr("height", newY);
    var gene = new GA.Gene(newX, newY, 20);
    gene.randomGeneGen();
    gene.drawGene($ce2.get(0).getContext('2d'));

    $("#fitness-elem").text(GA.testGene($ce1.get(0).getContext('2d'),
                                        $ce2.get(0).getContext('2d'),
                                        gene));
}

function loadImg(url, canvas_e) {
    var img = new Image();

    img.onload = function() {
        initCanvas(img);
    };
    img.src = url;
}

$(function() {
	$("#img-url-form").submit(function(e){
		console.log($("#img-url-input").val());

        loadImg($("#img-url-input").val());
        
        e.preventDefault();
	});
});
