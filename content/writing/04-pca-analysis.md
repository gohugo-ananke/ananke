---
title: "Dimensionality Reduction in Clay"
date: 2025-08-02
summary: "Using PCA to identify chemical signatures in Ming Dynasty clay sources."
image: "/images/ZenBrushstroke.png"
tags: ["Math", "Data"]
---

We have a dataset of 50 chemical elements ($X$) found in clay samples. To find the geographic source, we project this down to 2 dimensions using Principal Component Analysis.

We seek a linear combination that maximizes variance:

$$
\mathbf{w}_{(1)} = \underset{\|\mathbf{w}\|=1}{\operatorname{arg\,max}} \, \left\{ \sum_i (t_1)_{(i)}^2 \right\}
$$

Where our target matrix $T$ relates to the original data $X$ and weights $W$ by:

$$
T = X W
$$

This reveals that the **Al/Ti ratio** is the strongest predictor of the kiln site.