const reader = document.querySelector('main');
const termDialog = document.createElement('dialog');
termDialog.className = 'term-dialog';
termDialog.setAttribute('aria-labelledby', 'term-guide-title');
termDialog.innerHTML = '<form method="dialog"><button type="submit" aria-label="关闭讲解 / Close explanation">×</button></form><div id="term-guide-content"></div>';
reader.append(termDialog);
const termContent = termDialog.querySelector('#term-guide-content');
let originatingLink;
const legacyTerms = [
  ['惵', 'dié · weakness of defensive qi'],
  ['卑、損', 'bēi and sǔn · weakness of nutritive qi and combined weakness'],
  ['緩、遲、沉', 'huǎn, chí, and chén · relaxed, slow, and deep']
];

function annotate(container, phrase, id) {
  if (!container) return;
  const nodes = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (nodes.nextNode()) {
    const text = nodes.currentNode;
    if (text.parentElement.closest('a')) continue;
    const index = text.data.indexOf(phrase);
    if (index < 0) continue;
    const term = text.splitText(index);
    term.splitText(phrase.length);
    const link = document.createElement('a');
    link.href = '#note-' + id;
    link.dataset.noteId = id;
    link.textContent = phrase;
    term.replaceWith(link);
    return;
  }
}

const noteContext = () => typeof pulseChapterNotes !== 'undefined'
  ? {notes: pulseChapterNotes, prefix: '1'}
  : window.chapterNoteContext;
function refreshReaderNotes() {
  for (const [id, [page, chinese, english, , , , paragraph]] of noteContext().notes.entries()) {
    const section = document.querySelector('#page-' + page);
    if (!section) continue;
    const target = selector => typeof paragraph === 'number'
      ? section.querySelectorAll(selector + ' p')[paragraph]
      : section.querySelector(selector);
    annotate(target('.whole-page-original'), chinese, id);
    annotate(target('.whole-page-english'), english, id);
  }
}
refreshReaderNotes();

function addGuideText(tag, text, lang) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.lang = lang;
  termContent.append(element);
  return element;
}

function addGuideAudio(heading, src, label, rate) {
  const audio = document.createElement('audio');
  audio.hidden = true;
  audio.preload = 'none';
  audio.src = src;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'term-play';
  button.lang = rate === 0.85 ? 'en' : 'zh-CN';
  function update() {
    const playing = !audio.paused && !audio.ended;
    button.textContent = playing ? '■' : '▶';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(playing));
  }
  for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, update);
  update();
  button.addEventListener('click', async () => {
    if (!audio.paused && !audio.ended) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }
    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
    try {
      await audio.play();
    } catch (error) {
      if (error.name !== 'AbortError') {
        button.title = rate === 0.85 ? 'Audio unavailable' : '音频无法播放';
      }
    }
  });
  audio.addEventListener('play', () => {
    termContent.querySelectorAll('audio').forEach(other => { if (other !== audio) other.pause(); });
  });
  const row = document.createElement('div');
  row.className = 'term-heading-row';
  heading.before(row);
  row.append(heading, button);
  termContent.append(audio);
}

reader.addEventListener('click', event => {
  const link = event.target.closest('a[data-note-id], a[href^="index.html#part-"]');
  if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const match = /^index\.html#part-([0-9]+)$/.exec(link.getAttribute('href'));
  const part = match && typeof parts !== 'undefined' && parts[Number(match[1])];
  const {notes, prefix} = noteContext();
  const note = notes[link.dataset.noteId];
  if (!part && !note) return;
  event.preventDefault();
  originatingLink = link;
  reader.querySelectorAll('audio').forEach(track => track.pause());
  termContent.replaceChildren();
  if (note) {
    const [, , english, title, zh, en] = note;
    const file = 'audio/note-' + prefix + '-' + link.dataset.noteId;
    const chineseHeading = addGuideText('h2', title, 'zh-CN');
    chineseHeading.id = 'term-guide-title';
    addGuideText('p', zh, 'zh-CN');
    const englishHeading = addGuideText('h3', english, 'en');
    englishHeading.className = 'term-equivalent';
    addGuideText('p', en, 'en');
    termDialog.showModal();
    return;
  }
  const [chineseTerm, englishTerm] = legacyTerms[Number(match[1])];
  const chineseHeading = addGuideText('h2', chineseTerm, 'zh-Hant');
  chineseHeading.id = 'term-guide-title';
  addGuideText('blockquote', part.quote, 'zh-Hant');
  addGuideText('p', part.zh, 'zh-CN');
  const englishHeading = addGuideText('h3', englishTerm, 'en');
  englishHeading.className = 'term-equivalent';
  addGuideText('p', part.eng, 'en');
  termDialog.showModal();
});

termDialog.addEventListener('close', () => {
  termContent.querySelectorAll('audio').forEach(track => track.pause());
  originatingLink?.focus({preventScroll: true});
});
