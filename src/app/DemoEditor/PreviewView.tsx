import jquery from 'jquery'
import React, { useEffect } from 'react'
import { createUseStyles } from 'react-jss'
import { Equifield, EquifieldSection } from '../../equifield/equifield'
import { NMNResult, SparksNMN } from '../../nmn'
import languageArray_zh_cn from '../../nmn/i18n/zh_cn'

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
			const startTime = +new Date()
			const fields = SparksNMN.render(props.result.result, languageArray_zh_cn, positionCallback)
			const endTime = +new Date()
			console.log('Render took ', endTime - startTime, 'milliseconds')
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
		const ef = new Equifield(element)
		ef.render(renderResultFields)
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
