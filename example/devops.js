var $ = go.GraphObject.make;

function init() {
	window.myDiagram = $(go.Diagram, "myDiagramDiv", {
		initialContentAlignment : go.Spot.TopCenter,
		"undoManager.isEnabled" : true
	});

	go.ToolManager.hoverDelay = 1;

	addGroupTemplatesToDiagram(myDiagram);
	addLinkTemplatesToDiagram(myDiagram);
	addNodeTemplatesToDiagram(myDiagram);

	var data = genDiagramData();

	myDiagram.model.nodeDataArray = data.nodes;
	myDiagram.model.linkDataArray = data.links;
}

function onLinkClick(e, link) {
	console.log("from:", link.data.from, ", to:", link.data.to);
}

function onNodeClick(e, node) {
	console.log("node:", node.data.key);
	// nui.go(...)
}

function addLinkTemplatesToDiagram(myDiagram) {
	var curveLink = $(go.Link, {
		mouseEnter : onLinkMouseEnter,
		mouseLeave : onLinkMouseLeave,
		curve : go.Link.Bezier,
		adjusting : go.Link.Stretch,
		reshapable : true,
		relinkableFrom : true,
		relinkableTo : true,
		toShortLength : 3,
		cursor : "pointer",
		click : onLinkClick,
		curviness : 20,
		toolTip : // define a tooltip for each node
		$(go.Adornment, "Spot", {
			background : "transparent"
		}, // avoid hiding tooltip when mouse moves
		$(go.Placeholder, {
			padding : 5
		}), $(go.TextBlock, {
			alignment : go.Spot.Top,
			alignmentFocus : go.Spot.Bottom,
			stroke : "white",
			font : "bold 16px sans-serif",
			text : "See information"
		}))
	}, new go.Binding("points").makeTwoWay(), $(go.Shape, {
		strokeWidth : 1.5
	}, new go.Binding("stroke", "isHighlighted", function(h) {
		return h ? "crimson" : "green";
	}).ofObject()), $(go.Shape, // the arrowhead
	{
		toArrow : "standard",
		stroke : null
	}, new go.Binding("fill", "isHighlighted", function(h) {
		return h ? "crimson" : "green";
	}).ofObject())/*
					 * , $(go.Panel, "Auto",
					 * $(go.Shape, // the label background,
					 * which becomes // transparent around the edges { fill:
					 * $(go.Brush, "Radial", { 0: "rgb(240,
					 * 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240,
					 * 240, 0)" }), stroke: null }),
					 * $(go.TextBlock, "dependency", // the
					 * label text { textAlign: "center", font: "9pt helvetica,
					 * arial, sans-serif", margin: 4, editable: true // enable
					 * in-place editing }, // editing the text automatically
					 * updates the model data new
					 * go.Binding("text").makeTwoWay()) )
					 */
	);

	var orthogonalLink = $(go.Link, {
		mouseEnter : onLinkMouseEnter,
		mouseLeave : onLinkMouseLeave,
		routing : go.Link.Orthogonal
	}, $(go.Shape, new go.Binding("stroke",
			"isHighlighted", function(h) {
				return h ? "crimson" : "black";
			}).ofObject()), $(go.Shape, {
		toArrow : "Standard",
		stroke : null,
	}, new go.Binding("fill", "isHighlighted", function(h) {
		return h ? "crimson" : "black";
	}).ofObject()));

	var fieldLink = $(go.Link, {
		relinkableFrom : true,
		relinkableTo : true, // let user reconnect links
		toShortLength : 4,
		fromShortLength : 2,
		routing : go.Link.Orthogonal
	}, new go.Binding("routing", "datamap", function() {
		return go.Link.Normal
	}), $(go.Shape, {
		strokeWidth : 1.5
	}), $(go.Shape, {
		toArrow : "Standard",
		stroke : null
	}));

	var linkTemplateMap = new go.Map("string", go.Link);

	linkTemplateMap.add("", fieldLink);
	linkTemplateMap.add("curveLink", curveLink);
	linkTemplateMap.add("ol", orthogonalLink);
	linkTemplateMap.add("fieldLink", fieldLink);

	myDiagram.linkTemplateMap = linkTemplateMap;
}

function addGroupTemplatesToDiagram(myDiagram) {
	var springGroup = $(go.Group, "Auto", {
		// width: 600,
		// height: 300,
		// alignment: go.Spot.Center,
		layout : $(go.ForceDirectedLayout, {
		// defaultSpringLength: 30,
		// defaultElectricalCharge: 100
		})
	}, /*
		 * new go.Binding("location", "loc", go.Point.parse)
		 * .makeTwoWay(go.Point.stringify),
		 */new go.Binding("desiredSize", "size",
			go.Size.parse).makeTwoWay(go.Size.stringify),
			$(go.Shape, "Rectangle", {
				fill : "white",
				stroke : "gray",
				strokeWidth : 0
			}), $(go.Placeholder
			// , {alignment: go.Spot.Center}
			// , new go.Binding("desiredSize", "size",
			// go.Size.parse).makeTwoWay(go.Size.stringify)
			));

	var rtg = $(go.Group, "Auto", { // define the group's
		// internal layout
		layout : $(go.TreeLayout, {
			angle : 0,
			arrangement : go.TreeLayout.ArrangementVertical,
			isRealtime : false
		})
	}, /*
		 * new go.Binding("location", "loc", go.Point.parse)
		 * .makeTwoWay(go.Point.stringify),
		 */new go.Binding("desiredSize", "size",
			go.Size.parse).makeTwoWay(go.Size.stringify),
			$(go.Shape, "Rectangle", {
				fill : "rgba(128,128,128,0.2)",
				stroke : "gray",
				strokeWidth : 0
			}), $(go.Placeholder));

	var groupTemplateMap = new go.Map("string", go.Group);

	groupTemplateMap.add("", springGroup);
	groupTemplateMap.add("springGroup", springGroup);

	myDiagram.groupTemplateMap = groupTemplateMap;
}

function addNodeTemplatesToDiagram(myDiagarm) {
	var normalNode = $(go.Node, "Auto", {
		mouseEnter : onNodeMouseEnter,
		mouseLeave : onNodeMouseLeave,
		cursor : "pointer",
		click : onNodeClick
	}, $(go.Panel, "Horizontal", $(
			go.Picture, {
				margin : 5,
				width : 50,
				height : 50
			}, new go.Binding("source") || "images/gear.svg"),

	$(go.TextBlock, "undefined", {
		margin : 12,
		stroke : "white",
		font : "14px sans-serif"
	}, new go.Binding("stroke", "isHighlighted", function(h) {
		return h ? "crimson" : "black";
	}).ofObject(), new go.Binding("text", "name").makeTwoWay())))

	var nodeTemplateMap = new go.Map("string", go.Node);

	nodeTemplateMap.add("", normalNode);
	nodeTemplateMap.add("normalNode", normalNode);

	myDiagram.nodeTemplateMap = nodeTemplateMap;
}

function onNodeMouseEnter(e, node) {
	var diagram = node.diagram;
	diagram.startTransaction("highlight");
	// remove any previous highlighting
	diagram.clearHighlighteds();
	node.isHighlighted = true;
	// for each Link coming out of the Node, set Link.isHighlighted
	node.findLinksOutOf().each(function(l) {
		l.isHighlighted = true;
	});
	// for each Node destination for the Node, set Node.isHighlighted
	node.findNodesOutOf().each(function(n) {
		n.isHighlighted = true;
	});
	diagram.commitTransaction("highlight");
};

function onNodeMouseLeave(e, obj) {
	myDiagram.clearHighlighteds();
};

function onLinkMouseEnter(e, link) {
	var diagram = link.diagram;
	diagram.startTransaction("highlight");
	// remove any previous highlighting
	diagram.clearHighlighteds();
	link.isHighlighted = true;
	link.fromNode.isHighlighted = true;
	link.toNode.isHighlighted = true;
	// for each Link coming out of the link, set Link.isHighlighted
	// link.findLinksOutOf().each(function(l) {
	// l.isHighlighted = true;
	// });
	// // for each link destination for the link, set link.isHighlighted
	// link.findNodesOutOf().each(function(n) {
	// n.isHighlighted = true;
	// });
	diagram.commitTransaction("highlight");
};

function onLinkMouseLeave(e, obj) {
	myDiagram.clearHighlighteds();
};

function genDiagramData() {

	var addSystemDiagramNodeStyles = function(nodes) {
		nodes.forEach(function(node) {
			node.category = "normalNode";
			node.group = "system";
			node.fill = go.Brush.randomColor()
		})
	}

	var addSystemDiagramLinkStyles = function(links) {
		links.forEach(function(link) {
			link.category = "curveLink";
		})
	}

	var data = getDiagramMetaData();
	addSystemDiagramNodeStyles(data.nodes);

	data.nodes = [ {
		key : "system",
		isGroup : true,
		category : "springGroup",
		// loc : "200 200",
		system : "",
	} ].concat(data.nodes);

	addSystemDiagramLinkStyles(data.links);

	return data;
}

function getDiagramMetaData() {
	var nodes = [ {
		key : "tomcat",
		name : "tomcat",
		source : "images/gear.svg"
	}, {
		key : "mysql",
		name : "mysql",
		source : "images/gear.svg"
	}, {
		key : "LB",
		name : "LB",
		source : "images/gear.svg"
	}, {
		key : "redis",
		name : "redis",
		source : "images/gear.svg"
	} ];

	var links = [ {
		from : "tomcat",
		to : "mysql"
	}, {
		from : "tomcat",
		to : "redis"
	}, {
		from : "LB",
		to : "tomcat"
	} ];

	return {
		nodes : nodes,
		links : links
	}
}
