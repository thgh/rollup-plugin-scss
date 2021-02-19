function ___$insertStylesToHeader(css) {
  if (!css) {
    return
  }
  if (typeof window === 'undefined') {
    return
  }

  const style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);
  return css
}

___$insertStylesToHeader({"css":".rollup .plugin .scss {\n  color: green;\n  user-select: none; }\n","map":null});

console.log('scss imported');
