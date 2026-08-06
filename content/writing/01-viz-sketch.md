---
title: "Checking the Code: D3 Supply Curves"
date: 2025-11-10
summary: "A tiny D3 snippet I use to sanity-check supply–demand adjustments."
image: "/images/ShanShui.png"
tags: ["Code", "Viz"]
---

I often need to visualize how adaptive subsidies shift curves in real-time. Here is the basic D3.js setup I use for my sketches.

```javascript
const svg = d3.select("#sketch");
const demand = d3.line()([[20, 30], [380, 200]]);
const supply = d3.line()([[20, 200], [380, 40]]);

// Render curves with Celadon Theme colors
svg.append("path").attr("d", demand)
  .attr("stroke", "#7DA2A9") // Teal
  .attr("stroke-width", 3)
  .attr("fill", "none");

svg.append("path").attr("d", supply)
  .attr("stroke", "#C0564B") // Cinnabar
  .attr("stroke-width", 3)
  .attr("fill", "none");

// Add axes
svg.append("line").attr("x1", 20).attr("y1", 200)
  .attr("x2", 20).attr("y2", 30)
  .attr("stroke", "#4A4A4A") // Dark Gray
  .attr("stroke-width", 2);
svg.append("line").attr("x1", 20).attr("y1", 200)
  .attr("x2", 380).attr("y2", 200)
  .attr("stroke", "#4A4A4A") // Dark Gray
  .attr("stroke-width", 2);
```

The intersection point represents our equilibrium $E^*$.

$$
E^* = \frac{Q_d - Q_s}{P}
$$