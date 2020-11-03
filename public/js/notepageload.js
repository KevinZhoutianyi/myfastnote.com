
    var rendererMD = new marked.Renderer();
        marked.setOptions({
          renderer: rendererMD,
          gfm: true,
          highlight: function(code) {
            return hljs.highlightAuto(code).value;
          },
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false
        });
    hljs.initHighlightingOnLoad();
  
    MathJax = {
        tex: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]], //行内公式选择符
        displayMath: [["$$", "$$"], ["\\[", "\\]"]], //段内公式选择符         
        }, 
    };

    