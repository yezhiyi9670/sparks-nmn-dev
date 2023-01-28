import $ from 'jquery'
import { FontMetric } from '../FontMetric'

type ExtraStyles = {[_: string]: number | string}

export class DomPaint {
	element: HTMLDivElement
	
	constructor() {
		this.element = $<HTMLDivElement>('<div></div>').css({position: 'relative'})[0]
	}
	/**
	 * 测量文本框的宽度和高度（以 em 为单位）
	 * @param text 文本内容
	 * @param font 字体，类型为 FontMetric
	 * @returns 
	 */
	measureText(text: string, font: FontMetric, widthScale: number = 1, extraStyles: ExtraStyles = {}) {
		let fontSize = font.fontSize * font.fontScale
		const $measure = $('<span></span>').text(text)
		.css('white-space', 'pre')
		.css('display', 'inline-block')
		.css('position', 'absolute')
		.css('font-family', font.fontFamily)
		.css('font-size', `${fontSize * 100}px`)  // 100 倍的尺寸减小最小字体限制造成的影响
		.css('font-weight', font.fontWeight)
		.css(extraStyles)
		$('body').append($measure)
		const width = $measure[0].clientWidth / 100
		const height = $measure[0].clientHeight / 100
		$measure.remove()
		return [ width * widthScale, height ]
	}
	/**
	 * 绘制文本框
	 * @param x 到页面左基线的距离（以 em 为单位，页面宽度是 100em）
	 * @param y 到页面上基线的距离（以 em 为单位）
	 * @param text 文本内容
	 * @param font 字体，类型为 FontMetric
	 * @param scale 尺寸缩放，应用于字体大小和
	 * @param align 文本的水平贴靠方式，同时是定位锚点的方位
	 * @param alignY 竖直定位锚点的方位
	 * @param extraStyles 应用在 <span> 元素上的额外样式
	 * @returns 文本的尺寸测量数据，不受 scale 参数影响，但受 fontScale 影响
	 */
	drawText(x: number, y: number, text: string, font: FontMetric, scale: number, align: 'left' | 'center' | 'right' = 'left', alignY: 'top' | 'middle' | 'bottom' = 'top', extraStyles: ExtraStyles = {}) {
		let fontSize = font.fontSize * font.fontScale
		x /= fontSize
		y /= fontSize
		const tx = {left: '0', center: '-50%', right: '-100%'}[align]
		const ty = {top: '0', middle: '-50%', bottom: '-100%'}[alignY]
		$(this.element).append(
			$('<span></span>').text(text).css('color', '#000')
			.css('white-space', 'pre')
			.css('display', 'inline-block')
			.css('position', 'absolute')
			.css('text-align', align)
			.css('font-family', font.fontFamily)
			.css('font-size', `${fontSize * scale}em`)
			.css('font-weight', font.fontWeight)
			.css('top', `${y}em`)
			.css('left', `${x / scale}em`)
			.css('transform', `translateX(${tx}) translateY(${ty})`)
			.css(extraStyles)
		)
		return this.measureText(text, font, scale, extraStyles)
	}
	/**
	 * 绘制直线
	 * @param x1 第一点到页面左基线的距离
	 * @param y1 第一点到页面上基线的距离
	 * @param x2 第二点到页面左基线的距离
	 * @param y2 第二点到页面上基线的距离
	 * @param width 直线宽度（以 em 为单位）
	 * @param padding 直线在两端加长的长度
	 * @param extraStyles 应用在 <div> 元素上的额外样式
	 */
	drawLine(x1: number, y1: number, x2: number, y2: number, width: number, padding: number = 0, scale: number = 1, extraStyles: ExtraStyles = {}) {
		y1 *= scale
		y2 *= scale
		padding *= scale
		width *= scale
		let dx = x2 - x1
		let dy = y2 - y1
		let lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
		let centerX = (x1 + x2) / 2
		let centerY = (y1 + y2) / 2
		let angle = Math.atan2(dy, dx) * 180 / Math.PI
		$(this.element).append(
			$('<div></div>')
			// .css('background-color', '#000')
			.css('box-shadow', `inset 0 0 0 ${width}em`) // 确保打印能够正常输出。若使用背景颜色，打印时可能会被忽略。
			.addClass('visible-print-block')
			.css('position', 'absolute')
			.css('width', `${lineLength + 2 * padding}em`)
			.css('height', `${width}em`)
			.css('transform', `translateX(-50%) translateY(-50%) rotate(${angle}deg)`)
			.css('left', `${centerX}em`)
			.css('top', `${centerY}em`)
			.css(extraStyles)
		)
	}
	/**
	 * 绘制空心矩形
	 */
	drawRectOutline(x1: number, y1: number, x2: number, y2: number, width: number, scale: number = 1, extraStyles: ExtraStyles = {}) {
		const padding = width / 2
		this.drawLine(x1, y1, x2, y1, width, padding, scale, extraStyles)
		this.drawLine(x2, y1, x2, y2, width, padding, scale, extraStyles)
		this.drawLine(x2, y2, x1, y2, width, padding, scale, extraStyles)
		this.drawLine(x1, y2, x1, y1, width, padding, scale, extraStyles)
	}
}
