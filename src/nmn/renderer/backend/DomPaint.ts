import $ from 'jquery'
import { FontMetric } from '../FontMetric'
import { md5 } from '../../util/md5'
import { iterateMap } from '../../util/array'
import { camelCase2Hyphen } from '../../util/string'

type ExtraStyles = {[_: string]: number | string}

const measureCache: {[_: string]: [number, number]} = {}
const measureCacheFast: {[_: string]: [number, number]} = {}

const upScale = window.navigator.userAgent.indexOf('Edg') != -1 ? 2 : 5  // 将字体和图元大小数据调高，然后通过 transform scale 还原，一可以提高打印质量，二可以避免最小字体问题。
const downScale = window.navigator.userAgent.indexOf('Edg') != -1 ? 0.5 : 1
// upScale 小了会出事情，现在暂时不管为什么

export const domPaintStats = {
	measureTime: 0,
	domDrawTime: 0
}

// 替换XML
function escapeXml(unsafe: string) {
	return unsafe.replace(/[<>&'"]/g, function (c: string) {
		switch (c) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
		}
		return ''
	});
}

// 生成 style 字符串
function translateStyles(styles: ExtraStyles) {
	return escapeXml(iterateMap(styles, (value, key) => {
		return `${camelCase2Hyphen(key)}:${value};`
	}).join(''))
}

// 生成 Token
function generateToken() {
	let length = 24
	let charset = '0123456789abcdfghijkmopqrstuvxyz'
	let str = ''
	for(let i = 0; i < length; i++) {
		let randChar = charset[Math.floor(Math.random() * charset.length)]
		str += randChar
	}
	return str
}

export class DomPaint {
	element: HTMLDivElement
	htmlContent: string
	token: string
	clickCallbacks: {[_: string]: () => void} = {}

	getElement() {
		this.element.innerHTML = this.htmlContent
		for(let i = 0; i < this.element.children.length; i++) {
			const innerElement = this.element.children[i]
			const prefix = 'DomPaint-clickable__'
			if(innerElement.id.startsWith(prefix)) {
				const token = innerElement.id.substring(prefix.length)
				if(token in this.clickCallbacks) {
					innerElement.addEventListener('click', this.clickCallbacks[token])
				}
			}
		}
		return this.element
	}
	
	constructor() {
		this.token = generateToken()
		this.element = $<HTMLDivElement>('<div></div>').css({position: 'relative'}).addClass('DomPaint__' + this.token)[0]
		this.htmlContent = ''
	}

	/**
	 * 多边形模拟四分之一圆弧形状
	 */
	polygonQuarterCircle(innerRatio: number) {
		let points: [number, number][] = []
		let sides = 12
		for(let i = 0; i <= sides; i++) {
			let angle = Math.PI / 2 / sides * i
			points.push([Math.cos(angle), Math.sin(angle)])
		}
		for(let i = sides; i >= 0; i--) {
			let angle = Math.PI / 2 / sides * i
			points.push([Math.cos(angle) * innerRatio, Math.sin(angle) * innerRatio])
		}
		return points.map((point) => {
			return `${50 + point[0] * 50}% ${50 + point[1] * 50}%`
		}).join(',')
	}
	/**
	 * 测量文本框的宽度和高度（以 em 为单位）
	 * @param text 文本内容
	 * @param font 字体，类型为 FontMetric
	 * @returns 
	 */
	measureText(text: string, font: FontMetric, widthScale: number = 1, extraStyles: ExtraStyles = {}) {
		if(text == '') {
			return [0, 0]
		}
		domPaintStats.measureTime -= +new Date()
		const hash = md5(JSON.stringify({
			text: text,
			font: font.fontFamily + '/' + font.fontWeight + '/' + (font.fontSize * font.fontScale),
			extraStyles: extraStyles
		}))
		if(hash in measureCache) {
			const [ width, height ] = measureCache[hash]
			domPaintStats.measureTime += +new Date()
			return [ width * widthScale, height ]
		}
		let fontSize = font.fontSize * font.fontScale
		const $measure = $('<span></span>').text(text)
		.css('line-height', 1.15)
		.css('white-space', 'pre')
		.css('display', 'inline-block')
		.css('position', 'fixed')
		.css('top', 0)
		.css('left', 0)
		.css('font-family', font.fontFamily)
		.css('font-size', `${fontSize * 100}px`)  // 100 倍的尺寸减小最小字体限制造成的影响
		.css('font-weight', font.fontWeight)
		.css(extraStyles)
		$('body').append($measure)
		const width = $measure[0].clientWidth / 100
		const height = $measure[0].clientHeight / 100
		$measure.remove()
		measureCache[hash] = [ width, height ]
		domPaintStats.measureTime += +new Date()
		return [ width * widthScale, height ]
	}
	/**
	 * 测量文本框的宽度和高度（仅适用单行简单文本）
	 * @param text 文本内容
	 * @param font 字体，类型为 FontMetric
	 * @returns 
	 */
	measureTextFast(text: string, font: FontMetric, widthScale: number = 1) {
		if(text == '') {
			return [0, 0]
		}
		domPaintStats.measureTime -= +new Date()
		const hash = md5(JSON.stringify({
			text: text,
			font: font.fontFamily + '/' + font.fontWeight + '/' + (font.fontSize * font.fontScale),
		}))
		if(hash in measureCacheFast) {
			const [ width, height ] = measureCacheFast[hash]
			domPaintStats.measureTime += +new Date()
			return [ width * widthScale, height ]
		}
		let canvas = document.createElement('canvas')
		let context = canvas.getContext('2d')
		let fontSize = font.fontSize * font.fontScale
		if(context == null) {
			domPaintStats.measureTime += +new Date()
			return [0, 0]
		}
		context.font = `${font.fontWeight >= 550 ? 'bold ' : ''}${fontSize}px "${font.fontFamily}"`
		let width = context.measureText(text).width
		canvas.remove()
		measureCacheFast[hash] = [ width, 0 ]
		domPaintStats.measureTime += +new Date()
		return [width * widthScale, 0]
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
	drawTextFast(x: number, y: number, text: string, font: FontMetric, scale: number, align: 'left' | 'center' | 'right' = 'left', alignY: 'top' | 'middle' | 'bottom' = 'top', extraStyles: ExtraStyles = {}, clickHandler?: () => void) {
		let fontSize = font.fontSize * font.fontScale
		x /= fontSize
		y /= fontSize
		const tx = {left: 0, center: -50, right: -100}[align]
		const ty = {top: 0, middle: -50, bottom: -100}[alignY]

		domPaintStats.domDrawTime -= +new Date()
		// const textSpan = $('<span></span>').text(text).css('color', '#000')
		// .css('white-space', 'pre')
		// .css('display', 'inline-block')
		// .css('position', 'absolute')
		// .css('text-align', align)
		// .css('font-family', font.fontFamily)
		// .css('font-size', `${fontSize * scale * upScale}em`)
		// .css('font-weight', font.fontWeight)
		// .css('top', `0`)
		// .css('left', `0`)
		// .css('transform-origin', 'top left')
		// .css('transform', `translateX(${x/scale/upScale}em) translateY(${y / upScale}em) scale(${1/upScale}) translateX(${tx}%) translateY(${ty}%) `)
		// .css(extraStyles)
		// if(clickHandler) {
		// 	textSpan.on('click', clickHandler).css('cursor', 'pointer')
		// }
		// $(this.element).append((
		// 	textSpan
		// ))
		let token = ''
		if(clickHandler) {
			token = generateToken()
			this.clickCallbacks[token] = clickHandler
		}
		const textSpanText = `<span style="${translateStyles(
			{
				color: '#000',
				whiteSpace: 'pre',
				display: 'inline-block',
				position: 'absolute',
				textAlign: align,
				fontFamily: font.fontFamily,
				fontSize: `${fontSize * scale * upScale}em`,
				fontWeight: font.fontWeight,
				top: 0,
				left: 0,
				transformOrigin: 'top left',
				transform: `translateX(${x/scale/upScale}em) translateY(${y / upScale}em) scale(${1/upScale}) translateX(${tx}%) translateY(${ty}%)`,
				...(clickHandler ? {
					cursor: 'pointer'
				} : {}),
				...extraStyles
			}
		)}" ${clickHandler ? 'id="DomPaint-clickable__' + token + '"' : ''}>${escapeXml(text)}</span>`
		this.htmlContent += textSpanText
		domPaintStats.domDrawTime += +new Date()
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
	drawText(x: number, y: number, text: string, font: FontMetric, scale: number, align: 'left' | 'center' | 'right' = 'left', alignY: 'top' | 'middle' | 'bottom' = 'top', extraStyles: ExtraStyles = {}, clickHandler?: () => void) {
		this.drawTextFast(x, y, text, font, scale, align, alignY, extraStyles, clickHandler)
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
	drawLine(x1: number, y1: number, x2: number, y2: number, width: number, padding: number = 0, scale: number = 1, extraStyles: ExtraStyles = {}, extraClasses: string[] = []) {
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
		domPaintStats.domDrawTime -= +new Date()
		// $(this.element).append((
		// 	$('<div></div>')
		// 	.css('box-shadow', `inset 0 0 0 ${width * upScale}em`) // 确保打印能够正常输出。若使用背景颜色，打印时可能会被忽略。
		// 	.addClass('visible-print-block')
		// 	.css('position', 'absolute')
		// 	.css('width', `${(lineLength + 2 * padding) * upScale}em`)
		// 	.css('height', `${width * upScale}em`)
		// 	.css('transform', `translateX(${centerX}em) translateY(${centerY}em) translateX(-50%) translateY(-50%) rotate(${angle}deg) scale(${1/upScale})`)
		// 	.css('left', `0`)
		// 	.css('top', `0`)
		// 	.css(extraStyles)
		// ))
		const textSpanText = `<div style="${translateStyles(
			{
				boxShadow: `inset 0 0 0 ${width * upScale}em`,
				position: 'absolute',
				width: `${(lineLength + 2 * padding) * upScale}em`,
				height: `${width * upScale}em`,
				left: 0,
				top: 0,
				transform: `translateX(${centerX}em) translateY(${centerY}em) translateX(-50%) translateY(-50%) rotate(${angle}deg) scale(${1/upScale})`,
				...extraStyles
			}
		)}" class="${extraClasses.join(' ')}"></div>`
		this.htmlContent += textSpanText
		domPaintStats.domDrawTime += +new Date()
	}
	/**
	 * 绘制圆弧线
	 */
	drawQuarterCircle(x: number, y: number, r: number, halfX: 'left' | 'right', halfY: 'top' | 'bottom', width: number, scale: number = 1, extraStyles: ExtraStyles = {}) {
		y *= scale
		r *= scale
		width *= scale
		r += width / 2
		const ratio = 1 - width / r
		let rotate = 0
		if(halfX == 'left') {
			if(halfY == 'top') {
				rotate = 180
			} else {
				rotate = 90
			}
		} else {
			if(halfY == 'top') {
				rotate = 270
			} else {
				rotate = 0
			}
		}
		domPaintStats.domDrawTime -= +new Date()
		// $(this.element).append((
		// 	$('<div></div>')
		// 	.css('box-shadow', `inset 0 0 0 ${r / downScale}em`) // 确保打印能够正常输出。若使用背景颜色，打印时可能会被忽略。
		// 	.css('clip-path', `polygon(${this.polygonQuarterCircle(ratio)})`)
		// 	.addClass('visible-print-block')
		// 	.css('position', 'absolute')
		// 	.css('width', `${r * 2 / downScale}em`)
		// 	.css('height', `${r * 2 / downScale}em`)
		// 	.css('transform', `translateX(${x}em) translateY(${y}em) translateX(-${50}%) translateY(-${50}%) scale(${downScale}) rotate(${rotate}deg)`)
		// 	.css('left', `0`)
		// 	.css('top', `0`)
		// 	.css(extraStyles)
		// ))
		const textSpanText = `<div style="${translateStyles(
			{
				boxShadow: `inset 0 0 0 ${r / downScale}em`,
				clipPath: `polygon(${this.polygonQuarterCircle(ratio)})`,
				position: 'absolute',
				width: `${r * 2 / downScale}em`,
				height: `${r * 2 / downScale}em`,
				left: 0,
				top: 0,
				transform: `translateX(${x}em) translateY(${y}em) translateX(-${50}%) translateY(-${50}%) scale(${downScale}) rotate(${rotate}deg)`,
				...extraStyles
			}
		)}"></div>`
		this.htmlContent += textSpanText
		domPaintStats.domDrawTime += +new Date()
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
