---
title: "Shortcodes"
applyTo: "layouts/_shortcodes/**/*.html"
description: This file describes the code style for shortcodes in the project.
---

* DO use [InnerDeindent](https://gohugo.io/functions/innerdeindent/) to format the content of shortcodes. This will remove any common leading whitespace from the content, making it easier to read and maintain. Markdown linting will warn/error on indented code blocks and force the user to use backticks instead.

* DO accept both named and positional parameters in the shortcode.

* DO use [IsNamedParams](https://gohugo.io/methods/shortcode/isnamedparams/) to check if the shortcode is being called with named parameters. This will allow you to handle both named and positional parameters in your shortcode.

* DO use [Page](https://gohugo.io/methods/shortcode/page/) and [Site](https://gohugo.io/methods/shortcode/site/) from the shortcode context to access page and site variables.

* DO NOT add any strings that are part of the output to the shortcode. These strings must be defined ino the i18n/en.toml file and accessed using the [`language.Translate`](https://gohugo.io/functions/lang/translate/) function.

* DO add documentation of all new or changed features in shortcodes in the documentation repository.
