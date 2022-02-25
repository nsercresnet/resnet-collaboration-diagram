(function() {
  packages = {

    // Lazily construct the package hierarchy from class names.
    root: function(classes) {
      var map = {};

      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = node.id;
          }
        }
        return node;
      }

      classes.forEach(function(d) {
        find(d.name, d);
      });

      return map[""];
    },

    // Return a list of imports for the given array of nodes.
    links: function(nodes,links) {
      var map = {},
          nlinks = [];

      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.id] = d;
      });

      // For each import, construct a link from the source to target node.
      links.forEach(function(d) {
        nlinks.push({source: map[d.source], target: map[d.target], value: d.value})
      });

     return nlinks;
    }

  };
})();
