import { NMNResult } from "../../.."
import { I18n } from "../../../i18n"
import { SectionStat } from "../../../parser/des2cols/section/SectionStat"
import { connectSigs } from "../../../parser/des2cols/types"
import { DestructedFCA, MusicNote, MusicSection, NoteCharChord, NoteCharForce, NoteCharText } from "../../../parser/sparse2des/types"
import { Frac, Fraction } from "../../../util/frac"
import { DomPaint } from "../../backend/DomPaint"
import { FontMetric } from "../../FontMetric"
import { MusicPaint } from "../../paint/MusicPaint"
import { PaintTextToken } from "../../paint/PaintTextToken"
import { EquifieldSection, RenderContext } from "../../renderer"
import { reductionLineSpace } from "./font/fontMetrics"
import { PositionDispatcher } from "./PositionDispatcher"
import { SectionsRenderer } from "./SectionsRenderer"

type NMNLine = (NMNResult['result']['articles'][0] & {type: 'music'})['lines'][0]
type NMNPart = NMNLine['parts'][0]

export class LineRenderer {
	columns: PositionDispatcher
	musicLineYs: { top: number, middle: number, bottom: number }[] = []

	/**
	 * 渲染曲谱行
	 */
	renderLine(line: NMNLine, sections: EquifieldSection[], context: RenderContext, lastLine: NMNLine | undefined) {
		const root = new DomPaint()
		const scale = context.render.scale!
		let currY = 0

		// ===== 列空间自动布局 =====
		this.columns = new PositionDispatcher(root, line, context)
		
		// ===== 渲染声部 =====
		let isFirst = true
		this.musicLineYs = []
		line.parts.forEach((part) => {
			currY += this.renderPart(currY, part, root, context, line, lastLine, isFirst)
			isFirst = false
		})

		// ===== 连谱号 =====
		if(line.parts.length > 1) {
			const upperY = this.musicLineYs[0].top
			const lowerY = this.musicLineYs[this.musicLineYs.length - 1].bottom
			const leftX = 0 * scale
			const rightX = leftX + 1 * scale
			root.drawLine(leftX, upperY, leftX, lowerY, 0.2, 0.1, scale)
			root.drawLine(leftX, upperY, rightX, upperY, 0.2, 0.1, scale)
			root.drawLine(leftX, lowerY, rightX, lowerY, 0.2, 0.1, scale)
		}

		sections.push({
			element: root.element,
			height: currY * scale
		})

		sections.push({
			element: new DomPaint().element,
			height: 2 * scale
		})
		/* TODO[Dev]: 文末不保留空白 */
	}

	/**
	 * 渲染声部，包含声部的名称标记
	 */
	renderPart(startY: number, part: NMNPart, root: DomPaint, context: RenderContext, line: NMNLine, lastLine: NMNLine | undefined, isFirst: boolean) {
		let currY = startY
		const scale = context.render.scale!
		let shouldLabel = context.render.explicitmarkers! || (connectSigs(line.partSignatures) != connectSigs(lastLine?.partSignatures))
		const msp = new MusicPaint(root)

		// ===== 渲染FCA =====
		currY += this.renderLineFCA(currY, part, false, root, context)
		// ===== 渲染跳房子 =====
		if(isFirst) {
			currY += this.renderJumpers(currY, line, root, context)
		}
		// ===== 渲染音乐行 =====
		currY += this.renderPartNotes(currY, part, root, context, isFirst)
		const lastYs = this.musicLineYs[this.musicLineYs.length - 1]
		// ===== 标记声部名称 =====
		if(shouldLabel) {
			msp.drawPartName(context, this.columns.startPosition(0) - scale * 1.5, lastYs.middle, part.notes.tags, 1, scale)
		}

		currY += 2

		/* TODO[Dev]: 歌词行 */

		return currY - startY
	}

	/**
	 * 渲染 FCA 标记
	 */
	renderLineFCA(startY: number, line: DestructedFCA, isSmall: boolean, root: DomPaint, context: RenderContext) {
		let currY = startY
		const msp = new MusicPaint(root)
		const scale = context.render.scale!
		const noteMeasure = msp.measureNoteChar(context, isSmall, scale)
		const FCALineField = 2.5

		function handleSections<T>(sections: MusicSection<T>[], noteHandler: (note: MusicNote<T>, sectionIndex: number, section: MusicSection<T>) => void) {
			sections.forEach((section, sectionIndex) => {
				if(section.type != 'section') {
					return
				}
				section.notes.forEach((note) => {
					if(note.type != 'note') {
						return
					}
					noteHandler(note, sectionIndex, section)
				})
			})
		}

		const createNoteHandler = <T>(handler: (note: MusicNote<T> & {type: 'note'}, fracPos: Fraction, pos: number) => void) => {
			return (note: MusicNote<T>, sectionIndex: number, section: MusicSection<T>) => {
				const fracPos = Frac.add(section.startPos, note.startPos)
				const pos = this.columns.fracPosition(sectionIndex, fracPos)
				if(note.type != 'note') {
					return
				}
				handler(note, fracPos, pos)
			}
		}

		// ===== 文本标记 =====
		for(let i = line.annotations.length - 1; i >= 0; i--){
			let ann = line.annotations[i]
			if(SectionStat.allEmpty(ann.sections, 0, ann.sections.length)) {
				continue
			}
			currY += FCALineField / 2
			handleSections<NoteCharText>(ann.sections, createNoteHandler((note, fracPos, pos) => {
				msp.drawFCANote(context, pos, 0, currY, ann.index, note.char, isSmall, scale)
			}))
			currY += FCALineField / 2
		}
		// ===== 和弦 =====
		if(line.chord && !SectionStat.allEmpty(line.chord.sections, 0, line.chord.sections.length)) {
			currY += FCALineField / 2
			handleSections<NoteCharChord>(line.chord.sections, createNoteHandler((note, fracPos, pos) => {
				if(note.voided) {
					return
				}
				msp.drawFCANote(context, pos, 0, currY, -1, note.char, isSmall, scale)
			}))
			currY += FCALineField / 2
		}
		// ===== 力度 =====
		if(line.force && !SectionStat.allEmpty(line.force.sections, 0, line.force.sections.length)) {
			currY += FCALineField / 2
			handleSections<NoteCharForce>(line.force.sections, createNoteHandler((note, fracPos, pos) => {
				if(note.voided) {
					return
				}
				const endFracPos = Frac.add(fracPos, note.length)
				let endPos = this.columns.fracEndPosition(endFracPos)
				msp.drawFCANote(context, pos, endPos, currY, -1, note.char, isSmall, scale)
			}))
			currY += FCALineField / 2
		}

		currY -= 1.5
		currY = Math.max(currY, startY)
		return currY - startY
	}

	/**
	 * 渲染跳房子符号
	 */
	renderJumpers(startY: number, line: NMNLine, root: DomPaint, context: RenderContext) {
		const scale = context.render.scale!
		const msp = new MusicPaint(root)
		let currY = startY

		const fieldHeight = 3
		if(line.jumpers.length > 0) {
			let successCount = 0
			currY += fieldHeight
			const topY = currY - 1.3
			const bottomY = currY + 1
			const centerY = (topY + bottomY) / 2
			line.jumpers.forEach((jumper) => {
				let startX = 0
				let endX = 0
				let startIn = false
				let endIn = false
				if(line.startSection <= jumper.startSection && jumper.startSection < line.startSection + line.sectionCount) {
					startIn = true
					startX = this.columns.startPosition(jumper.startSection - line.startSection) + 0.5 * scale
				}
				if(line.startSection < jumper.endSection && jumper.endSection <= line.startSection + line.sectionCount) {
					endIn = true
					endX = this.columns.endPosition(jumper.endSection - 1 - line.startSection) - 0.5 * scale
				}
				if(!startIn) {
					startX = this.columns.startPosition(0)
				}
				if(!endIn) {
					endX = this.columns.endPosition(line.sectionCount - 1)
				}
				if(jumper.openRange) {
					if(!startIn && !endIn) {
						return
					}
					if(!startIn) {
						startX = Math.max(startX, endX - 30 * scale)
					}
					if(!endIn) {
						endX = Math.min(endX, startX + 60 * scale)
					}
				}
				successCount += 1
				root.drawLine(startX, topY, endX, topY, 0.14, 0.07, scale)
				if(startIn) {
					root.drawLine(startX, bottomY, startX, topY, 0.14, 0.07, scale)
				}
				if(endIn) {
					root.drawLine(endX, bottomY, endX, topY, 0.14, 0.07, scale)
				}
				if(startIn) {
					msp.drawJumperAttrs(context, startX + 0.3 * scale, centerY, jumper.attrs, 1, scale)
				}
			})
			if(successCount == 0) {
				// rnm，退钱！
				currY -= fieldHeight
			}
		}

		return currY - startY
	}

	/**
	 * 渲染声部的音符行
	 */
	renderPartNotes(startY: number, part: NMNPart, root: DomPaint, context: RenderContext, isFirst: boolean) {
		let currY = startY
		currY += 2.5
		const fieldHeight = 5.5
		const scale = context.render.scale!

		currY += fieldHeight / 2

		new SectionsRenderer(this.columns).render(currY, part, root, context, isFirst, false)

		currY += fieldHeight / 2

		this.musicLineYs.push({
			top: currY - fieldHeight,
			middle: currY - fieldHeight / 2,
			bottom: currY
		})

		return currY - startY
	}
}
