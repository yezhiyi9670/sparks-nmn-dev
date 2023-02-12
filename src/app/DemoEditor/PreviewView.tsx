import jquery, { data } from 'jquery'
import React, { useEffect } from 'react'
import { createUseStyles } from 'react-jss'
import { NMNI18n, NMNResult, SparksNMN } from '../../nmn'
import { SparksNMNPreview } from '../../nmn/react-ace-editor/SparksNMNPreview'

const maxWidth = 1000
const useStyles = createUseStyles({
	previewContainer: {
		margin: '16px auto',
		width: maxWidth,
		minHeight: 216,
		border: '1px solid #00000022'
	},
	previewContent: {
		padding: '48px 0',
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
			padding: '0',
			'& .SparksNMN-sechl': {
				display: 'none !important'
			}
		}
	}
})

type PreviewViewProps = {
	result: NMNResult | undefined
	onPosition?: (row: number, col: number) => void
	cursor?: {
		code: string,
		position: [number, number]
	}
}
export function PreviewView(props: PreviewViewProps) {
	const classes = useStyles()

	return <div className={classes.previewContainer}>
		<div className={classes.previewContent}>
			<SparksNMNPreview language={NMNI18n.languages.zh_cn} result={props.result} onPosition={props.onPosition} logTimeStat cursor={props.cursor} />
		</div>
	</div>
}
