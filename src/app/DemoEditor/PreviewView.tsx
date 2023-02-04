import jquery from 'jquery'
import React, { useEffect } from 'react'
import { createUseStyles } from 'react-jss'
import { Equifield, EquifieldSection } from '../../equifield/equifield'
import { NMNResult, SparksNMN } from '../../nmn'
import languageArray_zh_cn from '../../nmn/i18n/zh_cn'
import { lineRendererStats } from '../../nmn/renderer/article/line/LineRenderer'
import { positionDispatcherStats } from '../../nmn/renderer/article/line/PositionDispatcher'
import { domPaintStats } from '../../nmn/renderer/backend/DomPaint'

const maxWidth = 1000
const useStyles = createUseStyles({
	previewContainer: {
		margin: '16px auto',
		width: maxWidth,
		minHeight: 216,
		border: '1px solid #00000022'
	},
	previewContent: {
		padding: '48px 0'
	},
	[`@media(max-width: ${maxWidth + 32}px)`]: {
		previewContainer: {
			width: '100%',
			border: 'none'
		},
		previewContent: {
			padding: '16px 0'
		}
	},
	'@media print': {
		previewContainer: {
			width: '100%',
			border: 'none',
		},
		previewContent: {
			padding: '0'
		}
	}
})

type PreviewViewProps = {
	result: NMNResult | undefined
	onPosition?: (row: number, col: number) => void
}
export function PreviewView(props: PreviewViewProps) {
	const classes = useStyles()
	const divRef = React.createRef<HTMLDivElement>()

	const positionCallback = (row: number, col: number) => {
		if(props.onPosition) {
			props.onPosition(row, col)
		}
	}

	const renderResultFields = React.useMemo(() => {
		if(props.result) {
			domPaintStats.measureTime = 0
			domPaintStats.domDrawTime = 0
			lineRendererStats.sectionsRenderTime = 0
			positionDispatcherStats.computeTime = 0
			let startTime = +new Date()
			const fields = SparksNMN.render(props.result.result, languageArray_zh_cn, positionCallback)
			let endTime = +new Date()
			console.log('Render took ', endTime - startTime, 'milliseconds')
			console.log('  Measure took ', domPaintStats.measureTime, 'milliseconds')
			console.log('  Dom draw took ', domPaintStats.domDrawTime, 'milliseconds')
			console.log('  Section render took ', lineRendererStats.sectionsRenderTime, 'milliseconds')
			console.log('  Dispatching took ', positionDispatcherStats.computeTime, 'milliseconds')
			return fields
		} else {
			return [{
				element: jquery('<span style="font-size: 2em">Loading preview...</span>')[0],
				height: 3
			}]
		}
	}, [props.result])
	
	React.useEffect(() => {
		const element = divRef.current
		if(!element) {
			return
		}
		let startTime = +new Date()
		const ef = new Equifield(element)
		ef.render(renderResultFields)
		let endTime = +new Date()
		console.log('Actuation took', endTime - startTime, 'milliseconds')

		return () => {
			ef.destroy()
		}
	})

	return <div className={classes.previewContainer}>
		<div className={classes.previewContent}>
			<div ref={divRef}></div>
		</div>
	</div>
}
