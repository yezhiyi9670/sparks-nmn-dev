import { NMNResult } from "..";
import { LanguageArray } from "../i18n";
import { addMusicProp, addRenderProp, ScoreContext, scoreContextDefault } from "../parser/sparse2des/context";
import { DomPaint } from "./backend/DomPaint";
import { HeaderRenderer } from "./header/HeaderRenderer";
import $ from 'jquery'
import { ArticleRenderer } from "./article/ArticleRenderer";

export type EquifieldSection = {
	element: HTMLElement
	height: number
	noBreakAfter?: boolean
}

export type RenderContext = ScoreContext & {
	language: LanguageArray
}

class RendererClass {
	render(score: NMNResult['result'], lng: LanguageArray): EquifieldSection[] {
		let sections: EquifieldSection[] = []
		const context = {
			language: lng,
			...addMusicProp(addRenderProp(
				scoreContextDefault, score.renderProps?.props
			), score.musicalProps?.props)
		}

		// ==== 头部信息 ====
		HeaderRenderer.renderTop(score, sections, context)
		HeaderRenderer.renderPropsAndAuthors(score, sections, context)
		HeaderRenderer.renderTopSpacer(score, sections, context)
		// ==== 章节 ====
		let context1 = context
		score.articles.forEach((article) => {
			let contextPre = addRenderProp(context1, article.renderProps?.props)
			if(article.type == 'music') {
				contextPre = addMusicProp(contextPre, article.musicalProps?.props)
			}
			const context = {
				language: lng,
				...contextPre
			}
			ArticleRenderer.renderArticle(article, sections, context)
		})
		// ==== 脚注 ====
		HeaderRenderer.renderFooter(score, sections, context)

		return sections
	}
}

export const Renderer = new RendererClass()
