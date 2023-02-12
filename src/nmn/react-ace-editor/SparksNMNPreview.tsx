import $ from 'jquery'
import React from 'react'
import { NMNResult, SparksNMN } from '..'
import { Equifield } from '../equifield/equifield'
import { LanguageArray } from '../i18n'
import { lineRendererStats } from '../renderer/article/line/LineRenderer'
import { positionDispatcherStats } from '../renderer/article/line/PositionDispatcher'
import { domPaintStats } from '../renderer/backend/DomPaint'
import { randomToken } from '../util/random'

type SparksNMNPreviewProps = {
	result: NMNResult | undefined
	language: LanguageArray
	onPosition?: (row: number, col: number) => void
	logTimeStat?: boolean
	cursor?: {
		code: string,
		position: [number, number]
	}
}
export function SparksNMNPreview(props: SparksNMNPreviewProps) {
	const divRef = React.createRef<HTMLDivElement>()

	const token = React.useMemo(() => randomToken(24), [])
	const tokenClass = `SparksNMN-preview-${token}`

	const positionCallback = React.useCallback((row: number, col: number) => {
		if(props.onPosition) {
			props.onPosition(row, col)
		}
	}, [props.onPosition])

	const renderResultFields = React.useMemo(() => {
		if(props.result) {
			domPaintStats.measureTime = 0
			domPaintStats.domDrawTime = 0
			lineRendererStats.sectionsRenderTime = 0
			positionDispatcherStats.computeTime = 0
			let startTime = +new Date()
			const fields = SparksNMN.render(props.result.result, props.language, positionCallback)
			let endTime = +new Date()
			if(props.logTimeStat) {
				console.log('Render took ', endTime - startTime, 'milliseconds')
				console.log('  Measure took ', domPaintStats.measureTime, 'milliseconds')
				console.log('  Dom draw took ', domPaintStats.domDrawTime, 'milliseconds')
				console.log('  Section render took ', lineRendererStats.sectionsRenderTime, 'milliseconds')
				console.log('  Dispatching took ', positionDispatcherStats.computeTime, 'milliseconds')
			}

			return fields
		} else {
			return [{
				element: $('<span style="font-size: 2em">Loading preview...</span>')[0],
				height: 3
			}]
		}
	}, [props.result, props.language, positionCallback])
	
	React.useEffect(() => {
		const element = divRef.current
		if(!element) {
			return
		}
		if(!$(element).hasClass(tokenClass)) {
			$(element).addClass(tokenClass)
		}
		let startTime = +new Date()
		const ef = new Equifield(element)
		ef.render(renderResultFields)
		let endTime = +new Date()
		if(props.logTimeStat) {
			console.log('Actuation took', endTime - startTime, 'milliseconds')
		}

		return () => {
			ef.destroy()
		}
	}, [renderResultFields])

	React.useEffect(() => {
		if(!props.result || !props.cursor) {
			return
		}
		const id = SparksNMN.getHighlightedSection(props.result.sectionPositions, props.cursor.code, props.cursor.position)
		$(`.${tokenClass} .SparksNMN-sechl`).css({visibility: 'hidden'})
		$(`.${tokenClass} .SparksNMN-sechl-${id}`).css({visibility: 'visible'})
	}, [props.result, renderResultFields, props.cursor])

	return <div ref={divRef}></div>
}
