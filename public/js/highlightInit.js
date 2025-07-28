hljs.highlightAll();
hljs.addPlugin(new CopyButtonPlugin());

const pres = document.getElementsByTagName("pre");
for (let i = 0; i < pres.length; i++) {
  pres[i].innerHTML = pres[i].innerHTML.replace(/    /g, "\t");
}

console.log(hljs);
