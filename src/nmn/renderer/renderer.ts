import { NMNResult } from "..";
import { LanguageArray } from "../i18n";
import { addMusicProp, addRenderProp, ScoreContext, scoreContextDefault } from "../parser/sparse2des/context";
import { DomPaint } from "./backend/DomPaint";
import { HeaderRenderer } from "./header/HeaderRenderer";

export type EquifieldSection = {
	element: HTMLElement
	height: number
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

		HeaderRenderer.renderTop(score, sections, context)
		HeaderRenderer.renderPropsAndAuthors(score, sections, context)
		return sections
	}
}

export const Renderer = new RendererClass()
