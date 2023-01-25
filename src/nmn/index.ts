import nmnExamples from "./examples/examples"
import { ColumnScore, LinedArticle } from "./parser/des2cols/types"
import { LinedIssue, Parser } from "./parser/parser"
import { getLanguageValue } from './util/template'
import { I18n } from './i18n'
import { commandDefs } from "./parser/commands"

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

export class SparksNMN {
	renderer: Window | null = null

	/**
	 * 创建 SparksNMN 解析器
	 * @param rendererWindow 用于渲染的 window 对象。若解析器仅用于解析而不渲染，可以传入 null。
	 */
	constructor(rendererWindow: Window | null) {
		this.renderer = rendererWindow
	}

	/**
	 * 解析 SparksNMN 文本文档
	 */
	parse(doc: string) {
		return Parser.parse(doc)
	}
}

class SparksNMNLanguageClass {
	commandDefs = commandDefs
}

export const SparksNMNLanguage = new SparksNMNLanguageClass()

export type NMNResult = {issues: LinedIssue[], result: ColumnScore<LinedArticle>}
export type NMNIssue = LinedIssue
export const NMNI18n = I18n
