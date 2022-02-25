
$(document).ready(function(){
	graph_edge(2016,2021);
	$('#year').change(function(){
		$('svg').html('')
		graph_edge($(this).val(),$(this).val());
	});
})

function graph_edge(startyear,endyear) {
			h=800;
			w = h;
			rx = w / 2;
			ry = h / 2;
			rotate = 0;

			/*var graph=JSON.parse(result);*/

			svg=undefined;
			layout=undefined;

			cluster = d3.layout.cluster()
			.size([360, ry - 120])
			.sort(function(a, b) { return d3.ascending(a.id, b.id); });
			nodes = cluster.nodes(packages.root(graph.nodes));

			d3.select("svg")
			.style("padding-top", 0)
			.style("padding-left", 0);

			var color = {
					"T1":'#E58606',
					"L3": '#5D69B1',
					"S": '#17571a',
					"L6": '#99C945',
					"L2": '#CC61B0',
					"L5": '#24796C',
					"T3": '#DAA51B',
					"L4": '#2F8AC4',
					"L1": '#764E9F',
					"T2": '#A5AA99'
			}
			div = d3.select("#graph");
			svg = d3.select("svg")
			.attr('viewBox', null)
			.attr('preserveAspectRatio', null)
			.attr("width", w)
			.attr("height", w)
			.append("svg:g")
			.attr("transform", "translate(" + rx + "," + ry + ")")
			.style("padding-top", 0)
			.style("padding-left", 0);

				d3.select("#legenddiv").empty();

				var legend = d3.select("#legenddiv").append("ul").attr('class','legendedge');
				tr = legend.selectAll("li").data(Object.keys(color)).enter().append("li")
				.style("background-color",function(d){
					return color[d]
				})
				.text(function(d){ 
					return d;
				})
				.style("color","white")

			tr.on("mouseover", emouseover).on("mouseout", emouseout);


			svg.append("svg:path")
			.attr("class", "arc")
			.style("opacity", 1)
			.attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
			.on("mousedown", mousedown);

			d3.select('#graph')
			.style("width", d3.select('svg').style("width"))
			.on("mousemove", mousemove)
			.on("mouseup", mouseup);

			gnode=svg.selectAll("g.node")
			.data(nodes.filter(function(n) { return !n.children; }))
			.enter()
			.append("svg:g").attr("class", "node")
			.attr("id", function(d) { return "node-" + d.key; })
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

			gnode.append("rect")
			.attr('x',0)
			.attr('y',-10)
			.attr("width", 8)
			.attr("height",20)
			.attr('fill',function(d) { return color[d.group]; })
			.attr("opacity",0);

			gnode.append("svg:text")
			.attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
			.attr("dy", ".31em")
			.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			.attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
			.text(function(d) { return d.name.substring(d.name.lastIndexOf(".")+1); })
			.style("fill", function(d) { return color[d.group]; })
			.style("font-size", Math.round(w/60))
			.style("font-family", 'verdana,arial')
			.on("mouseover", mouseover)
			.on("mouseout", mouseout);

			bundle = d3.layout.bundle();

			//var path = svg.selectAll("path.link").remove();

			var line2= d3.svg.line.radial()
			.interpolate("bundle")
			.tension(0)
			.radius(function(d) { return d.y; })
			.angle(function(d) { return d.x / 180 * Math.PI; });


			var line= d3.svg.line.radial()
			.interpolate("bundle")
			.tension(.5)
			.radius(function(d) { return d.y; })
			.angle(function(d) { return d.x / 180 * Math.PI; });

			links = packages.links(graph.nodes,graph.links);
			var splines = bundle(links);

			var path = svg.selectAll("path.link")
			.data(links)
			.enter().append("svg:path")
			.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
			.attr("d", function(d, i) { return line2(splines[i]); })
			.style("stroke", function(d) { return pathcolor(d.source.key,d.target.key); })
			.style("stroke-width", function(d) { return d.value});


			function mouse(e) {
				return [e.pageX - rx, e.pageY - ry];
			}

			function mousedown() {
				m0 = mouse(d3.event);
				d3.event.preventDefault();
			}

			function mousemove() {
				if (typeof(m0)!=="undefined") {
					m1 = mouse(d3.event),
					dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
					div.style("-webkit-transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
				}
			}

			function mouseup() {
				if (typeof(m0)!=="undefined") {
					m1 = mouse(d3.event),
					dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

					m0 = undefined;
					rotate += dm;
					if (rotate > 360) rotate -= 360;
					else if (rotate < 0) rotate += 360;

					div.style("-webkit-transform", null);

					svg
					.attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
					.selectAll("g.node text")
					.attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
					.attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
					.attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
				}
			}

			function mouseover(d) {
				svg.selectAll(".node").classed("notsource", true);

				svg.selectAll("path.link.target-" + d.key)
				.classed("target", true)
				.each(updateNodes("source", true));

				svg.selectAll("path.link.target-" + d.key)
				.each(updateNodes("notsource", true));

				svg.selectAll("path.link.source-" + d.key)
				.classed("source", true)
				.each(updateNodes("target", true));

				svg.selectAll("path.link.source-" + d.key)
				.each(updateNodes("notsource", true));

			}

			function mouseout(d) {
				svg.selectAll(".node").classed("notsource", false);

				svg.selectAll("path.link.source-" + d.key)
				.classed("source", false)
				.each(updateNodes("target", false));

				svg.selectAll("path.link.target-" + d.key)
				.classed("target", false)
				.each(updateNodes("source", false));
			}

			function updateNodes(name, value) {
				return function(d) {
					if (value) this.parentNode.appendChild(this);
					if(name!=='notsource'){
						svg.select("#node-" + d[name].key).classed(name, value);
					}
				};
			}


			function pathcolor(ds,dt){
				$.each(graph.nodes,function(){
					if (this.key==ds){
						g1=this.group;
					}
					if (this.key==dt){
						g2=this.group;
					}
				});
				if (g1==g2){
					return color[g1];
				}else{
					return '#595959'
				}
			}


		svg.selectAll("path.link")
		.transition()
		.duration(400)
		.attr("d", function(d, i) { return line(splines[i]); });

		svg.selectAll("g.node")
		.style("opacity", 1e-6)
		.transition()
		.duration(400)
		.style("opacity", 1)

		function emouseover(d){
			graph.nodes.each(function(g){
				if (g.group==d){
					svg.selectAll("path.link.target-" + g.key)
					.classed("target", true)
					.each(updateNodes("source", true));
					d3.select('#node-'+g.key).classed("target", true).style("fill", function(d) { return color[g.group]; });
					d3.select('#node-'+g.key+' text').attr("dx", function(d) { return d.x < 180 ? 12 : -12; });
					d3.select('#node-'+g.key+' rect').attr("opacity",1);
					svg.selectAll("path.link.source-" + g.key)
					.classed("source", true)
					.each(updateNodes("target", true));
				}
			})
		}

		function emouseout(){
			d3.selectAll('g.node text').attr("dx", function(d) { return d.x < 180 ? 8 : -8; });
			d3.selectAll('g.node rect').attr("opacity",0);			
			svg.selectAll("path")
			.classed("source", false)
			svg.selectAll("path")
			.classed("target", false)
			svg.selectAll("g.node")
			.classed("source", false)
			svg.selectAll("g.node")
			.classed("target", false)
		}

}
