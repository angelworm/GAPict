/* -*- coding: utf-8-*- */

var $ = $ || function(){};

var GA = {};

GA.GENE_COUNT = 20;   // 一遺伝子は何個のshapeか
GA.GENE_LENGTH = 20;  // 1shapeは何個の値で構成されるか
GA.CHILD_MAX = 40;    // 一世代は何遺伝子か
GA.Image = undefined;

GA.Gene = function(width, height, path_count) {
    this.w = width;
    this.h = height;
    this.size = path_count || 1;
    this.gene = [];
    this.fitness = 1;
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
    var ia = Math.round(Math.random() * this.size * 20);
    var ib = Math.round(Math.random() * this.size * 20);
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
        ret.gene[i] = inside_gene.gene[i];
    }
    return ret;
};

GA.Gene.prototype.mutate = function(b) {
    var ret = new GA.Gene(this.w, this.h, this.size);
    ret.randomGeneGen();
    return this.cross(ret);
};

GA.Gene.prototype.test = function(basectx, renderctx) {
    renderctx.fillStyle = "#FFF";
    renderctx.fillRect(0, 0, renderctx.canvas.width, renderctx.canvas.height);
    this.drawGene(renderctx);
    var base_data = basectx.getImageData(0, 0, basectx.canvas.width, basectx.canvas.height).data;
    var render_data = renderctx.getImageData(0, 0, renderctx.canvas.width, renderctx.canvas.height).data;
    var fitness = 0;
    for(var i = 0; i < base_data.length; i++) {
        fitness += Math.abs(base_data[i] - render_data[i]) / 255;
    }
    this.fitness = 1 - fitness / base_data.length;
    return this.fitness;
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

    for(var i = 0; i < GA.CHILD_MAX; i++) {
        var $canvas = $('<canvas width="'+newX+'" height="'+newY+'" class="ga-test-canvas"/>');
        $("#ga-field").append($canvas);
    }
    var seed = new GA.Gene(newX, newY, GA.GENE_COUNT);
    seed.randomGeneGen();
    GA.runStep([seed]);
}

GA.selectGene = function(genes) {
    var sum = 0;
    var partial_sum = [];
    for(var i = 0; i < genes.length; i++) {
        sum += genes[i].fitness;
        partial_sum[i] = sum;
    }
    var index = sum * Math.random();
    for(i = 0; partial_sum[i] < index; i++) {
        // n.t.d
    }
    return genes[i];
};

GA.runStep = function(seed_genes) {
    var gen = [];
    
    seed_genes.sort(function(a, b) {
        return b.fitness - a.fitness;
    });
    
    gen[0] = seed_genes[0];
    for(var i = 1; i < GA.CHILD_MAX; i++) {
        var action = GA.selectGene([
            {name:"orig", fitness: 0.05},
            {name:"cross",fitness: 0.80},
            {name:"mut",  fitness: 0.15}
        ]).name;
        switch(action) {
        case "orig":
            gen[i] = GA.selectGene(seed_genes);
            break;
        case "cross":
            gen[i] = GA.selectGene(seed_genes).cross(GA.selectGene(seed_genes));
            break;
        case "mut":
            gen[i] = GA.selectGene(seed_genes).mutate();
            break;
        default:
            console.error("no action error");
        }
    }

    console.log(gen);

    var max_fitness = 0, max_fitness_index = 0;
    var basectx = $("#ga-base").get(0).getContext('2d');
    var bestctx = $("#ga-best").get(0).getContext('2d');
    var $canvas_field = $(".ga-test-canvas");
    for(i = 0; i < GA.CHILD_MAX; i++) {
        var testctx = $canvas_field.get(i).getContext('2d');
        var f = gen[i].test(basectx, testctx);
        if(max_fitness < f) {
            max_fitness = f;
            max_fitness_index = i;
        }        
    }
    gen[max_fitness_index].drawGene(bestctx);

    $("#fitness-elem").text(max_fitness);
    
    return gen;
};

GA.run = function() {
    var seeds = [];
    for(var i = 0; i < 20; i++) {
        var g = new GA.Gene(500, 515, GA.GENE_COUNT);
        g.randomGeneGen();
        seeds[i] = g;
    }
    return window.setInterval(function() {
        seeds = GA.runStep(seeds);
    }, 1000);
};

function loadImg(url, callback) {
    var img = new Image();

    img.onload = function() {
        callback(img);
    };
    img.src = url;
}

$(function() {
    var interval_id;

	$("#option-form").submit(function(e){
		console.log($("#img-url-input").val());

        GA.CHILD_MAX = $("#child-gene-input").val();
        GA.GENE_COUNT = $("#polygon-size-input").val();

        loadImg($("#img-url-input").val(), function(img) {
            initCanvas(img);
            $("#submit-button").hide();
            $("#stop-button").show();
            interval_id = GA.run();
        });

        e.preventDefault();
	});
    $("#stop-button").click(function() {
        $("#submit-button").show();
        $("#stop-button").hide();
        window.clearInterval(interval_id);
    });
});
