import { NMNResult } from "../../..";
import { I18n } from "../../../i18n";
import { SectionStat } from "../../../parser/des2cols/section/SectionStat";
import { MusicDecorationRange, MusicNote, MusicSection, NoteCharMusic } from "../../../parser/sparse2des/types";
import { findWithKey } from "../../../util/array";
import { Frac, Fraction } from "../../../util/frac";
import { DomPaint } from "../../backend/DomPaint";
import { FontMetric } from "../../FontMetric";
import { MusicPaint } from "../../paint/MusicPaint";
import { PaintTextToken } from "../../paint/PaintTextToken";
import { RenderContext } from "../../renderer";
import { reductionLineSpace } from "./font/fontMetrics";
import { PositionDispatcher } from "./PositionDispatcher";

type NMNLine = (NMNResult['result']['articles'][0] & {type: 'music'})['lines'][0]
type NMNPart = NMNLine['parts'][0]

type SectionsRenderData = {
	notes: {
		sections: MusicSection<NoteCharMusic>[]
	},
	decorations: MusicDecorationRange[]
}

type ConnectorStatNote = MusicNote<NoteCharMusic> & {
	leftTop: number,
	rightTop: number
}

export class SectionsRenderer {
	columns: PositionDispatcher

	constructor(columns: PositionDispatcher) {
		this.columns = columns
	}

	render(currY: number, part: SectionsRenderData, root: DomPaint, context: RenderContext, hasJumperOverlap: boolean, isFirstPart: boolean, isSmall: boolean) {
		const sections = part.notes.sections
		const msp = new MusicPaint(root)
		const scale = context.render.scale!
		const fieldHeight = isSmall ? 5.5 : 4.5

		// ===== 小节线 =====
		let firstSection = true
		sections.forEach((section, index) => {
			const isLast = index == sections.length - 1
			if(firstSection) {
				msp.drawSectionSeparator(
					context, this.columns.startPosition(index), currY,
					section.separator, 'before',
					isSmall ? 0.6 : 1, scale
				)
			}
			if(!isSmall || index < sections.length - 1) {
				msp.drawSectionSeparator(
					context, this.columns.endPosition(index), currY,
					section.separator, isLast ? 'after' : 'next',
					isSmall ? 0.6 : 1, scale
				)
			}
			firstSection = false
		})

		// ===== 小节序号 =====
		const ordinalMode = context.render!.sectionorder
		if(isFirstPart && !hasJumperOverlap && ordinalMode != 'none' && sections.length > 0) {
			let ordinalText = (sections[0]!.ordinal + 1).toString()
			if(ordinalMode == 'paren') {
				ordinalText = '(' + ordinalText + ')'
			}
			if(ordinalMode == 'bracket') {
				ordinalText = '[' + ordinalText + ']'
			}
			const ordinalX = this.columns.startPosition(0) - 0.5 * scale
			const ordinalMetric = new FontMetric('Deng/400', 2.0)
			root.drawText(ordinalX, currY - fieldHeight * 0.7, ordinalText, ordinalMetric, scale, 'left', 'bottom', {
				fontStyle: ordinalMode == 'plain' ? 'italic' : 'normal'
			})
		}

		// ===== 连接线 =====
		const drawConnect = (startX: number, linkStart: boolean, endX: number, linkEnd: boolean, baseY: number, maxHeight: number) => {
			let heightRestrictions = 0
			if(linkStart) {
				heightRestrictions += 1
			}
			if(linkEnd) {
				heightRestrictions += 1
			}
			let rangeWidth = endX - startX
			let height = maxHeight
			if(rangeWidth < heightRestrictions * maxHeight * scale) {
				height = rangeWidth / heightRestrictions / scale
			}
			const topY = baseY - height

			const startAnchorX = ((+linkStart) * height * scale) + startX
			const endAnchorX = - ((+linkEnd)   * height * scale) + endX

			if(linkStart) {
				root.drawQuarterCircle(startAnchorX, baseY, height, 'left', 'top', 0.2, scale)
			}
			if(linkEnd) {
				root.drawQuarterCircle(endAnchorX, baseY, height, 'right', 'top', 0.2, scale)
			}
			root.drawLine(startAnchorX, topY, endAnchorX, topY, 0.2, 0.001, scale)
		}
		const noteMeasure = msp.measureNoteChar(context, isSmall, scale)
		
		// 拉平所有音符列表
		const noteList: ConnectorStatNote[] = []
		part.notes.sections.forEach((section) => {
			if(section.type != 'section') {
				return
			}
			section.notes.forEach((note) => {
				noteList.push({
					...note,
					startPos: Frac.add(section.startPos, note.startPos),
					leftTop: +Infinity,
					rightTop: +Infinity
				})
			})
		})
		// 对范围内音符执行操作
		const checkNoteList = (func: (note: ConnectorStatNote, hasLeft: boolean, hasRight: boolean) => void, leftPos: Fraction, rightPos: Fraction, leftLink: boolean, rightLink: boolean) => {
			noteList.forEach((note) => {
				const leftCmp = Frac.compare(note.startPos, leftPos)
				const rightCmp = Frac.compare(note.startPos, rightPos)
				// 开头
				if(leftCmp == 0 && rightCmp < 0) {
					if(leftLink) {
						func(note, false, true)
					} else {
						func(note, true, true)
					}
				}
				// 结尾
				if(rightCmp == 0 && (leftCmp > 0 || (leftCmp >= 0 && !leftLink)) && rightLink) {
					func(note, true, false)
				}
				// 中间
				if(leftCmp > 0 && rightCmp < 0) {
					func(note, true, true)
				}
			})
		}
		// 绘制连音线
		const drawConnector = (decor: MusicDecorationRange) => {
			let maxTopOctave = 0
			;[ decor.startPos, decor.endPos ].forEach((pos) => {
				const note = SectionStat.locateNote(pos, part.notes.sections)
				if(note && note.type == 'note') {
					maxTopOctave = Math.max(maxTopOctave, note.char.octave)
				}
			})
			let linkStart = !decor.startSplit
			let linkEnd = !decor.endSplit
			let [ startX, endX ] = [
				{frac: decor.startPos,linkStart, link: linkStart, isEnd: false},
				{frac: decor.endPos,linkEnd, link: linkEnd, isEnd: true}
			].map(({frac, link, isEnd}) => {
				if(link) {
					let sectionIndex = SectionStat.locateSection(frac, part.notes.sections)
					if(sectionIndex == -1) {
						return NaN
					}
					return this.columns.fracPosition(sectionIndex, frac)
				} else {
					let sectionIndex = SectionStat.locateSection(frac, part.notes.sections)
					if(sectionIndex == -1) {
						return NaN
					}
					return this.columns.startPosition(sectionIndex)
				}
			})
			let topY = currY - noteMeasure[1] / 2 - noteMeasure[1] * (0.22 * maxTopOctave + 0.1)
			const baseHeight = noteMeasure[1] * 0.45
			const heightSpacing = noteMeasure[1] * 0.15
			let baseY = topY - baseHeight
			if(decor.level == 1 && !isSmall) {
				baseY -= heightSpacing
			}
			checkNoteList((note, hasLeft, hasRight) => {
				if(hasLeft) {
					baseY = Math.min(baseY, note.leftTop - heightSpacing)
				}
				if(hasRight) {
					baseY = Math.min(baseY, note.rightTop - heightSpacing)
				}
			}, decor.startPos, decor.endPos, linkStart, linkEnd)
			checkNoteList((note, hasLeft, hasRight) => {
				if(hasLeft) {
					note.leftTop = Math.min(note.leftTop, baseY)
				}
				if(hasRight) {
					note.rightTop = Math.min(note.rightTop, baseY)
				}
			}, decor.startPos, decor.endPos, linkStart, linkEnd)

			if(startX != startX) {
				linkStart = false
				startX = this.columns.startPosition(0)
			}
			if(endX != endX) {
				linkEnd = false
				endX = this.columns.endPosition(this.columns.data.length - 1)
			}

			drawConnect(startX, linkStart, endX, linkEnd, topY, -(baseY - topY))
		}
		part.decorations.map((decor) => {
			if(decor.char == '~') {
				drawConnector(decor)
			}
		})
		part.decorations.map((decor) => {
			if(decor.char == '*') {
				drawConnector(decor)
			}
		})

		// ===== 小节音符 =====
		sections.forEach((section, sectionIndex) => {
			// 画高亮区
			if(!isSmall && section.idCard.lineNumber != -1 && section.idCard.uuid != '') {
				const startX = this.columns.startPosition(sectionIndex)
				const endX = this.columns.endPosition(sectionIndex)
				const centerY = currY + fieldHeight / 4
				const highlightClass = [`SparksNMN-sechl`, `SparksNMN-sechl-${section.idCard.uuid}`]
				const lineWidth = fieldHeight / 2
				root.drawLine(startX, centerY, endX, centerY, lineWidth, 0, scale, {
					boxShadow: `inset 0 0 0 100em #9C27B0`,
					opacity: 0.25,
					visibility: 'hidden'
				}, highlightClass)
			}
			if(section.type == 'section') {
				const noteMeasure = msp.measureNoteChar(context, isSmall, scale)
				// 画音符
				section.notes.forEach((note) => {
					let reductionLevel = 0
					section.decoration.forEach((decor) => {
						if(decor.char == '_') {
							if(Frac.compare(decor.startPos, note.startPos) <= 0 && Frac.compare(note.startPos, decor.endPos) <= 0) {
								reductionLevel = Math.max(reductionLevel, decor.level)
							}
						}
					})

					const noteX = this.columns.fracPosition(sectionIndex, Frac.add(section.startPos, note.startPos))
					msp.drawMusicNote(context, noteX, currY, note, reductionLevel, isSmall, scale)
				})
				// 画减时线
				section.decoration.forEach((decor) => {
					if(decor.char == '_') {
						const startX = this.columns.fracPosition(sectionIndex, Frac.add(section.startPos, decor.startPos)) - noteMeasure[0] / 2
						const endX = this.columns.fracPosition(sectionIndex, Frac.add(section.startPos, decor.endPos)) + noteMeasure[0] / 2
						const redY = currY + noteMeasure[1] / 2 - noteMeasure[1] * 0.03 + (decor.level - 1) * reductionLineSpace
						root.drawLine(startX, redY, endX, redY, 0.2, 0, scale)
					}
				})
				// 画三连音
				if(!isSmall) {
					section.decoration.forEach((decor) => {
						if(decor.char == 'T') {
							const startX = this.columns.fracPosition(sectionIndex, Frac.add(section.startPos, decor.startPos)) - noteMeasure[0] / 2
							const endX = this.columns.fracPosition(sectionIndex, Frac.add(section.startPos, decor.endPos)) + noteMeasure[0] / 2
							// const lowY = currY - noteMeasure[1] / 2 - 0.5
							let highY = currY - noteMeasure[1] / 2 - 2
							const heightSpacing = noteMeasure[1] * 0.25
							checkNoteList((note) => {
								highY = Math.min(highY, note.leftTop - heightSpacing)
								highY = Math.min(highY, note.rightTop - heightSpacing)
							}, Frac.add(section.startPos, decor.startPos), Frac.add(section.startPos, decor.endPos), true, true)
							const lowY = highY + 1.5
							const midX = (startX + endX) / 2
							const threeToken = new PaintTextToken(
								'3', new FontMetric('SparksNMN-mscore-20/400', 3),
								scale, {fontStyle: 'italic'}
							)
							const threeMeasure = threeToken.measureFast(root)
							const midLX = midX - threeMeasure[0]
							const midRX = midX + threeMeasure[0]
							root.drawLine(startX, lowY, startX, highY, 0.2, 0.1, scale)
							if(midLX > startX) {
								root.drawLine(startX, highY, midLX, highY, 0.2, 0.1, scale)
							}
							threeToken.drawFast(root, midX, highY, 'center', 'middle')
							if(endX > midRX) {
								root.drawLine(midRX, highY, endX, highY, 0.2, 0.1, scale)
							}
							root.drawLine(endX, lowY, endX, highY, 0.2, 0.1, scale)
						}
					})
				}
				// 画插入符号
				const insertCount: {[_: string]: number} = {}
				section.decoration.forEach((decor) => {
					if(decor.type == 'insert') {
						const sig = Frac.repr(decor.target)
						if(!(sig in insertCount)) {
							insertCount[sig] = 0
						}
						decor.ordinal = insertCount[sig]
						insertCount[sig] += 1
					}
				})
				section.decoration.forEach((decor) => {
					if(decor.type == 'insert') {
						const sig = Frac.repr(decor.target)
						const times = insertCount[sig]
						const pos = this.columns.fracInsertPosition(sectionIndex, Frac.add(section.startPos, decor.target), decor.ordinal, times)
						msp.drawInsert(context, pos, currY, decor.char, isSmall, scale)
					}
				})
				// 画校验域
				if(section.validation != 'pass' && context.render.debug!) {
					const topY = currY - noteMeasure[1] / 2
					const bottomY = currY + noteMeasure[1] / 2
					const startX = this.columns.paddedEndPosition(sectionIndex)
					const endX = this.columns.endPosition(sectionIndex)
					const midX = (startX + endX) / 2
					root.drawLine(midX, topY, midX, bottomY, endX - startX, 0, scale, {
						boxShadow: `inset 0 0 0 100em ${section.validation == 'less' ? '#FF9800' : '#03A9F4'}`
					})
				}
				// 画属性
				const topAttr = findWithKey(section.separator.before.attrs, 'type', 'top')
				const topAdjust = (topAttr && topAttr.type == 'top') ? topAttr.margin : 0
				msp.drawBeforeAfterAttrs(context, this.columns.startPosition(sectionIndex), currY - topAdjust, section.separator.before.attrs, section, sectionIndex == 0, 'before', 1, scale)
				msp.drawBeforeAfterAttrs(context, this.columns.endPosition(sectionIndex), currY - topAdjust, section.separator.after.attrs, section, sectionIndex == 0, 'after', 1, scale)
			} else if(section.type == 'omit') {
				const omitFontMetric = new FontMetric('SimHei/400', 2.16)
				if(section.count != section.count) {
					const startX = this.columns.paddedStartPosition(sectionIndex)
					root.drawText(startX, currY, I18n.renderToken(context.language, 'omit'), omitFontMetric, scale, 'left', 'middle')
				} else {
					const midX = (
						this.columns.startPosition(sectionIndex) + this.columns.endPosition(sectionIndex)
					) / 2
					root.drawText(midX, currY, I18n.renderToken(context.language, 'omit_n', section.count.toString()), omitFontMetric, scale, 'center', 'middle')
				}
			}
		})
	}
}
