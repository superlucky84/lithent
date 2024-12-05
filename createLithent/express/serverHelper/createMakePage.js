import DevMakePage from './devMakePage.js';
import ProdMakePage from './prodMakePage.js';

export default function createMakePage(info) {
  if (info.isDev) {
    return new DevMakePage(info);
  }

  return new ProdMakePage(info);
}
