var _ = require('underscore')
  , tooltip = require('./d3-tip')

var SCALE = {lock:0.35}

module.exports = {
  draw: function(id, d, options){
    var cfg = _.extend({
       radius: 7
      ,w: 600
      ,h: 600
      ,scale: .9
      ,scaleLegend: 1
      ,levels: 3
      ,maxValue: 0
      ,minValue: 1
      ,radians: 2 * Math.PI
      ,color: d3.scale.category10()
      ,fontSize: 10
    }, options)

    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
    var graphSize = Math.min(cfg.w, cfg.h)
    var allAxis = (d[0].map(function(i, j){return i.axis}));
    var total = allAxis.length;
    var radius = cfg.scale*Math.min(cfg.w/2, cfg.h/2);
    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg").attr("width", cfg.w).attr("height", cfg.h).append("g");

    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
    var dataValues = []
      , locked = []
      , handles, path, indicators, locks
      , TIP = tooltip().attr('class', 'd3-tip').html('Click to Lock').offset([-5,0])

    var line = d3.svg.line().interpolate('cardinal-closed')

    drawAxes()
    drawRings()
    recalculatePoints()

    path = initPath()
    handles = initHandles()

    drawPath()
    drawHandles()




    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~ Draw Things
    
    function initPath() {
      return g.append('path').attr('class', 'area-path')
    }

    function initHandles() {
      var hoverRadius = cfg.radius * 1.75

      var _g = g.selectAll('.nodes').data(d[0]).enter()
                  .append('g')
                  .attr('class', 'handle-group')
                  .on('mouseover', function() {
                    d3.select(this).select('.handle')
                        .classed('hover', true)
                        .transition().duration(600).ease('elastic')
                          .attr('r', hoverRadius)
                    d3.select(this).select('.lock')
                        .classed('hover', true)
                        .transition().duration(600).ease('elastic')
                          .attr('r', hoverRadius) 
                  }).on('mouseout', function() {
                    d3.select(this).select('.handle')
                        .classed('hover', false)
                        .transition().duration(500).ease('elastic')
                          .attr('r', cfg.radius) 
                    d3.select(this).select('.lock')
                        .classed('hover', false)
                        .transition().duration(500).ease('elastic')
                          .attr('r', cfg.radius/2)
                  }).on('mousedown', function() {
                    d3.select(this).select('.handle')
                      .transition().duration(10)
                        .attr('r', hoverRadius - 2)
                  }).on('mouseup', function() {
                    d3.select(this).select('.handle')
                      .transition().duration(10)
                        .attr('r', hoverRadius)
                  })


      _g.call(TIP)

      locks = _g
        .append('svg:circle')
          .attr('r', cfg.radius/2)
          .attr('cx', cx).attr('cy', cy)
          .attr('class', 'lock')
          .on('mouseover', hoverOn)

      handles = _g
        .append("svg:circle")
          .attr('r', cfg.radius)
          .attr("alt", function(j){return Math.max(j.value, 0)})
          .attr("cx", cx).attr("cy", cy)
          .attr("data-id", function(j){return j.axis})
          .attr('class', 'handle')
          //.on('mouseover', function(){ d3.select(this).transition().attr('r', cfg.radius*2) })

      indicators = _g
        .append('svg:circle')
          .attr('r', cfg.radius*4)
          .attr("cx", cx).attr("cy", cy)
          .attr('class', 'indicator')
          .attr('data-id', function(j){ return j.axis })
          .on('mouseover', hoverOn)
          .on('mouseout', hoverOff)
          .on('click', toggleLock)

      indicators.call(d3.behavior.drag().on('drag', move))

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
      handles.attr("cx", cx).attr("cy", cy)
      indicators.attr('cx', cx).attr('cy', cy)
      locks.attr('cx', cx).attr('cy', cy)
    }

    function drawAxes() {
      axis.append("line")
          .attr("x1", cfg.w/2)
          .attr("y1", cfg.h/2)
          .attr("x2", function(j, i){return horizontal(i, cfg.w/2, cfg.scale);})
          .attr("y2", function(j, i){return vertical(i, cfg.h/2, cfg.scale);})
          .attr("class", "axis")
    }

    function drawRings() {
      for(var j=0; j<cfg.levels; j++){
        var levelScale = radius*((j+1)/cfg.levels);
        g.selectAll(".levels").data(allAxis).enter().append("svg:line")
         .attr("x1", function(d, i){return horizontal(i, levelScale);})
         .attr("y1", function(d, i){return vertical(i, levelScale);})
         .attr("x2", function(d, i){return horizontal(i+1, levelScale);})
         .attr("y2", function(d, i){return vertical(i+1, levelScale);})
         .attr('class', function(d,i){ return 'ring ring'+i })
         .attr("transform", "translate(" + (cfg.w/2-levelScale) + ", " + (cfg.h/2-levelScale) + ")");
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
      if (!d3.event) return;

      this.parentNode.appendChild(this);
      var dragTarget = d3.select(this);

      var oldData = dragTarget.data()[0];
      var oldX = parseFloat(dragTarget.attr("cx")) - 300;
      var oldY = 300 - parseFloat(dragTarget.attr("cy"));
      var newY = 0, newX = 0, newValue = 0;

      if (Math.abs(oldX - 0) < 1e-5) oldX = 0;

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

      var oldValue = d[0][oldData.order].value
      d[0][oldData.order].value=newValue;

      if (newValue < cfg.minValue || newValue > cfg.maxValue) {
        d3.event.preventDefault && d3.event.preventDefault()
        d3.event.stopPropagation && d3.event.stopPropagation()
        return
      }

      if (! maintainArea()) {
        d3.event.preventDefault && d3.event.preventDefault()
        d3.event.stopPropagation && d3.event.stopPropagation()
        console.log("NOOOOO")
        return
      }
      
      dragTarget
          .attr("cx", function(){return newX + 300 ;})
          .attr("cy", function(){return 300 - newY;});

      recalculatePoints()
      drawPath()
      drawHandles()

      // Debug display to ensure we're keeping area constant
      console.log(_.reduce(d[0], function(m,x,i){ return m+x.value }, 0))

      function maintainArea() {
        var shaveVal = (newValue - oldValue) / (d[0].length-1)
          , shaved = _.map(d[0], function(x){ return [x, x.value - shaveVal] })
          , doShave = d[0]
          , dontShave = _.filter(shaved, function(x){
              return (x[1] < cfg.minValue || x[1] > cfg.maxValue) ||
                     (x[0].order == oldData.order)
            })

        dontShave = _.uniq(dontShave.concat(_.map(locked, mkarr)))

        doShave = _.difference(d[0], _.map(dontShave, _.first))
        shaveVal = (newValue - oldValue) / doShave.length

        //console.log("DOSHAVE", doShave)
        if (!doShave.length)
          return false;

        _.each(doShave, function(x, i) { x.value -= shaveVal })

        return true
      }
    }

    function recalculatePoints() {
      g.selectAll(".nodes")
        .data(d[0], function(j, i){
          dataValues[i] = [cx(j,i), cy(j,i)]
        });

      dataValues[d[0].length] = dataValues[0]
    }

    function hoverOn() {
      d3.select(this).classed('hover', true)
      //TIP.show()
      return true
    }

    function hoverOff() {
      d3.select(this).classed('hover', false)
      //TIP.hide()
      return true
    }

    function toggleLock() {
      if (d3.event.defaultPrevented) return; // drag event

      var id = this.attributes['data-id'].value
        , dataObj = _.find(d[0], function(x){ return x.axis == id })
        , isLocked = _.find(locked, function(x){ return x == dataObj })
        , parent = d3.select(this.parentNode)

      if (! isLocked) {
        if (dataObj)
          locked = _.uniq(locked.concat(dataObj));
        else
          throw "No axis found by the name " + id;

        parent.selectAll('.handle, .indicator, .lock').classed('locked', true)
        _showLockAnimation(parent, true)
      } else {
        locked = _.without(locked, dataObj)
        parent.selectAll('.handle, .indicator, .lock').classed('locked', false)
        _showLockAnimation(parent, false)
      }
    }

    function _showLockAnimation(container, state) {
      var indicator = container.select('.indicator')
        , r = indicator.attr('r')|0

      var smoke = container.append('svg:circle')
        .attr('class', 'smoke-ring')
        .attr('r', r+2)
        .attr('cx', indicator.attr('cx'))
        .attr('cy', indicator.attr('cy'))
        .attr('opacity', 0.25)

      smoke.transition()
        .delay(50).duration(250).ease('ease-out-quart')
          .attr('opacity', 0)
          .attr('r', r + 10)
    }




    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~ Util Functions

    function _pos(i, range, scale, func){
      scale = typeof scale !== 'undefined' ? scale : 1;
      return range * (1 - scale * func(i * cfg.radians / total));
    }
    function horizontal(i, range, scale){ return _pos(i, range, scale, Math.sin); }
    function vertical(i, range, scale){ return _pos(i, range, scale, Math.cos); }

    function lte(x,y) { return x <= y }
    function gte(x,y) { return x >= y }
    function lt(x,y) { return x < y }
    function gt(x,y) { return x > y }
    function mkarr(x) { return [x] }

    function cx(j, i){ return horizontal(i, cfg.w/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.scale); }
    function cy(j, i){ return vertical(i, cfg.h/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.scale); }
  }
};
