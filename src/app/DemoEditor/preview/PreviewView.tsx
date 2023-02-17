import React, { createRef, useEffect, useMemo, useRef } from "react"
import { createUseStyles } from "react-jss"
import { callRef } from "../../../util/hook"
import { useI18n } from "../../i18n/i18n"
import { NMNLanguageArray, NMNResult } from "../../../nmn"
import { SparksNMNPreview } from "../../../nmn/react-ace-editor/SparksNMNPreview"
import $ from 'jquery'
import { Equifield } from "../../../nmn/equifield/equifield"

const useStyles = createUseStyles({
	root: {
		padding: '32px 0',
		paddingBottom: '320px',
		width: '100%',
		boxSizing: 'border-box',
		userSelect: 'text',
		minHeight: '100%'
	},
	warning: {
		marginBottom: '32px',
		padding: '0 8.33%',
		userSelect: 'none'
	},
	warningIn: {
		whiteSpace: 'pre-wrap',
		padding: '16px',
		background: '#fffbe6',
		border: '1px solid #f4bd00',
		color: '#000D',
		lineHeight: 1.35
	},
	'@media print': {
		root: {
			padding: 0
		},
		warning: {
			display: 'none'
		}
	}
})

export type PreviewCursor = {
	code: string,
	position: [number, number]
}

export function PreviewView(props: {
	result: NMNResult | undefined
	language: NMNLanguageArray
	onPosition?: (row: number, col: number) => void
	cursor?: PreviewCursor
	onReportTiming?: (value: number) => void
	onReportSize?: (value: number) => void
}) {
	const classes = useStyles()
	const LNG = useI18n()

	const prevMaxWidth = useRef(1000)
	const maxWidth = 1000
	const updateWidth = prevMaxWidth.current != maxWidth
	prevMaxWidth.current = maxWidth
	const hasContent = !props.result || props.result.result.musicalProps

	useEffect(() => {
		if(updateWidth) {
			window.dispatchEvent(new Event('resize')) // 使 Equifield 更新其宽度
		}
		if(!hasContent) {
			props.onReportSize && props.onReportSize(0)
			props.onReportTiming && props.onReportTiming(0)
		}
	})

	const blankPreview = useMemo(() => (
		<PreviewBlank />
	), [])
	const alignMode: string = 'left'
	return (
		<div className={classes.root} style={{
			maxWidth: maxWidth,
			margin: (alignMode == 'center') ? '0 auto' : '',
			borderRight: (alignMode == 'left') ? '1px solid #0002' : ''
		}}>
			<div className={classes.warning}>
				<div className={classes.warningIn}>
					{LNG('preview.warning')}
				</div>
			</div>
			{hasContent ? <SparksNMNPreview
				result={props.result}
				language={props.language}
				cursor={props.cursor}
				onPosition={props.onPosition}
				onReportTiming={props.onReportTiming}
				onReportSize={props.onReportSize}
			/> : blankPreview}
		</div>
	)
}

function PreviewBlank() {
	const LNG = useI18n()
	const divRef = createRef<HTMLDivElement>()

	useEffect(() => {
		callRef(divRef, div => {
			const ef = new Equifield(div)
			ef.render([
				{
					element: $('<span></span>').css({
						fontSize: '3em',
						fontWeight: 700,
						color: '#999'
					}).text(LNG('preview.blank.title'))[0],
					height: 6
				},
				{
					element: $('<span></span>').css({
						fontSize: '2em',
						color: '#999'
					}).text(LNG('preview.blank.desc.1'))[0],
					height: 4
				},
				{
					element: $('<span></span>').css({
						fontSize: '2em',
						color: '#999'
					}).text(LNG('preview.blank.desc.2'))[0],
					height: 4
				},
			])
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return <div ref={divRef}></div>
}
