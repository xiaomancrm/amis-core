/**
 * zip 文件解析
 */

import {zipSync, unzipSync, Unzipped, strFromU8, strToU8} from 'fflate';

import {PackageParser} from './PackageParser';

export default class ZipPackageParser implements PackageParser {
  private zip: Unzipped;

  /**
   * 加载 zip 文件
   */
  load(docxFile: ArrayBuffer) {
    this.zip = unzipSync(new Uint8Array(docxFile), {
      filter(file) {
        // 不解析大于 10 MiB 的文件
        return file.originalSize <= 10_000_000;
      }
    });
  }

  /**
   * 读取 xml 文件，转成 json 对象
   * @param filePath 文件路径
   * @returns 转成 json 的结果
   */
  getXML(filePath: string): Document {
    const fileContent = this.getFileByType(filePath, 'string') as string;

    const doc = new DOMParser().parseFromString(fileContent, 'application/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      throw new Error(errorNode.textContent || "can't parse xml");
    } else {
      return doc;
    }
  }

  /**
   * 根据类型读取文件
   */
  getFileByType(filePath: string, type: 'string' | 'blob' | 'uint8array') {
    filePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const file = this.zip[filePath];
    if (file) {
      if (type === 'string') {
        return strFromU8(file);
      } else if (type === 'blob') {
        return new Blob([file]);
      } else if (type === 'uint8array') {
        return file;
      }
    }
    throw new Error('file not found');
  }

  /**
   * 判断文件是否存在
   */
  fileExists(filePath: string) {
    filePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return filePath in this.zip;
  }

  /**
   * 生成新的 zip 文件
   */
  generateZip(docContent: string) {
    // 其实最好是生成个新的，后续再优化
    this.zip['word/document.xml'] = strToU8(docContent);

    return new Blob([zipSync(this.zip)]);
  }
}
