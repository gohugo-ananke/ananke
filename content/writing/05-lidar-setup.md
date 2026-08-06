---
title: "LiDAR Scanning Protocol"
date: 2025-06-20
summary: "Config settings for the Leica BLK360 when scanning high-gloss glazes."
image: "/images/ShanShui.png"
tags: ["Fieldwork", "Hardware"]
---

Scanning glazed pottery is notoriously difficult because the laser scatters on the shiny surface.

### The Config
We modified the scanner intensity to account for the refraction index ($n$):

```json
{
  "scanner_profile": "ceramics_gloss",
  "laser_intensity": 0.85,
  "multi_return": true,
  "filter_ghosts": true
}   
```

### The Math of Reflection

We approximate the Lambertian reflection using a modified coefficient $\rho$:

$$
L_r = \frac{\rho}{\pi} E_i \cos(\theta_i)
$$

For glazed surfaces, we simply ignore the specular component by polarizing the sensor filter.