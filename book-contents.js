const contentsDialog = document.createElement('dialog');
contentsDialog.className = 'term-dialog book-contents';
contentsDialog.setAttribute('aria-labelledby', 'contents-title');
contentsDialog.innerHTML = '<form method="dialog"><button type="submit" aria-label="关闭目录 / Close contents">×</button></form><h2 id="contents-title">目录 <span lang="en">Contents</span></h2><ol></ol>';
const contentsList = contentsDialog.querySelector('ol');
const englishChapterTitles = ["Preface by Zhang Zhongjing","Preface by Zuo Shengde of Guilin","First Chapter on the Pulse","Second Chapter on the Pulse","Host and Guest Aspects of the Six Qi","General Principles of Cold Damage","General Principles of Miscellaneous Diseases","Warm Diseases","Summerheat Damage","Heat Diseases","Dampness Diseases","Dryness Damage","Wind Damage","Cold Diseases","Greater Yang Diseases, Part I","Greater Yang Diseases, Part II","Greater Yang Diseases, Part III","Yang Brightness Diseases","Lesser Yang Diseases","Greater Yin Diseases","Lesser Yin Diseases","Reverting Yin Diseases","Sudden Turmoil, Vomiting, and Diarrhea","Spasm, Yin–Yang Exchange, and Illness after Recovery","Hundred-Union Disease, Fox-Creeper Disease, and Yin and Yang Toxins","Malarial Disorders","Blood Impediment and Deficiency Taxation","Cough, Retained Fluids, Yellow Sweat, and Joint-Running","Blood Stasis, Vomiting Blood, Nosebleeds, Blood in the Stool, and Sores and Abscesses","Chest Impediment","Conditions in Women"];
for (const [index, chapter] of bookChapters.entries()) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = chapter.id === 'chapter-3' ? 'original.html#page-1' : 'chapters.html#' + chapter.id;
  const chineseTitle = document.createElement('span');
  chineseTitle.textContent = chapter.title;
  chineseTitle.lang = 'zh-Hant';
  const englishTitle = document.createElement('span');
  englishTitle.className = 'contents-english';
  englishTitle.textContent = englishChapterTitles[index];
  englishTitle.lang = 'en';
  link.append(chineseTitle, englishTitle);
  link.addEventListener('click', () => contentsDialog.close());
  item.append(link);
  contentsList.append(item);
}
document.body.append(contentsDialog);
const openContents = document.querySelector('[data-open-contents]');
openContents.addEventListener('click', () => contentsDialog.showModal());
