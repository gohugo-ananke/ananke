---
title: "Bayesian Calibration Logic"
date: 2025-10-24
summary: "Deriving the probability density function for radiocarbon dating calibration."
image: "/images/ZenBrushstroke.png"
tags: ["Math", "Statistics"]
---

When calibrating Radiocarbon dates, we aren't just looking up a value on a curve. We are multiplying two probability distributions.

The uncalibrated date is a Gaussian distribution:

$$
R(t) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{1}{2} \left( \frac{t - \mu}{\sigma} \right)^2}
$$

We convolute this with the calibration curve $C(t)$ to get the posterior density:

$$
P(t_{cal}|t_{raw}) \propto \int R(t_{raw}) \cdot C(t) \, dt
$$

This is why strict "intercept" methods fail for wiggles in the Hallstatt Plateau. We need the full area under the curve.