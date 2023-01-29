import { NMNResult } from "../../.."
import { ScoreContext } from "../../../parser/sparse2des/context"
import { MusicSection, NoteCharAny } from "../../../parser/sparse2des/types"
import { countArray, findWithKey } from "../../../util/array"
import { Frac, Fraction } from "../../../util/frac"
import { DomPaint } from "../../backend/DomPaint"
import { RenderContext } from "../../renderer"
import { getLineFont } from "./font/fontMetrics"

type NMNLine = (NMNResult['result']['articles'][0] & {type: 'music'})['lines'][0]

type SectionPositions = {
	/**
	 * 边界位置
	 */
	range: [number, number]
	/**
	 * 边界边距
	 */
	padding: [number, number]
	/**
	 * 左边界和右边界的分数位置
	 */
	fraction: [Fraction, Fraction]
	/**
	 * 限制条件
	 */
	columns: ColumnPosition[]
}
type ColumnPosition = {
	/**
	 * 分数位置的签名
	 */
	hash: string
	/**
	 * 文本两侧占据排版空间的场宽（在边距内计算）
	 */
	field: [number, number]
	/**
	 * 文本两侧不占据排版空间，但是必须满足的场宽（可以与边距重叠，但不能超过边界）
	 */
	requiredField: [number, number]
	/**
	 * 是否将 requiredField 固化为 field
	 */
	rigid: [boolean, boolean]
	/**
	 * 分数位置
	 */
	fraction: Fraction
	/**
	 * 分配的位置
	 */
	position: number
}

/* TODO[Dev]: 添加滑音记号的布局空间 */

/**
 * 列空间分配算法
 */
export class PositionDispatcher {
	root: DomPaint
	line: NMNLine
	context: RenderContext
	scale: number
	data: SectionPositions[] = []

	constructor(root: DomPaint, line: NMNLine, context: RenderContext) {
		this.root = root
		this.line = line
		this.context = context
		this.scale = context.render.scale!
		this.dispatch()
	}

	/**
	 * 分配位置
	 */
	dispatch() {
		this.dispatch$setSections()
		this.dispatch$statColumns()
		this.dispatch$compute()
		console.log('Column slot', this.data)
	}
	/**
	 * 分配位置 - 统计小节
	 */
	dispatch$setSections() {
		const leftBoundary = 1 * this.scale
		const rightBoundary = 100
		const sectionPadding = 1 * this.scale
		const oneWidth = (rightBoundary - leftBoundary) / this.line.sectionCount
		this.line.sectionFields.forEach((fields, index) => {
			this.data.push({
				range: [ leftBoundary + oneWidth * index, leftBoundary + oneWidth * (index + 1) ],
				padding: [ sectionPadding, sectionPadding ],
				fraction: [ Frac.sub(fields[0], Frac.create(1, 2)), Frac.add(fields[0], fields[1]) ], // 开头扩展半个四分音符的位置，以调和“极不自然”的不对称性
				columns: []
			})
		})
	}
	/**
	 * 分配位置 - 统计布局列
	 */
	dispatch$statColumns() {
		// 记录限制条件信息
		const addConstraint = (pos: Fraction, index: number, field: [number, number], occupiesSpace: boolean) => {
			const currentSection = this.data[index]
			const fracSign = Frac.repr(pos)
			let current = findWithKey(currentSection.columns, 'hash', fracSign)
			if(!current) {
				currentSection.columns.push(current = {
					hash: fracSign,
					fraction: pos,
					field: [0, 0],
					requiredField: [0, 0],
					rigid: [false, false],
					position: currentSection.range[0] + currentSection.padding[0]
				})
			}
			if(occupiesSpace) {
				current.field = [
					Math.max(current.field[0], field[0]),
					Math.max(current.field[1], field[1])
				]
			}
			current.requiredField = [
				Math.max(current.requiredField[0], field[0]),
				Math.max(current.requiredField[1], field[1])
			]
		}
		const handleSections = (sections: MusicSection<NoteCharAny>[] | undefined, isMusic: boolean, isSmall: boolean, rangeStart: number = 0) => {
			if(!sections) {
				return
			}
			const noteCharMetric = getLineFont(isSmall ? 'noteSmall' : 'note', this.context)
			const addNoteCharMetric = getLineFont(isSmall ? 'addNoteSmall' : 'addNote', this.context)
			const accidentalCharMetric = getLineFont(isSmall ? 'noteSmall' : 'note', this.context)
			const noteCharMeasure = this.root.measureTextFast('0', noteCharMetric, this.scale)
			const accidentalMeasure = this.root.measureTextFast("\uE10E", accidentalCharMetric, this.scale)
			const addNoteCharMeasure = this.root.measureTextFast('0', addNoteCharMetric, this.scale)
			sections.forEach((section, sectionIndex) => {
				const actualIndex = sectionIndex + rangeStart
				if(actualIndex < 0 || actualIndex > this.line.sectionFields.length) {
					return
				}
				if(section.type != 'section') {
					return
				}
				section.notes.forEach((note) => {
					const fracPos = Frac.add(this.line.sectionFields[actualIndex][0], note.startPos)
					if(isMusic) {
						let hasAccidental = false
						let leftAddCount = 0
						let rightAddCount = 0
						let dotCount = 0
						if(note.type == 'note') {
							const noteChar = note.char
							if(noteChar.type != 'music') {
								throw new Error('Position dispatching occured with a non-music note.')
							}
							if(noteChar.delta == noteChar.delta) {
								hasAccidental = true
							}
							for(let attr of note.attrs) {
								if(attr.type == 'notes') {
									if(attr.slot == 'prefix') {
										leftAddCount = attr.notes.type == 'section' ? attr.notes.notes.length : 0
									} else if(attr.slot == 'postfix') {
										rightAddCount = attr.notes.type == 'section' ? attr.notes.notes.length : 0
									}
								}
							}
							dotCount = countArray(note.suffix, '.')
						}
						addConstraint(fracPos, actualIndex, [
							noteCharMeasure[0] / 2,
							noteCharMeasure[0] / 2
						], true) // 音符本身占据排版域
						addConstraint(fracPos, actualIndex, [
							noteCharMeasure[0] / 2 + (+hasAccidental) * accidentalMeasure[0] + leftAddCount * addNoteCharMeasure[0],
							(noteCharMeasure[0] / 2) * (1 + dotCount) + rightAddCount * addNoteCharMeasure[0]
						], false) // 音符的附加符号（升降调、装饰音、滑音）的排版空间必须满足，但不需要
					} else {
						addConstraint(fracPos, actualIndex, [0, 0], false) // 标记内容不参与自动排版，但是保留席位
					}
				})
			})
		}
		this.line.parts.forEach((part) => {
			handleSections(part.notes.sections, true, false)
			handleSections(part.force?.sections, false, false)
			handleSections(part.chord?.sections, false, false)
			part.annotations.forEach((ann) => {
				handleSections(ann.sections, false, false)
			})
			part.lyricLines.forEach((lrcLine) => {
				// 歌词占位推断
				lrcLine.sections.forEach((lrcSection, sectionIndex) => {
					if(lrcSection.type != 'section') {
						return
					}
					lrcSection.chars.forEach((char) => {
						const lrcMetric = getLineFont('lyrics', this.context)
						let roleString = ''
						if(char.rolePrefix !== undefined) {
							roleString = '(' + char.rolePrefix + ')'
						}
						const leftMeasure = this.root.measureTextFast(char.prefix, lrcMetric, this.scale)
						const rightMeasure = this.root.measureTextFast(char.postfix, lrcMetric, this.scale)
						const roleMeasure = this.root.measureTextFast(roleString, lrcMetric, this.scale)
						const textMeasure = this.root.measureTextFast(char.text, lrcMetric, this.scale)
						let lm = 0
						let rm = 0
						const dm = this.root.measureTextFast('a', lrcMetric, this.scale)[0]
						// 词基歌词的单词左右需要留空位，防止单词粘连。
						if(!char.isCharBased) {
							if(!roleString && !char.prefix) {
								lm = dm
							}
							if(!char.postfix) {
								rm = dm
							}
						}
						addConstraint(Frac.add(lrcSection.startPos, char.startPos), sectionIndex, [
							textMeasure[0] / 2 + leftMeasure[0] + roleMeasure[0] + lm,
							textMeasure[0] / 2 + rightMeasure[0] + rm
						], false)
					})
				})
				handleSections(lrcLine.force?.sections, false, false)
				handleSections(lrcLine.chord?.sections, false, false)
				lrcLine.annotations.forEach((ann) => {
					handleSections(ann.sections, false, false)
				})
				lrcLine.notesSubstitute.forEach((Ns) => {
					handleSections(Ns.sections, true, true, Ns.substituteLocation)
				})
			})
		})
		// 排序以便后续布局
		this.line.sectionFields.forEach((_, i) => {
			// 若没有列，添加一个防止后续出现问题
			if(this.data[i].columns.length == 0) {
				addConstraint(this.data[i].fraction[1], i, [0, 0], true)
			}
			this.data[i].columns.sort((x, y) => {
				return Frac.compare(x.fraction, y.fraction)
			})
		})
	}
	/**
	 * 分配位置 - 计算布局
	 */
	dispatch$compute() {
		this.line.sectionFields.forEach((_, sectionIndex) => {
			const attempDispatch = () => {
				const data = this.data[sectionIndex]
				
				// ===== 统计权重 =====
				let totalSpare = data.range[1] - data.range[0]
				const weights: Fraction[] = []
				for(let i = 0; i < data.columns.length; i++) {
					// 间隙 0 ~ L - 1
					let prevFrac = data.fraction[0]
					const isRigid = data.columns[i].rigid[0]
					if(i > 0) {
						prevFrac = data.columns[i - 1].fraction
					}
					if(isRigid) {
						weights.push(Frac.create(0))
					} else {
						weights.push(Frac.sub(data.columns[i].fraction, prevFrac))
					}
					// 计算总空间
					if(i > 0) {
						if(isRigid) {
							totalSpare -= Math.max(data.columns[i].field[0], data.columns[i].requiredField[0])
							totalSpare -= Math.max(data.columns[i - 1].field[1], data.columns[i - 1].requiredField[1])
						} else {
							totalSpare -= data.columns[i].field[0] + data.columns[i - 1].field[1]
						}
					} else {
						if(isRigid) {
							// 左边沿已经固化，不计算边距空间
							totalSpare -= Math.max(data.padding[0] + data.columns[i].field[0], data.columns[i].requiredField[0])
						} else {
							totalSpare -= data.padding[0] + data.columns[i].field[0]
						}
					}
				}
				// 间隙 L
				let lastColumn = data.columns[data.columns.length - 1]!
				if(lastColumn.rigid[1]) {
					totalSpare -= Math.max(data.padding[1] + lastColumn.field[1], lastColumn.requiredField[1])
					weights.push(Frac.create(0))
				} else {
					totalSpare -= data.padding[1] + lastColumn.field[1]
					weights.push(Frac.sub(data.fraction[1], lastColumn.fraction))
				}
				const totalWeight = Frac.sum(...weights)
				// ===== 分配位置 =====
				let currentPos = data.range[0]
				for(let i = 0; i < data.columns.length; i++) {
					const isRigid = data.columns[i].rigid[0]
					if(isRigid) {
						if(i > 0) {
							currentPos += 0
						} else {
							currentPos += Math.max(data.padding[0] + data.columns[i].field[0], data.columns[i].requiredField[0])
						}
					} else {
						if(i == 0) {
							currentPos += data.padding[0]
						}
						currentPos += totalSpare / Frac.toFloat(totalWeight) * Frac.toFloat(weights[i])
					}
					data.columns[i].position = currentPos
					if(isRigid) {
						currentPos += data.columns[i].requiredField[1]
					} else {
						currentPos += data.columns[i].field[1]
					}
				}
			}
			const checkRequired = (): 'pass' | 'dead' | 'continue' => {
				const data = this.data[sectionIndex]
				
				// 完成：所有条件被满足
				// 没救了：被固化的条件仍然无法满足（此时在不固化任何条件的情况下再分配一次即结束）
				let needContinue = false
				let lastPos = data.range[0]
				for(let i = 0; i < data.columns.length; i++) {
					const isRigid = data.columns[i].rigid[0]
					let requiredField = data.columns[i].requiredField[0]
					if(i > 0) {
						requiredField += data.columns[i - 1].requiredField[1]
					}
					const currPos = data.columns[i].position
					if(currPos - lastPos < requiredField) {
						if(isRigid) {
							return 'dead'
						} else {
							data.columns[i].rigid[0] = true
							if(i > 0) {
								data.columns[i - 1].rigid[1] = true
							}
							needContinue = true
						}
					}
					lastPos = currPos
				}
				const currPos = data.range[1]
				let lastColumn = data.columns[data.columns.length - 1]!
				const isRigid = lastColumn.rigid[1]
				if(currPos - lastPos < lastColumn.requiredField[1]) {
					if(isRigid) {
						return 'dead'
					} else {
						lastColumn.rigid[1] = true
						needContinue = true
					}
				}
				if(needContinue) {
					return 'continue'
				} else {
					return 'pass'
				}
			}
			const clearRigid = () => {
				const data = this.data[sectionIndex]
				data.columns.forEach((col) => {
					col.rigid[0] = col.rigid[1] = false
				})
			}
			while(true) {
				attempDispatch()
				const ch = checkRequired()
				if(ch == 'pass') {
					return
				} else if(ch == 'dead') {
					console.log('Oh, nmsl')
					clearRigid()
					attempDispatch()
					return
				}
			}
		})
	}
}
