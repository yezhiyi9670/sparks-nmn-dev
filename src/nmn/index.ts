import nmnExamples from "./examples/examples"
import { ColumnScore, LinedArticle } from "./parser/des2cols/types"
import { LinedIssue, Parser } from "./parser/parser"
import { getLanguageValue } from './util/template'
import { I18n, LanguageArray } from './i18n'
import { commandDefs } from "./parser/commands"
import { EquifieldSection, Renderer, RenderPositionCallback } from "./renderer/renderer"
import { FontLoader } from "./renderer/FontLoader"

/**
 * 渲染错误
 */
class RenderError extends Error {}
/**
 * 渲染器缺失导致的错误。请检查构造 SparksNMN 对象时是否提供了 window 对象。
 *
 * 在没有 DOM 的服务器环境下，可以使用 Virtual DOM 提供虚拟的 window。
 */
class NoRendererError extends RenderError {}

class SparksNMNClass {
	/**
	 * 创建 SparksNMN 解析器
	 */
	constructor() {}

	/**
	 * 解析 SparksNMN 文本文档
	 */
	parse(doc: string) {
		return Parser.parse(doc)
	}

	/**
	 * 将解析结果渲染为 DOM
	 *
	 * 结果采用“精确渲染”型的格式。为了保证不同设备宽度（以及打印）下结果的一致性（像图片那样），应当使用 Equifield 模块进行展示。
	 * 
	 * 结果假设纸张的宽度是 120em，双侧页边距均为 10em。
	 * 
	 * positionCallback 用于定义点击可定位元素后的行为。
	 * 
	 * @return `{element: HTMLElement, height: number, noBreakAfter?: boolean}[]` element 为 DOM 元素，height 为以 em 为单位的高度。单个元素不应当在打印时截断，除非太长
	 */
	render(result: NMNResult['result'], lng: LanguageArray, positionCallback?: RenderPositionCallback): EquifieldSection[] {
		if(!window || !('document' in window)) {
			throw new NoRendererError('Sparks NMN renderer cannot work without a DOM window.')
		}
		return Renderer.render(result, lng, positionCallback)
	}

	/**
	 * 加载需要的字体
	 */
	loadFonts(finishCallback?: () => void, loadCallback?: () => void) {
		if(!window || !('document' in window)) {
			throw new NoRendererError('Sparks NMN renderer cannot work without a DOM window.')
		}
		const fonts = [
			{ name: 'SimSun', url: './nmn/font/simsun/simsun.ttf', type: 'application/x-font-ttf' },
			{ name: 'SimHei', url: './nmn/font/simhei/simhei.ttf', type: 'application/x-font-ttf' },
			{ name: 'Deng', url: './nmn/font/deng/deng.ttf', type: 'application/x-font-ttf' },
			{ name: 'SparksNMN-EOPNumber', url: './nmn/font/eop_number/eop_number.ttf', type: 'application/x-font-ttf' },
			{ name: 'SparksNMN-mscore-20', url: './nmn/font/mscore-20/mscore-20.ttf', type: 'application/x-font-ttf' },
			{ name: 'SparksNMN-Bravura', url: './nmn/font/bravura/bravura.woff', type: 'application/x-font-woff' }
		]
		FontLoader.loadFonts(fonts, finishCallback)
	}
}

export const SparksNMN = new SparksNMNClass()

class SparksNMNLanguageClass {
	commandDefs = commandDefs
}

export const SparksNMNLanguage = new SparksNMNLanguageClass()

export type NMNResult = {issues: LinedIssue[], result: ColumnScore<LinedArticle>}
export type NMNIssue = LinedIssue
export const NMNI18n = I18n
export type NMNLanguageArray = LanguageArray
