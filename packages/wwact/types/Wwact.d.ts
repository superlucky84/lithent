import { WDom } from './index';
import { Param } from './types';
export default function make<Props, Member extends {}>(mounter: (info: Omit<Param<Props, Member>, 'children'>) => Member, template: (info: Param<Props, Member>) => WDom): (props: Props, children: WDom[]) => () => WDom;
