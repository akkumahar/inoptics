import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import './CustomEditor.css';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaMinus, FaListOl, FaListUl, FaRegSquare, FaTable, FaSmile, FaSearch, FaFont, FaFillDrip } from 'react-icons/fa';
import { throttle } from 'lodash';

const CustomEditor = ({ value = '', onChange, placeholder = '' }) => {
  const editorRef = useRef(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showSpecialCharPanel, setShowSpecialCharPanel] = useState(false);
  const [showTablePanel, setShowTablePanel] = useState(false);
  const [currentFont, setCurrentFont] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentLineHeight, setCurrentLineHeight] = useState('');
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentLetterSpacing, setCurrentLetterSpacing] = useState('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceContent, setSourceContent] = useState('');
  const [internalHtml, setInternalHtml] = useState(value || '');

  const debouncedOnChange = useCallback(
    throttle((html) => {
      console.log('onChange triggered with:', html);
      if (onChange) onChange(html);
    }, 500),
    [onChange]
  );

  const saveHistory = useCallback(() => {
    if (editorRef.current) {
      setHistory((prev) => [...prev, editorRef.current.innerHTML]);
      setRedoStack([]);
    }
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [editorRef.current.innerHTML, ...prev]);
    setInternalHtml(last);
    setHistory(history.slice(0, -1));
  }, [history]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, editorRef.current.innerHTML]);
    setInternalHtml(next);
    setRedoStack(redoStack.slice(1));
  }, [redoStack]);

  const changeCase = useCallback((type) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    const text = range.toString();
    let newText = text;
    if (type === 'upper') newText = text.toUpperCase();
    if (type === 'lower') newText = text.toLowerCase();
    if (type === 'capitalize') newText = text.replace(/\b\w/g, (c) => c.toUpperCase());
    document.execCommand('insertText', false, newText);
    handleInput(true);
  }, [saveHistory]);

  const applyBorder = useCallback((type) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const node = selection.anchorNode.parentElement;
    switch (type) {
      case 'borderBottom':
        node.style.borderBottom = '1px solid black';
        break;
      case 'borderTop':
        node.style.borderTop = '1px solid black';
        break;
      case 'borderLeft':
        node.style.borderLeft = '1px solid black';
        break;
      case 'borderRight':
        node.style.borderRight = '1px solid black';
        break;
      case 'borderAll':
        node.style.border = '1px solid black';
        break;
      case 'noBorder':
        node.style.border = 'none';
        node.style.borderTop = '';
        node.style.borderBottom = '';
        node.style.borderLeft = '';
        node.style.borderRight = '';
        break;
      default:
        break;
    }
    handleInput(true);
  }, [saveHistory]);

  const insertEquation = useCallback(() => {
    const latex = prompt('Enter LaTeX equation (e.g. x^2 + y^2 = z^2):');
    if (latex) {
      saveHistory();
      document.execCommand('insertHTML', false, `<span class="equation">\\(${latex}\\)</span>`);
      handleInput(true);
    }
  }, [saveHistory]);

  const insertShape = useCallback((shape) => {
    saveHistory();
    let html = '';
    if (shape === 'rect') {
      html = '<div style="width:100px;height:50px;border:1px solid #000;"></div>';
    }
    document.execCommand('insertHTML', false, html);
    handleInput(true);
  }, [saveHistory]);

  const zoomEditor = useCallback((factor) => {
    saveHistory();
    if (editorRef.current) {
      const current = parseFloat(editorRef.current.style.zoom || 1);
      editorRef.current.style.zoom = current * factor;
    }
    handleInput(true);
  }, [saveHistory]);

  const getWordCount = useCallback(() => {
    const text = editorRef.current?.innerText.trim() || '';
    return `Words: ${text.split(/\s+/).length}, Characters: ${text.length}`;
  }, []);

  const updateCurrentFormatting = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let node = selection.anchorNode;
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (!editorRef.current.contains(node)) return;
    let block = node;
    while (block && block !== editorRef.current && !['DIV', 'P', 'LI'].includes(block.nodeName)) {
      block = block.parentNode;
    }
    let inline = node;
    while (inline && inline !== editorRef.current && inline.nodeName !== 'SPAN') {
      inline = inline.parentNode;
    }
    let size = '';
    if (inline?.style?.fontSize) size = inline.style.fontSize;
    else if (block?.style?.fontSize) size = block.style.fontSize;
    const validSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '32', '36', '40', '48', '60', '72'];
    size = size.replace('px', '');
    if (!validSizes.includes(size)) size = '';
    setCurrentSize(size);
    let family = '';
    if (inline?.style?.fontFamily) family = inline.style.fontFamily;
    else if (block?.style?.fontFamily) family = block.style.fontFamily;
    else family = window.getComputedStyle(node).fontFamily;
    if (family) {
      family = family.replace(/['"]/g, '');
      if (family.includes(',')) family = family.split(',')[0].trim();
    }
    setCurrentFont(family || '');
    let lh = '';
    if (block?.style?.lineHeight) {
      lh = block.style.lineHeight;
    } else {
      lh = window.getComputedStyle(node).lineHeight;
    }
    const validLineHeights = ['1.0', '1.15', '1.3', '1.5', '1.75', '2.0'];
    if (lh === 'normal' || !lh || !validLineHeights.includes(lh)) {
      lh = '';
    } else {
      lh = String(lh);
    }
    setCurrentLineHeight(lh);
    let ls = '';
    if (inline?.style?.letterSpacing) ls = inline.style.letterSpacing;
    else ls = window.getComputedStyle(node).letterSpacing;
    const validLetterSpacings = Array.from({ length: 11 }, (_, i) => String(i - 5));
    ls = ls.replace('px', '');
    if (!validLetterSpacings.includes(ls)) ls = '';
    setCurrentLetterSpacing(ls);
    let color = '';
    if (inline?.style?.color) color = inline.style.color;
    else color = window.getComputedStyle(node).color;
    if (color) {
      const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (match) {
        const hex = `#${((1 << 24) + (parseInt(match[1]) << 16) + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1).padStart(6, '0')}`;
        setCurrentColor(hex);
      } else {
        setCurrentColor(color);
      }
    }
  }, []);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !editorRef.current) return null;
    const range = sel.getRangeAt(0);
    const getPath = (node) => {
      const path = [];
      let current = node;
      while (current && current !== editorRef.current) {
        const parent = current.parentNode;
        if (parent) {
          path.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
          current = parent;
        } else {
          break;
        }
      }
      return path;
    };
    return {
      startPath: getPath(range.startContainer),
      startOffset: range.startOffset,
      endPath: getPath(range.endContainer),
      endOffset: range.endOffset,
    };
  }, []);

  const restoreSelection = useCallback((savedSel) => {
    if (!savedSel || !editorRef.current) return;
    const { startPath, startOffset, endPath, endOffset } = savedSel;
    const getNodeFromPath = (path) => {
      let node = editorRef.current;
      for (const index of path) {
        node = node.childNodes[index] || node;
      }
      return node;
    };
    try {
      const startNode = getNodeFromPath(startPath);
      const endNode = getNodeFromPath(endPath);
      if (!startNode || !endNode) return;
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(startNode, Math.min(startOffset, startNode.nodeType === Node.TEXT_NODE ? startNode.length : startNode.childNodes.length));
      range.setEnd(endNode, Math.min(endOffset, endNode.nodeType === Node.TEXT_NODE ? endNode.length : endNode.childNodes.length));
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {
      console.warn('Failed to restore selection:', e);
    }
  }, []);

  const cleanHtml = useCallback((html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fonts = temp.querySelectorAll('font');
    for (const font of fonts) {
      const span = document.createElement('span');
      const color = font.getAttribute('color');
      if (color) span.style.color = color;
      const face = font.getAttribute('face');
      if (face) span.style.fontFamily = face;
      const size = font.getAttribute('size');
      if (size) {
        const num = parseInt(size, 10);
        if (!isNaN(num) && num >= 1 && num <= 7) {
          const pxSizes = [10, 12, 14, 16, 18, 24, 36];
          span.style.fontSize = `${pxSizes[num - 1]}px`;
        }
      }
      while (font.firstChild) {
        span.appendChild(font.firstChild);
      }
      font.parentNode.replaceChild(span, font);
    }
    const elementsWithStyle = temp.querySelectorAll('[style]');
    for (const el of elementsWithStyle) {
      const styleAttr = el.getAttribute('style').trim();
      if (styleAttr === '') {
        el.removeAttribute('style');
      }
    }
    return temp.innerHTML;
  }, []);

  const handleInput = useCallback(
    (forceCleanup = false) => {
      if (!editorRef.current) return;
      const savedSel = saveSelection();
      const rawHtml = editorRef.current.innerHTML;
      let newHtml = rawHtml;
      if (forceCleanup) {
        newHtml = cleanHtml(rawHtml);
        if (rawHtml !== newHtml) {
          console.log('Cleaning HTML:', { rawHtml, newHtml });
          editorRef.current.innerHTML = newHtml;
          restoreSelection(savedSel);
        }
      }
      setInternalHtml(newHtml);
      debouncedOnChange(newHtml);
      updateCurrentFormatting();
    },
    [cleanHtml, debouncedOnChange, updateCurrentFormatting, restoreSelection]
  );

  const format = useCallback((command, val = null) => {
    saveHistory();
    document.execCommand(command, false, val);
    handleInput(true);
  }, [saveHistory, handleInput]);

  const insertContent = useCallback((content) => {
    if (editorRef.current) {
      saveHistory();
      editorRef.current.focus();
      document.execCommand('insertText', false, content);
      handleInput(true);
    }
  }, [saveHistory, handleInput]);

  const applyFontSize = useCallback((size) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      let parent = textNode.parentNode;
      if (parent.nodeName === 'SPAN') {
        parent.style.fontSize = `${size}px`;
      } else {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        parent.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentSize(String(size));
  }, [saveHistory, handleInput]);

  const applyFontFamily = useCallback((family) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      let parent = textNode.parentNode;
      if (parent.nodeName === 'SPAN') {
        parent.style.fontFamily = family;
      } else {
        const span = document.createElement('span');
        span.style.fontFamily = family;
        parent.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentFont(family);
  }, [saveHistory, handleInput]);

  const applyLineHeight = useCallback((lh) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    let block = range.startContainer;
    while (block && block !== editorRef.current && !['DIV', 'P', 'LI'].includes(block.nodeName)) {
      block = block.parentNode;
    }
    if (block && block.style) {
      block.style.lineHeight = lh;
      handleInput(true);
      setCurrentLineHeight(String(lh));
    }
  }, [saveHistory, handleInput]);

  const applyTextColor = useCallback((color) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      let parent = textNode.parentNode;
      if (parent.nodeName === 'SPAN') {
        parent.style.color = color;
      } else {
        const span = document.createElement('span');
        span.style.color = color;
        parent.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentColor(color);
  }, [saveHistory, handleInput]);

  const collapseCaretToEnd = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const applyLetterSpacing = useCallback((spacing) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const value = String(spacing).trim();
    if (value === '') {
      setCurrentLetterSpacing('');
      return;
    }
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      const parent = textNode.parentNode;
      if (parent && parent.nodeName === 'SPAN') {
        parent.style.letterSpacing = `${value}px`;
      } else {
        const span = document.createElement('span');
        span.style.letterSpacing = `${value}px`;
        const inlineStyle = parent?.getAttribute?.('style') || '';
        let lineHeight = '';
        if (parent && parent.nodeType === Node.ELEMENT_NODE) {
          try {
            lineHeight = window.getComputedStyle(parent).lineHeight;
          } catch (e) {
            console.warn('Could not get computed line-height:', e);
          }
        }
        let fullStyle = inlineStyle;
        if (lineHeight) fullStyle += `;line-height:${lineHeight}`;
        fullStyle += `;letter-spacing:${value}px`;
        span.setAttribute('style', fullStyle.trim());
        parent.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.insertNode(frag);
    collapseCaretToEnd();
    handleInput(true);
    setCurrentLetterSpacing(value);
  }, [saveHistory, handleInput, collapseCaretToEnd]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveHistory();
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const newLine = document.createElement('div');
      newLine.innerHTML = '<br>';
      if (currentFont) newLine.style.fontFamily = currentFont;
      if (currentLineHeight) newLine.style.lineHeight = currentLineHeight;
      range.deleteContents();
      range.insertNode(newLine);
      const newRange = document.createRange();
      newRange.setStart(newLine, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      handleInput(true);
    }
  }, [saveHistory, handleInput, currentFont, currentLineHeight]);

  const insertTable = useCallback((rows, cols, width, height) => {
    saveHistory();
    let table = `<table style="border-collapse: collapse; width: ${width || '100%'}; height: ${height || 'auto'};">`;
    for (let r = 0; r < rows; r++) {
      table += '<tr>';
      for (let c = 0; c < cols; c++) {
        table += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
      }
      table += '</tr>';
    }
    table += '</table><br>';
    document.execCommand('insertHTML', false, table);
    handleInput(true);
    setShowTablePanel(false);
  }, [saveHistory, handleInput]);

  const handleImageInsert = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      saveHistory();
      format('insertImage', url);
    }
  }, [saveHistory, format]);

  const handleLinkInsert = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      saveHistory();
      format('createLink', url);
    }
  }, [saveHistory, format]);

  const handleVideoInsert = useCallback(() => {
    const url = prompt('Enter video iframe embed code:');
    if (url && editorRef.current) {
      saveHistory();
      editorRef.current.focus();
      document.execCommand('insertHTML', false, url);
      handleInput(true);
    }
  }, [saveHistory, handleInput]);

  const handleAutoFormat = useCallback(() => {
    saveHistory();
    let html = editorRef.current.innerHTML;
    html = html.replace(/"([^"]*)"/g, '“$1”');
    html = html.replace(/\s--\s/g, ' — ');
    setInternalHtml(cleanHtml(html));
  }, [saveHistory, cleanHtml]);

  const handleFindReplace = useCallback(() => {
    saveHistory();
    const html = editorRef.current.innerHTML;
    const updated = html.replaceAll(findValue, replaceValue);
    setInternalHtml(cleanHtml(updated));
    setShowFindReplace(false);
  }, [saveHistory, findValue, replaceValue, cleanHtml]);

  const handlePastePlainText = useCallback((e) => {
    e.preventDefault();
    saveHistory();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput(true);
  }, [saveHistory, handleInput]);

  const getCurrentContent = useCallback(() => {
    handleInput(true);
    return editorRef.current?.innerHTML || '';
  }, [handleInput]);

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => {
      document.removeEventListener('keydown', handleKeyDownGlobal);
    };
  }, [undo, redo]);

  useEffect(() => {
    const handleSelectionChange = () => updateCurrentFormatting();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateCurrentFormatting]);

  useLayoutEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== internalHtml) {
      const savedSel = saveSelection();
      console.log('Updating innerHTML:', { from: editorRef.current.innerHTML, to: internalHtml });
      editorRef.current.innerHTML = internalHtml;
      restoreSelection(savedSel);
      updateCurrentFormatting();
    }
  }, [internalHtml, updateCurrentFormatting, saveSelection, restoreSelection]);

  useEffect(() => {
    if (value !== internalHtml && value !== '') {
      console.log('External value changed:', { value, internalHtml });
      const cleaned = cleanHtml(value);
      setInternalHtml(cleaned);
      setHistory([cleaned]);
    }
  }, [value, cleanHtml]);

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={undo} title="Undo">↺</button>
        <button onClick={redo} title="Redo">↻</button>
        <button onClick={() => document.execCommand('selectAll')} title="Select All">Select All</button>
        <button onClick={handleAutoFormat} title="Autoformat">✨</button>
        <button onClick={() => document.execCommand('insertParagraph')} title="Insert Paragraph">⏎</button>
        <button onClick={() => window.print()} title="Print">🖨️</button>
        <button onClick={() => format('bold')} title="Bold">𝐁</button>
        <button onClick={() => format('italic')} title="Italic">𝘐</button>
        <button onClick={() => format('underline')} title="Underline">U̲</button>
        <button onClick={() => format('strikeThrough')} title="Strikethrough">S̶</button>
        <button onClick={() => format('superscript')} title="Superscript">x²</button>
        <button onClick={() => format('subscript')} title="Subscript">x₂</button>
        <button onClick={() => format('removeFormat')} title="Clear Formatting">🚫</button>
        <button onClick={() => document.documentElement.requestFullscreen()} title="Fullscreen">⛶</button>
        <select value={currentFont} onChange={(e) => applyFontFamily(e.target.value)}>
          <option value="">Font</option>
          <option value='"Quicksand", sans-serif'>Quicksand</option>
          <option value="Arial">Arial</option>
          <option value="Calibri">Calibri</option>
          <option value="Cambria">Cambria</option>
          <option value="Candara">Candara</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Consolas">Consolas</option>
          <option value="Constantia">Constantia</option>
          <option value="Corbel">Corbel</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Impact">Impact</option>
          <option value="Lucida Console">Lucida Console</option>
          <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
          <option value="Palatino Linotype">Palatino Linotype</option>
          <option value="Segoe UI">Segoe UI</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Verdana">Verdana</option>
          <option value="Arial Black">Arial Black</option>
          <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
          <option value="Garamond">Garamond</option>
          <option value="Bookman">Bookman</option>
          <option value="Century Gothic">Century Gothic</option>
          <option value="Gill Sans">Gill Sans</option>
          <option value="Rockwell">Rockwell</option>
          <option value="Playfair Display">Playfair Display</option>
        </select>
        <select value={currentSize} onChange={(e) => applyFontSize(e.target.value)}>
          <option value="">Size</option>
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 60, 72].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <div className="editor-toolbar-section">
          <div className="toolbar-button">
            <FaFont title="Text Color" size={18} />
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                const color = e.target.value;
                applyTextColor(color);
                setCurrentColor(color);
              }}
              className="color-input"
              title="Text Color"
            />
            <input
              type="text"
              value={currentColor}
              onChange={(e) => {
                const value = e.target.value;
                setCurrentColor(value);
                applyTextColor(value);
              }}
              placeholder="#000000"
              className="hex-input"
              style={{ width: '80px', marginLeft: '5px' }}
            />
          </div>
          <div className="toolbar-button">
            <FaFillDrip title="Background Color" size={18} />
            <input
              type="color"
              onChange={(e) => format('hiliteColor', e.target.value)}
              className="color-input"
              title="Background Color"
            />
          </div>
        </div>
        <select onChange={(e) => format('formatBlock', e.target.value)}>
          <option value="">Heading</option>
          <option value="H1">H1</option>
          <option value="H2">H2</option>
          <option value="H3">H3</option>
          <option value="H4">H4</option>
          <option value="H5">H5</option>
          <option value="H6">H6</option>
          <option value="BLOCKQUOTE">Quote</option>
        </select>
        <button onClick={() => format('insertHorizontalRule')} title="Horizontal Rule">
          <FaMinus />
        </button>
        <button onClick={() => format('justifyLeft')} title="Align Left">
          <FaAlignLeft />
        </button>
        <button onClick={() => format('justifyCenter')} title="Align Center">
          <FaAlignCenter />
        </button>
        <button onClick={() => format('justifyRight')} title="Align Right">
          <FaAlignRight />
        </button>
        <button onClick={() => format('justifyFull')} title="Justify">
          <FaAlignJustify />
        </button>
        <button onClick={handleImageInsert} title="Insert Image">🖼️</button>
        <button onClick={handleVideoInsert} title="Insert Video">📹</button>
        <button onClick={handleLinkInsert} title="Insert Link">🔗</button>
        <button onClick={() => format('unlink')} title="Remove Link">❌</button>
        <button onClick={() => format('insertOrderedList')} title="Numbered List">
          <FaListOl />
        </button>
        <button onClick={() => format('insertUnorderedList')} title="Bulleted List">
          <FaListUl />
        </button>
        <button onClick={() => document.execCommand('insertText', false, '☐ ')} title="To-do List Item">
          <FaRegSquare />
        </button>
        <button onClick={() => setShowTablePanel(!showTablePanel)} title="Insert Table">
          <FaTable />
        </button>
        <button onClick={() => setShowEmojiPanel(!showEmojiPanel)} title="Insert Emoji">
          <FaSmile />
        </button>
        <button onClick={() => setShowSpecialCharPanel(!showSpecialCharPanel)}>Ω Special</button>
        <button onClick={() => setShowFindReplace(!showFindReplace)} title="Find and Replace">
          <FaSearch />
        </button>
        <button onClick={() => format('cut')} title="Cut">✂️</button>
        <button onClick={() => format('copy')} title="Copy">📋</button>
        <button onClick={() => document.execCommand('paste')} title="Paste">📥</button>
        <button onClick={handlePastePlainText} title="Paste as Plain Text">📝</button>
        <select onChange={(e) => changeCase(e.target.value)} title="Change Case">
          <option value="">Case</option>
          <option value="upper">UPPERCASE</option>
          <option value="lower">lowercase</option>
          <option value="capitalize">Capitalize Each Word</option>
        </select>
        <button onClick={() => format('indent')} title="Increase Indent">➡️</button>
        <button onClick={() => format('outdent')} title="Decrease Indent">⬅️</button>
        <select onChange={(e) => applyBorder(e.target.value)} title="Borders">
          <option value="">Borders</option>
          <option value="borderBottom">Bottom Border</option>
          <option value="borderTop">Top Border</option>
          <option value="borderLeft">Left Border</option>
          <option value="borderRight">Right Border</option>
          <option value="borderAll">All Borders</option>
          <option value="noBorder">No Border</option>
        </select>
        <button onClick={() => format('insertHorizontalRule')} title="Page Break">📄</button>
        <button onClick={insertEquation} title="Equation">∑</button>
        <button onClick={() => insertShape('rect')} title="Insert Shape">⬛</button>
        <button onClick={() => zoomEditor(1.1)} title="Zoom In">🔍+</button>
        <button onClick={() => zoomEditor(0.9)} title="Zoom Out">🔍-</button>
        <button onClick={() => alert(getWordCount())} title="Word Count">🔢</button>
        <select value={currentLineHeight} onChange={(e) => applyLineHeight(e.target.value)} title="Line Height">
          <option value="">Line Height</option>
          {['1.0', '1.15', '1.3', '1.5', '1.75', '2.0'].map((lh) => (
            <option key={lh} value={lh}>{lh}</option>
          ))}
        </select>
        <select value={currentLetterSpacing} onChange={(e) => applyLetterSpacing(e.target.value)} style={{ width: '140px', marginRight: '8px' }}>
          <option value="">Letter Spacing</option>
          {Array.from({ length: 11 }, (_, i) => i - 5).map((val) => (
            <option key={val} value={val}>{val}px</option>
          ))}
        </select>
        <button type="button" onClick={() => { setSourceContent(editorRef.current.innerHTML); setIsSourceModalOpen(true); }}>
          Source Code
        </button>
      </div>
      {showFindReplace && (
        <div className="find-replace-bar">
          <input placeholder="Find" value={findValue} onChange={(e) => setFindValue(e.target.value)} />
          <input placeholder="Replace" value={replaceValue} onChange={(e) => setReplaceValue(e.target.value)} />
          <button onClick={handleFindReplace}>Replace</button>
        </div>
      )}
      {showEmojiPanel && (
        <div className="find-replace-bar">
          {['😀', '😁', '😂', '🤣', '😎', '😍', '😘', '🤔', '👍', '🙏', '🔥', '🎉', '💡', '❤️'].map((emoji) => (
            <button key={emoji} onClick={() => insertContent(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}
      {showSpecialCharPanel && (
        <div className="find-replace-bar">
          {['©', '™', '€', '£', '¥', '§', '¶', '•', '→', '←', '↑', '↓', '∞', '≠', '≈'].map((char) => (
            <button key={char} onClick={() => insertContent(char)}>{char}</button>
          ))}
        </div>
      )}
   {showTablePanel && (
  <div className="find-replace-bar" style={{ padding: "8px" }}>
    <p style={{ marginBottom: "6px", fontWeight: "bold" }}>Insert Table</p>

    {/* Default small grid (1–3 rows & columns) */}
    {[1, 2, 3].map((r) => (
      <div key={r}>
        {[1, 2, 3].map((c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => insertTable(r, c)}
            style={{
              margin: "2px",
              padding: "4px 6px",
              fontSize: "12px",
            }}
          >
            {r}x{c}
          </button>
        ))}
      </div>
    ))}

    <hr style={{ margin: "8px 0" }} />

    {/* Quick custom table option */}
    <button
      onClick={() => insertTable(8, 4, '100%', 'auto')}
      style={{
        padding: "6px 10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Insert 4×8 Table
    </button>
  </div>
)}
      <div
        className="editor"
        contentEditable
        ref={editorRef}
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={() => handleInput(true)}
        onPaste={handlePastePlainText}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
              document.execCommand('outdent', false, null);
            } else {
              document.execCommand('indent', false, null);
            }
            handleInput(true);
          } else {
            handleKeyDown(e);
          }
        }}
      />
      {isSourceModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '80%',
              maxWidth: '800px',
              padding: '20px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Source Code</h3>
              <button onClick={() => setIsSourceModalOpen(false)}>Back</button>
            </div>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              style={{
                width: '100%',
                height: '400px',
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '10px',
                flexGrow: 1,
              }}
            />
            <button
              style={{ marginTop: '10px' }}
              onClick={() => {
                setInternalHtml(cleanHtml(sourceContent));
                setIsSourceModalOpen(false);
              }}
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;