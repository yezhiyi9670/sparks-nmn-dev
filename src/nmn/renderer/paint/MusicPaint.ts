import { I18n } from '../../i18n'
import { BaseTune, Beats, MusicProps, Qpm } from '../../parser/sparse2des/types'
import { MusicTheory } from '../../util/music'
import { DomPaint } from '../backend/DomPaint'
import { FontMetric } from '../FontMetric'
import { RenderContext } from '../renderer'
import { PaintTextToken } from './PaintTextToken'

// Don't use these here!
const $ = null
const window = null
const document = null

type ExtraStyles = {[_: string]: number | string}

/**
 * 音乐符号绘制类
 */
export class MusicPaint {
	root: DomPaint
	
	constructor(root: DomPaint) {
		this.root = root
	}

	/**
	 * 升降还原符号
	 */
	symbolAccidental(delta: number) {
		if(delta == 0) {
			return "\uE113"
		}
		let absVal = Math.abs(delta)
		let sign = Math.round(delta / absVal)
		let ret = ''
		// 升降记号
		while(absVal >= 1) {
			absVal -= 1
			ret += sign > 0 ? "\uE10E" : "\uE114"
		}
		// 微分记号
		while(absVal >= 0.5) {
			absVal -= 0.5
			ret += sign > 0 ? "\uE1BE" : "\uE1BF"
		}
		if(ret == '') {
			return "\uE113"
		}
		return ret
	}
	/**
	 * 拍号音符
	 */
	symbolBeats(symbol: 'qpm' | 'hpm' | 'spm') {
		if(symbol == 'qpm') {
			return "\uE1D8"
		}
		if(symbol == 'hpm') {
			return "\uE1D6"
		}
		if(symbol == 'spm') {
			return "\uE1D9"
		}
		return ''
	}

	/**
	 * 绘制拍号符号
	 * @param x 左边缘的横坐标
	 * @param y 竖直中心位置所在的纵坐标
	 * @param beats 拍号
	 * @param fontScale 字体缩放
	 * @returns 宽度为拍号符号的宽度，高度为分子部分高度的两倍
	 */
	drawBeats(x: number, y: number, beats: Beats, fontScale: number = 1, scale: number = 1, extraStyles: ExtraStyles = {}, dryRun: boolean = false) {
		const numberMetrics = new FontMetric('SparksNMN-EOPNumber/400', 1.8 * fontScale)
		const textMetrics = new FontMetric('SimHei/700', 1.9 * fontScale)
		const xMeasure = this.root.measureTextFast(beats.value.x.toString(), numberMetrics, scale)
		const yMeasure = this.root.measureTextFast(beats.value.y.toString(), numberMetrics, scale)
		const numberWidth = Math.max(xMeasure[0], yMeasure[0])
		const numberHeight = Math.max(xMeasure[1], yMeasure[1])
		const linePadding = fontScale * 0.5 * scale
		const lineSpacing = fontScale * 0.2
		const lineWidth = numberWidth + 2 * linePadding
		const lineWeight = 0.2 * fontScale
		const tMargin = fontScale * 0.35 * scale
		const tMeasure = this.root.measureTextFast('T', textMetrics, scale)
		const totalMeasure = [
			lineWidth + (beats.defaultReduction > 2 ? tMargin + tMeasure[0] : 0),
			(lineSpacing + numberHeight) * 2
		]
		if(dryRun) {
			return totalMeasure
		}
		
		this.root.drawLine(x, y, x + lineWidth, y, lineWeight, 0, scale, extraStyles)
		this.root.drawTextFast(x + lineWidth / 2, y - lineSpacing, beats.value.x.toString(), numberMetrics, scale, 'center', 'bottom', extraStyles)
		this.root.drawTextFast(x + lineWidth / 2, y + lineSpacing, beats.value.y.toString(), numberMetrics, scale, 'center', 'top', extraStyles)
		if(beats.defaultReduction > 2) {
			this.root.drawTextFast(x + lineWidth + tMargin, y, 'T', textMetrics, scale, 'left', 'middle')
		}

		return totalMeasure
	}

	/**
	 * 绘制调性符号
	 * @param x 左边缘的横坐标
	 * @param y 竖直中心位置所在的纵坐标
	 * @param base 基调
	 * @param fontScale 字体缩放
	 * @returns 测量值
	 */
	drawBase(x: number, y: number, base: BaseTune, fontScale: number = 1, scale: number = 1, extraStyles: ExtraStyles = {}, dryRun: boolean = false) {
		const textMetrics = new FontMetric('Deng/700', 2.16 * fontScale)
		const accidentalMetrics = new FontMetric('SparksNMN-mscore-20', 2.16 * fontScale)
		
		const text1Measure = this.root.measureTextFast('1=', textMetrics, scale)
		const rootText = MusicTheory.pitch2AbsName(base)
		const delta = base.value - base.baseValue
		const rootMeasure = this.root.measureTextFast(rootText, textMetrics, scale)
		let accidentalText = ''
		if(delta == delta && delta != 0) {
			accidentalText = this.symbolAccidental(delta)
		}
		const accidentalMeasure = this.root.measureTextFast(accidentalText, accidentalMetrics, scale)
		const totalMeasure = [
			text1Measure[0] + rootMeasure[0] + accidentalMeasure[0],
			Math.max(text1Measure[1], rootMeasure[1])
		]
		if(dryRun) {
			return totalMeasure
		}

		let currX = x
		this.root.drawTextFast(currX, y, '1=', textMetrics, scale, 'left', 'middle', extraStyles)
		currX += text1Measure[0]
		this.root.drawTextFast(currX, y, accidentalText, accidentalMetrics, scale, 'left', 'bottom', extraStyles)
		currX += accidentalMeasure[0]
		this.root.drawTextFast(currX, y, rootText, textMetrics, scale, 'left', 'middle', extraStyles)
		currX += rootMeasure[0]

		return totalMeasure
	}
	/**
	 * 绘制拍速符号
	 */
	drawSpeed(x: number, y: number, speed: Qpm, fontScale: number = 1, scale: number = 1, extraStyles: ExtraStyles = {}, dryRun: boolean = false) {
		let text = '=' + speed.value.toString()
		if(speed.text) {
			text = speed.text
		}
		const textToken = new PaintTextToken(
			text,
			new FontMetric('Deng/700', 2.0 * fontScale),
			scale, extraStyles
		)
		const textMeasure = textToken.measureFast(this.root)
		
		let symbolText = this.symbolBeats(speed.symbol)
		if(speed.text) {
			symbolText = ''
		}
		const symbolToken = new PaintTextToken(
			symbolText,
			new FontMetric('SparksNMN-mscore-20', 3.2 * fontScale),
			scale, extraStyles
		)
		const symbolMeasure = symbolToken.measure(this.root)

		const totalMeasure = [
			textMeasure[0] + symbolMeasure[0],
			textMeasure[1]
		]

		if(dryRun) {
			return totalMeasure
		}

		let currX = x
		if(symbolText) {
			symbolToken.drawFast(this.root, currX, y + symbolMeasure[1] * 0.08, 'left', 'middle')
			currX += symbolMeasure[0]
			if(speed.symbol != 'spm') {
				currX -= symbolMeasure[0] * 0.35
			} else {
				currX -= symbolMeasure[0] * 0.08
			}
		}
		textToken.drawFast(this.root, currX, y, 'left', 'middle')
		currX += textMeasure[0]

		return totalMeasure
	}
	/**
	 * 绘制移调符号
	 */
	drawTranspose(context: RenderContext, x: number, y: number, transpose: number, fontScale: number = 1, scale: number = 1, extraStyles: ExtraStyles = {}, dryRun: boolean = false) {
		let numberText = transpose.toString()
		if(transpose > 0) {
			numberText = '+' + numberText
		}
		const textToken = new PaintTextToken(
			I18n.renderToken(context.language, 'transpose_prop', numberText),
			new FontMetric('Deng/700', 2.0 * fontScale),
			scale, extraStyles
		)
		const measure = textToken.measureFast(this.root)

		if(dryRun) {
			return measure
		}

		textToken.drawFast(this.root, x, y, 'left', 'middle')

		return measure
	}
	/**
	 * 绘制其他
	 */
	drawOther(x: number, y: number, text: string, fontScale: number = 1, scale: number = 1, extraStyles: ExtraStyles = {}, dryRun: boolean = false) {
		const textToken = new PaintTextToken(
			text,
			new FontMetric('Deng/700', 2.0 * fontScale),
			scale, extraStyles
		)
		const measure = textToken.measureFast(this.root)

		if(dryRun) {
			return measure
		}

		textToken.drawFast(this.root, x, y, 'left', 'middle')

		return measure
	}
	/**
	 * 绘制所有音乐属性
	 */
	drawMusicalProps(context: RenderContext, requireBeats: boolean, x: number, y: number, musicalProps: MusicProps, fontScale: number = 1, scale: number = 1, extraStyles: ExtraStyles = {}) {
		
		const spacer = 2 * fontScale
		let currX = x
		// ==== 基调 ====
		if(musicalProps.base) {
			currX += this.drawBase(currX, y, musicalProps.base, fontScale, scale, extraStyles)[0]
			if(musicalProps.beats || requireBeats) {
				currX += 1 * fontScale * scale
			} else {
				currX += spacer * scale
			}
		}
		// ==== 拍号 ====
		if(musicalProps.beats || requireBeats) {
			currX += this.drawBeats(currX, y, musicalProps.beats ? musicalProps.beats : context.musical.beats!, fontScale, scale, extraStyles)[0]
			currX += spacer * scale
		}
		// ==== 拍速 ====
		if(musicalProps.qpm) {
			currX += this.drawSpeed(currX, y, musicalProps.qpm, fontScale, scale, extraStyles)[0] + spacer * scale
		}
		// ==== 移调 ====
		if(musicalProps.transp) {
			currX += this.drawTranspose(context, currX, y, musicalProps.transp, fontScale, scale, extraStyles)[0] + spacer * scale
		}
		// ==== 其他参数 ====
		musicalProps.extras.forEach((str) => {
			currX += this.drawOther(currX, y, str, fontScale, scale, extraStyles)[0] + 1 * fontScale * scale
		})

		return currX - x
	}
}
