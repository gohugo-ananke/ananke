---
title: "Fragment Reassembly Algorithm"
date: 2025-09-15
summary: "A Python script to match ceramic edges using curvature analysis."
image: "/images/ShanShui.png"
tags: ["Python", "Algorithms"]
---

To match two broken shards, we calculate the curvature profile of the break edge. If $C_1$ is the curvature vector of Shard A and $C_2$ is Shard B (reversed), we minimize the Euclidean distance:

```python
import numpy as np
from scipy.spatial.distance import euclidean

def match_score(edge_a, edge_b):
    # Reverse edge_b to align orientation
    edge_b_reversed = np.flip(edge_b)
    
    # Calculate RMSE (Root Mean Square Error)
    score = euclidean(edge_a, edge_b_reversed)
    
    return score

# Example: Perfect match approaches 0
shard_1 = np.array([0.1, 0.4, 0.8, 0.5])
shard_2 = np.array([0.5, 0.8, 0.4, 0.1])

print(f"Fit Score: {match_score(shard_1, shard_2)}")
```

