import $ from 'jquery'
import { FontMetric } from '../FontMetric'

export class DomPaint {
	element: HTMLDivElement
	
	constructor() {
		this.element = $<HTMLDivElement>('<div></div>').css({position: 'relative'})[0]
	}
	drawText(x: number, y: number, text: string, font: FontMetric, align: 'left' | 'center' | 'right', scale: number) {
		let fontSize = font.fontSize * font.fontScale
		x /= fontSize
		y /= fontSize
		$(this.element).append(
			$('<span></span>').text(text)
			.css('white-space', 'pre')
			.css('display', 'inline-block')
			.css('position', 'absolute')
			.css('text-align', align)
			.css('font-family', font.fontFamily)
			.css('font-size', `${fontSize * scale}em`)
			.css('font-weight', font.fontWeight)
			.css('top', `${y}em`)
			.css('left', `${x / scale}em`)
			.css('transform', `translateX(${{left: '0', center: '-50%', right: '-100%'}[align]})`)
		)
	}
}
