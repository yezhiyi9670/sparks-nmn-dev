import { NMNResult } from "../../.."
import { DomPaint } from "../../backend/DomPaint"
import { EquifieldSection, RenderContext } from "../../renderer"
import { PositionDispatcher } from "./PositionDispatcher"

type NMNLine = (NMNResult['result']['articles'][0] & {type: 'music'})['lines'][0]

class LineRendererClass {
	renderLine(line: NMNLine, sections: EquifieldSection[], context: RenderContext) {
		const root = new DomPaint()
		let currY = 0

		// ===== 列空间自动布局 =====
		const columns = new PositionDispatcher(root, line, context)
		

		sections.push({
			element: root.element,
			height: currY
		})
	}
}

export const LineRenderer = new LineRendererClass()
