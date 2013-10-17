var _ = require('underscore')

module.exports = {
  draw: function(id, d, options){
    var cfg = _.extend({
       radius: 5
      ,w: 600
      ,h: 600
      ,scale: .95
      ,scaleLegend: 1
      ,levels: 3
      ,maxValue: 0
      ,radians: 2 * Math.PI
      ,opacityArea: 0.5
      ,color: d3.scale.category10()
      ,fontSize: 10
    }, options)

    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
    var allAxis = (d[0].map(function(i, j){return i.axis}));
    var total = allAxis.length;
    var radius = cfg.scale*Math.min(cfg.w/2, cfg.h/2);
    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg").attr("width", cfg.w).attr("height", cfg.h).append("g");

    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
    var dataValues = []
      , handles, path

    var line = d3.svg.line().interpolate('cardinal-closed')

    drawAxes()
    drawRings()
    recalculatePoints()

    handles = initHandles()

    path = initPath()
    drawPath()

    drawHandles()




    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~ Draw Things
    
    function initPath() {
      return g.append('path')
                //.style('stroke', '#f00')
                //.style('stroke-width', '5px')
                 .style("fill", function(j, i){return cfg.color(0)})
                 .style("fill-opacity", cfg.opacityArea)
    }

    function initHandles() {
      handles = g.selectAll(".nodes").data(d[0]).enter()
                  .append("svg:circle")
                    .attr('r', cfg.radius)
                    .attr("alt", function(j){return Math.max(j.value, 0)})
                    .attr("cx", function(j, i){
                      return horizontal(i, cfg.w/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.scale);
                    })
                    .attr("cy", function(j, i){
                      return vertical(i, cfg.h/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.scale);
                    })
                    .attr("data-id", function(j){return j.axis})
                    .style("fill", cfg.color(0)).style("fill-opacity", .9)
                    .call(d3.behavior.drag().on('drag', move))

        handles.append("svg:title").text(function(j){return Math.max(j.value, 0)})
        return handles
    }

    function drawPath() {
      var xs = _.map(handles[0], function(x){ return parseFloat(x.attributes.cx.nodeValue) })
        , ys = _.map(handles[0], function(x){ return parseFloat(x.attributes.cy.nodeValue) })
        , zipped = _.zip(xs, ys)

      g.select('path')
        .datum(zipped)
        //.datum(zipped.concat([zipped[0]]))
        .attr('d', line)
    }

    function drawHandles() {
      handles
        .attr("cx", function(j, i){
          return horizontal(i, cfg.w/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.scale);
        })
        .attr("cy", function(j, i){
          return vertical(i, cfg.h/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.scale);
        })
    }

    function drawAxes() {
      axis.append("line")
          .attr("x1", cfg.w/2)
          .attr("y1", cfg.h/2)
          .attr("x2", function(j, i){return horizontal(i, cfg.w/2, cfg.scale);})
          .attr("y2", function(j, i){return vertical(i, cfg.h/2, cfg.scale);})
          .attr("class", "line").style("stroke", "#dddde2").style("stroke-width", "3px");
    }

    function drawRings() {
      for(var j=0; j<cfg.levels; j++){
        var levelScale = radius*((j+1)/cfg.levels);
        g.selectAll(".levels").data(allAxis).enter().append("svg:line")
         .attr("x1", function(d, i){return horizontal(i, levelScale);})
         .attr("y1", function(d, i){return vertical(i, levelScale);})
         .attr("x2", function(d, i){return horizontal(i+1, levelScale);})
         .attr("y2", function(d, i){return vertical(i+1, levelScale);})
         .attr("class", "line").style("stroke", "#d9d9d9").style("stroke-width", "0.5px").attr("transform", "translate(" + (cfg.w/2-levelScale) + ", " + (cfg.h/2-levelScale) + ")");
      }
    }

    function drawLegend() {
      //axis.append("text").attr("class", "legend")
          //.text(_.identity)
          //.style("font-family", "sans-serif").style("font-size", cfg.fontSize + "px")
          //.style("text-anchor", function(d, i){
            //var p = horizontal(i, 0.5);
            //return (p < 0.4) ? "start" : ((p > 0.6) ? "end" : "middle");
          //})
          //.attr("transform", function(d, i){
            //var p = vertical(i, cfg.h / 2);
            //return p < cfg.fontSize ? "translate(0, " + (cfg.fontSize - p) + ")" : "";
          //})
          //.attr("x", function(d, i){return horizontal(i, cfg.w / 2, cfg.scaleLegend);})
          //.attr("y", function(d, i){return vertical(i, cfg.h / 2, cfg.scaleLegend);});
    }




    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~ Drag/Drop

    function move() {
      this.parentNode.appendChild(this);
      var dragTarget = d3.select(this);

      var oldData = dragTarget.data()[0];
      var oldX = parseFloat(dragTarget.attr("cx")) - 300;
      var oldY = 300 - parseFloat(dragTarget.attr("cy"));
      var newY = 0, newX = 0, newValue = 0;

      if(oldX == 0) {
        newY = oldY - d3.event.dy;        
        newValue = (newY/oldY) * oldData.value; 
      } else {
        var slope = oldY / oldX;
        newX = d3.event.dx + parseFloat(dragTarget.attr("cx")) - 300;
        newY = newX * slope;

        var ratio = newX / oldX;
        newValue = ratio * oldData.value; 
      }

      if (newValue < 0 || newValue > cfg.maxValue)
        return d3.event.preventDefault(), d3.event.stopPropagation();
      
      dragTarget
          .attr("cx", function(){return newX + 300 ;})
          .attr("cy", function(){return 300 - newY;});

      var oldValue = d[0][oldData.order].value
      d[0][oldData.order].value=newValue;

      _.each(d[0], function(x, i) {
        var shave = (newValue - oldValue) / (d[0].length-1)
        if (i != oldData.order) d[0][i].value = d[0][i].value - shave
      })
      console.log(_.reduce(d[0], function(memo,x){return memo+x.value}, 0))

      recalculatePoints();
      drawPath()
      drawHandles()
    }

    function recalculatePoints() {
      g.selectAll(".nodes")
        .data(d[0], function(j, i){
          dataValues[i] = [
            horizontal(i, cfg.w/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.scale),
            vertical(i, cfg.h/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.scale)
          ]
        });

      dataValues[d[0].length] = dataValues[0]
    }




    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~ Util Functions

    function _pos(i, range, scale, func){
      scale = typeof scale !== 'undefined' ? scale : 1;
      return range * (1 - scale * func(i * cfg.radians / total));
    }
    function horizontal(i, range, scale){ return _pos(i, range, scale, Math.sin); }
    function vertical(i, range, scale){ return _pos(i, range, scale, Math.cos); }
  }
};
