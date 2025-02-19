/**
 * 本地测试例子
 */

import XMLPackageParser from '../src/package/XMLPackageParser';
import Word from '../src/Word';

const viewerElement = document.getElementById('viewer') as HTMLElement;

const testDir = '__tests__/docx';

const fileLists = {
  simple: [
    'image.docx',
    'list.docx',
    'tableborder.docx',
    'tablestyle.docx',
    'pinyin.docx',
    'em.docx',
    'w.docx',
    'textbox.docx',
    'embed-font.docx',
    'math.docx',
    'highlight.docx'
  ],
  docx4j: [
    'ArialUnicodeMS.docx',
    'DOCPROP_builtin.docx',
    'FontEmbedded.docx',
    'Headers.docx',
    'Images.docx',
    'Symbols.docx',
    'Word2007-fonts.docx',
    'chart.docx',
    'chunk.docx',
    'decracdiscrim1.docx',
    'docProps.docx',
    'fonts-modesOfApplication.docx',
    'hyperlinks-internal.docx',
    'sample-docx.docx',
    'sample-docxv2.docx',
    'tableborder.docx',
    'tables.docx',
    'toc.docx',
    'unmarshallFromTemplateDirtyExample.docx',
    'unmarshallFromTemplateExample.docx',
    'numberingrestart.xml',
    'sample-docx.xml',
    'table-features.xml',
    'table-spans.xml'
  ]
};

/**
 * 生成左侧文件列表
 */
(function genFileList() {
  const fileListElement = document.getElementById('fileList')!;
  for (const dirName in fileLists) {
    fileListElement.innerHTML += `<h2 class="dir">${dirName}</h2>`;
    const dir = dirName as keyof typeof fileLists;
    for (const file of fileLists[dir]) {
      const fileName = file.split('.')[0];
      fileListElement.innerHTML += `<div class="file" data-path="${dirName}/${file}" title="${file}">${fileName}</div>`;
    }
  }

  document.querySelectorAll('.file').forEach(file => {
    file.addEventListener('click', elm => {
      const fileName = (elm.target as Element).getAttribute('data-path')!;
      history.pushState({fileName}, fileName, `?file=${fileName}`);
      renderDocx(fileName);
    });
  });
})();

const data = {
  var: 'amis'
};

function replaceText(text: string) {
  // 将 {{xxx}} 替换成 ${xxx}，为啥要这样呢，因为输入 $ 可能会变成两段文本
  text = text.replace(/{{/g, '${').replace(/}}/g, '}');
  return text;
}

async function renderDocx(fileName: string) {
  const filePath = `${testDir}/${fileName}`;
  const file = await (await fetch(filePath)).arrayBuffer();
  let word: Word;
  const renderOptions = {
    debug: true
    // replaceText
  };
  if (filePath.endsWith('.xml')) {
    word = new Word(file, renderOptions, new XMLPackageParser());
  } else {
    word = new Word(file, renderOptions);
  }

  const fileNameSplit = fileName.split('/');
  const downloadName = fileNameSplit[fileNameSplit.length - 1].replace(
    '.xml',
    '.docx'
  );

  (window as any).downloadDocx = () => {
    word.download(downloadName);
  };

  (window as any).printDocx = () => {
    word.print();
  };

  word.render(viewerElement);
}

const url = new URL(location.href);

const initFile = url.searchParams.get('file');

if (initFile) {
  renderDocx(initFile);
}
