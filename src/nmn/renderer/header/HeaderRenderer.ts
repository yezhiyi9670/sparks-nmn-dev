import { NMNResult } from "../.."
import { DomPaint } from "../backend/DomPaint"
import { EquifieldSection, RenderContext } from "../renderer"
import $ from 'jquery'
import { FontMetric } from "../FontMetric"
import { ScoreContext } from "../../parser/sparse2des/context"
import { I18n } from "../../i18n"

class HeaderRendererClass {
	renderTop(score: NMNResult['result'], sections: EquifieldSection[], context: RenderContext) {
		const root = new DomPaint()
		const scale = context.render.scale!
		let currY = 0

		const hasTitleLines = !!(score.scoreProps.title || score.scoreProps.subtitle)
		const hasCornerLines = !!(score.scoreProps.prescript || score.scoreProps.version)

		// 角标题
		const cornerMetric = new FontMetric(context.render.font_corner!, 1.8)
		if(score.scoreProps.prescript) {
			root.drawText(0, currY, score.scoreProps.prescript.text, cornerMetric, 'left', scale)
		}
		if(score.scoreProps.version) {
			root.drawText(100, currY, score.scoreProps.version.text, cornerMetric, 'right', scale)
		}
		currY += 2
		
		if(hasTitleLines) {
			currY += 4
		}

		// 大标题
		if(score.scoreProps.title) {
			const titleMetric = new FontMetric(context.render.font_title!, 3.5)
			root.drawText(50, currY, score.scoreProps.title.text, titleMetric, 'center', scale)
			currY += 1.25 + 3.5 * titleMetric.fontScale
		}
		// 副标题
		if(score.scoreProps.subtitle) {
			const titleMetric = new FontMetric(context.render.font_subtitle!, 2.3)
			root.drawText(50, currY, score.scoreProps.subtitle.text, titleMetric, 'center', scale)
			currY += 1.25 + 2.3 * titleMetric.fontScale
		}

		if(hasCornerLines || hasTitleLines) {
			currY += 2.5
		}
		
		sections.push({
			element: root.element,
			height: currY * scale
		})
	}
	renderPropsAndAuthors(score: NMNResult['result'], sections: EquifieldSection[], context: RenderContext) {
		const root = new DomPaint()
		const scale = context.render.scale!
		let currY = 0

		score.scoreProps.authors.map((author) => {
			const authorMetric = new FontMetric(context.render.font_author!, 2.16)
			let text = author.text
			if(author.tag) {
				text = author.tag + I18n.renderToken(context.language, 'colon') + author.text
			}
			root.drawText(100, currY, text, authorMetric, 'right', scale)
			currY += 1.2 + 2.16 * authorMetric.fontScale
		})

		const propsThershold = 0
		if(currY < propsThershold) {
			currY = 0
		} else {
			currY -= propsThershold
		}

		currY += 2
		sections.push({
			element: root.element,
			height: currY * scale
		})
	}
}

export const HeaderRenderer = new HeaderRendererClass()
