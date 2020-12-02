
    var rendererMD = new marked.Renderer();
    marked.setOptions({
      renderer: rendererMD,
      gfm: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      tables: true,
      highlight: function(code) {
        return hljs.highlightAuto(code).value;
      },
    
    });
    hljs.initHighlightingOnLoad();
  
    MathJax = {
        tex: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]], //行内公式选择符
        displayMath: [["$$", "$$"], ["\\[", "\\]"]], //段内公式选择符         
        }, 
        options: {
          enableMenu: false 
        }
        
    };
    

    