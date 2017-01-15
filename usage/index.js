var myDiagram = null;

function init() {
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram = $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
        {
            initialContentAlignment: go.Spot.Center,  // center the content
            "undoManager.isEnabled": true  // enable undo & redo
        });

    myDiagram.nodeTemplate = $(go.Node, "Auto", {
        mouseEnter: onNodeMouseEnter,
        mouseLeave: onNodeMouseLeave,
        cursor: "pointer",
        click: onNodeClick
    }, $(go.Panel, "Horizontal", $(
        go.Picture, {
            margin: 5,
            width: 50,
            height: 50
        }, new go.Binding("source") || "images/gear.svg"),

        $(go.TextBlock, "undefined", {
            margin: 12,
            stroke: "white",
            font: "14px sans-serif"
        }, new go.Binding("stroke", "isHighlighted", function (h) {
            return h ? "crimson" : "black";
        }).ofObject(), new go.Binding("text", "name").makeTwoWay())))

    // but use the default Link template, by not setting Diagram.linkTemplate
    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            {
                curve: go.Link.Bezier, adjusting: go.Link.Stretch,
                reshapable: true, relinkableFrom: true, relinkableTo: true,
                toShortLength: 3
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("curviness"),
            $(go.Shape,  // the link shape
                { strokeWidth: 1.5 }),
            $(go.Shape,  // the arrowhead
                { toArrow: "standard", stroke: null })/*,
            $(go.Panel, "Auto",
                $(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: $(go.Brush, "Radial",
                            { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
                        stroke: null
                    }),
                $(go.TextBlock, "dependency",  // the label text
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
        [
            { key: "Alpha", name: "Alpha", source: "images/anchor.svg" },
            { key: "Beta", name: "Beta", source: "images/gear.svg" },
            { key: "Gamma", name: "Gamma", source: "images/anchor.svg" },
            { key: "Delta", name: "Delta", source: "images/gear.svg" }
        ],
        [
            { from: "Alpha", to: "Beta" },
            { from: "Alpha", to: "Gamma" },
            { from: "Gamma", to: "Delta" },
            { from: "Delta", to: "Alpha" }
        ]);
}

function onLinkClick(e, link) {
    console.log("from:", link.data.from, ", to:", link.data.to);
}

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
