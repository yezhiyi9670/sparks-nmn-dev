import React, { createRef, ReactNode, useRef } from "react"
import { createUseStyles } from "react-jss"
import { useOnceEffect } from "../util/event"
import { callRef } from "../util/hook"
import { Box } from "../util/component"
import { IntegratedEditor, IntegratedEditorApi } from "./DemoEditor/IntegratedEditor"

const useStyles = createUseStyles({
	outer: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		userSelect: 'none'
	},
	header: {
		height: '48px',
		borderBottom: '1px solid #00000029',
		backgroundColor: '#FAFAFA',
		boxSizing: 'border-box',
		padding: '0 12px',
		verticalAlign: 'middle',
		display: 'none'
	},
	headerText: {
		display: 'table-cell',
		height: '48px',
		verticalAlign: 'middle',
		fontSize: '18px',
		opacity: 0.6,
		userSelect: 'none'
	},
	inner: {
		flex: 'auto',
		overflow: 'hidden'
	},
	'@media print': {
		outer: {
			height: 'unset'
		},
		header: {
			display: 'none'
		},
		inner: {
			padding: '16px'
		}
	}
})

type PageHeaderProps = {
	text: string
	children: ReactNode
	onKeyDown?: (evt: React.KeyboardEvent) => void
}
export function PageHeader(props: PageHeaderProps) {
	const classes = useStyles()
	return <div className={classes.outer} onKeyDown={props.onKeyDown}>
		<div className={classes.header}>
			<div className={classes.headerText}>
				{props.text}
			</div>
		</div>
		<div className={classes.inner}>
			{props.children}
		</div>
	</div>
}

export function TestApp() {
	const editorRef = createRef<IntegratedEditorApi>()

	useOnceEffect(() => {
		const storedData = localStorage.getItem('sparks-nmn-demo-src')
		if(storedData) {
			callRef(editorRef, api => {
				api.triggerOpen({path: '', content: storedData})
			})
		}
	})

	function handleKeyDown(evt: React.KeyboardEvent) {
		if(evt.ctrlKey) {
			if(evt.key == 's') {
				evt.preventDefault()
				callRef(editorRef, api => {
					api.triggerBeforeSave()
					if(api.getIsDirty()) {
						localStorage.setItem('sparks-nmn-demo-src', api.getValue())
						api.triggerSaved('')
					}
				})
			} else if(evt.key == 'r') {
				evt.preventDefault()
				callRef(editorRef, api => {
					api.triggerBeforeSave()
				})
			}
		}
	}

	return <PageHeader text="Sparks NMN Dev Demo" onKeyDown={handleKeyDown}>
		<IntegratedEditor ref={editorRef} />
	</PageHeader>
}
