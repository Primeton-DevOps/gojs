var myDiagram = null;

/**
 * 初始化关系图
 */
function initGojsChart(targetDivId) {
    var graphMake = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram = graphMake(go.Diagram, targetDivId,  // create a Diagram for the DIV HTML element
        {
            initialContentAlignment: go.Spot.Center,  // center the content
            "undoManager.isEnabled": true  // enable undo & redo
        });

    myDiagram.nodeTemplate = graphMake(go.Node, "Auto", {
        mouseEnter: onNodeMouseEnter,
        mouseLeave: onNodeMouseLeave,
        cursor: "pointer",
        click: onNodeClick
    }, graphMake(go.Panel, "Horizontal", graphMake(
        go.Picture, {
            margin: 5,
            width: 50,
            height: 50
        }, new go.Binding("source") || "images/gear.svg"),

        graphMake(go.TextBlock, "undefined", {
            margin: 12,
            stroke: "white",
            font: "14px sans-serif"
        }, new go.Binding("stroke", "isHighlighted", function (h) {
            return h ? "crimson" : "black";
        }).ofObject(), new go.Binding("text", "name").makeTwoWay())))

    // but use the default Link template, by not setting Diagram.linkTemplate
    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        graphMake(go.Link,  // the whole link panel
            {
                curve: go.Link.Bezier, adjusting: go.Link.Stretch,
                reshapable: true, relinkableFrom: true, relinkableTo: true,
                toShortLength: 3
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("curviness"),
            graphMake(go.Shape,  // the link shape
                { strokeWidth: 1.5 }),
            graphMake(go.Shape,  // the arrowhead
                { toArrow: "standard", stroke: null })/*,
            graphMake(go.Panel, "Auto",
                graphMake(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: graphMake(go.Brush, "Radial",
                            { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
                        stroke: null
                    }),
                graphMake(go.TextBlock, "dependency",  // the label text
                    {
                        textAlign: "center",
                        font: "9pt helvetica, arial, sans-serif",
                        margin: 4,
                        editable: true  // enable in-place editing
                    },
                    // editing the text automatically updates the model data
                    new go.Binding("text").makeTwoWay())
            )*/
        );

    // create the model data that will be represented by Nodes and Links
    myDiagram.model = new go.GraphLinksModel(
        genDiagramData(),
        genDiagramRelation());
}

/**
 * 刷新关系图
 */
function refreshGojsChart(diagram) {
    if (null == diagram || "object" != typeof (diagram)) {
        myDiagram.startTransaction("generateDiagram");
        myDiagram.clear();
        myDiagram.model = new go.GraphLinksModel(
            genDiagramData(),
            genDiagramRelation());
        myDiagram.contentAlignment = go.Spot.Center;
        myDiagram.commitTransaction("generateDiagram");
    } else {
        diagram.startTransaction("generateDiagram");
        diagram.clear();
        diagram.model = new go.GraphLinksModel(
            genDiagramData(),
            genDiagramRelation());
        diagram.contentAlignment = go.Spot.Center;
        diagram.commitTransaction("generateDiagram");
    }
}

/**
 * override this function
 */
function onLinkClick(e, link) {
    console.log("from:", link.data.from, ", to:", link.data.to);
}

/**
 * override this function
 */
function onNodeClick(e, node) {
    console.log("node:", node.data.key);
}

function onNodeMouseEnter(e, node) {
    var diagram = node.diagram;
    diagram.startTransaction("highlight");
    // remove any previous highlighting
    diagram.clearHighlighteds();
    node.isHighlighted = true;
    // for each Link coming out of the Node, set Link.isHighlighted
    node.findLinksOutOf().each(function (l) {
        l.isHighlighted = true;
    });
    // for each Node destination for the Node, set Node.isHighlighted
    node.findNodesOutOf().each(function (n) {
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
    return [
        { key: "Alpha", name: "Alpha", source: "images/anchor.svg" },
        { key: "Beta", name: "Beta", source: "images/gear.svg" },
        { key: "Gamma", name: "Gamma", source: "images/anchor.svg" },
        { key: "Delta", name: "Delta", source: "images/gear.svg" }
    ];
}

function genDiagramRelation() {
    return [
        { from: "Alpha", to: "Beta" },
        { from: "Alpha", to: "Gamma" },
        { from: "Gamma", to: "Delta" },
        { from: "Delta", to: "Alpha" }
    ];
}
