<template>
  <div class="test-for-x6">
    <div id="container1" style="background-color: pink"></div>
    <div id="container2" style="background-color: pink"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { Graph } from "@antv/x6";
import { DagreLayout } from "@antv/layout";

export default defineComponent({
  setup() {
    onMounted(nodeNormal);
    // onMounted(nodeSerial);
  },
});


function nodeNormal() {

  const graph = new Graph({
    container: document.getElementById("container1"),
    width: 800,
    height: 600,
    scroller: {
      enabled: true,
      pannable: true,
      pageVisible: true,
      pageBreak: false,
    },
    mousewheel: {
      enabled: true,
      modifiers: ["ctrl", "meta"],
    },
  });

  const dagreLayout = new DagreLayout({
    type: "dagre",
    rankdir: "LR",
    align: "UR",
    ranksep: 35,
    nodesep: 15,
  });
  const model = dagreLayout.layout(createNormalGraph());

  graph.fromJSON(model);
}


  function nodeSerial(){
    const graph = new Graph({
      container: document.getElementById('container2'),
      width: 800,
      height: 600,
      scroller: {
      enabled: true,
      pannable: true,
      pageVisible: true,
      pageBreak: false,
    },
    mousewheel: {
      enabled: true,
      modifiers: ["ctrl", "meta"],
    },
  });

    const dagreLayout = new DagreLayout({
      type: "dagre",
      rankdir: "LR",
      align: "UR",
      ranksep: 35,
      nodesep: 15,
    });
    const model = dagreLayout.layout(createSerialGraph());

    graph.fromJSON(model);

  }


function createNormalGraph() {
  const nodeNum = 20;
  let nodes = createNodes(nodeNum);

  const edgeNum = 20;
  let edges = [];

  for (let i = 0; i < edgeNum; i++) {
    let e1 = Math.floor(Math.random() * nodeNum);
    let e2;
    do {
      e2 = Math.floor(Math.random() * nodeNum);
    } while (e1 == e2);

    edges.push({
      source: e1.toString(),
      target: e2.toString(),
    });
  }

  return { nodes, edges };
}

function createSerialGraph() {
  const nodeNum = 10;
  let nodes = createNodes(nodeNum);

  const edgeNum = 10;
  let edges = [];

  for (let i = 1; i < edgeNum; i++) {
    edges.push({
      source: (i-1).toString(),
      target: i.toString(),
    });
  }

  return { nodes, edges };
}

function createNodes(nodeNum){
  let nodes = [];
  for (let i = 0; i < nodeNum; i++) {
    nodes.push({
      id: i.toString(),
      width: 80,
      height: 40,
      label: "节点 " + i,
    });
  }
  return nodes;
}
</script>
