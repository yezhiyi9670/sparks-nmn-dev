import jquery from 'jquery'

export type EquifieldSection = {
	element: HTMLElement
	height: number
}

export class Equifield {
	element: HTMLDivElement
	field: number = 120
	padding: number = 10
	listener: () => void

	constructor(element: HTMLDivElement) {
		this.element = element
		jquery(this.element)
			.addClass('wcl-equifield-root')
			.css('padding', `0 ${this.padding}em`)
		this.listener = () => {
			this.resize()
		}
		addEventListener('resize', this.listener)
		this.resize()
	}

	resize() {
		const $element = jquery(this.element)
		let width = $element[0].clientWidth
		if(width > 0) {
			$element.css('font-size', `${width / (this.field - 0 * this.padding)}px`)
		}
	}
	
	destroy() {
		removeEventListener('resize', this.listener)
		jquery(this.element).removeClass('wcl-equifield-root')
	}

	render(sections: EquifieldSection[]) {
		const $element = jquery(this.element)
		$element.children().remove()
		
		sections.forEach((section) => {
			$element.append(
				jquery('<div></div>').addClass('wcl-equifield-field').css({'height': `${section.height}em`})
				.append(
					jquery('<div></div>').addClass('wcl-equifield-content')
					.append(section.element)
				)
			)
		})
	}
}
