import React, { createRef, ReactNode, useMemo, useRef } from "react"
import { createUseStyles } from "react-jss"
import { useOnceEffect } from "../util/event"
import { callRef } from "../util/hook"
import { Box } from "../util/component"
import $ from 'jquery'
import { IntegratedEditor, IntegratedEditorApi } from "../nmn/integrated-editor/IntegratedEditor"
import { useI18n } from "./i18n/i18n"
import { NMNI18n } from "../nmn"

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

function getQueryVariable(variable: string) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return decodeURIComponent(pair[1]); }
	}
	return undefined
}

const isMobileInitially = window.innerWidth <= 900

export function TestApp() {
	const editorRef = createRef<IntegratedEditorApi>()
	const LNG = useI18n()

	useOnceEffect(() => {
		const loadLoc = getQueryVariable('load-example')
		if(loadLoc !== undefined) {
			const loc = 'example/' + loadLoc + '?time=' + (+new Date())
			if(loc.startsWith('//') || loc.includes(':') || loc.includes('..')) {
				console.warn('The request of loading file', loc, 'is blocked because it does not look safe')
			} else {
				$.get(loc, (data) => {
					if(typeof(data) == 'string' && !data.trim().startsWith('<')) {
						localStorage.setItem('sparks-nmn-demo-src', data)
						callRef(editorRef, api => {
							api.triggerOpen({path: '', content: data})
							history.replaceState(undefined, '', location.origin + location.pathname)
						})
					} else {
						console.warn('Failed to load file', loc)
					}
				})
			}
		} else {
			// load localStorage data
			const storedData = localStorage.getItem('sparks-nmn-demo-src')
			if(storedData) {
				callRef(editorRef, api => {
					api.triggerOpen({path: '', content: storedData})
				})
			}
		}
	})

	function handleSave() {
		callRef(editorRef, api => {
			api.triggerBeforeSave()
			if(api.getIsDirty()) {
				localStorage.setItem('sparks-nmn-demo-src', api.getValue())
				api.triggerSaved('')
			}
		})
	}

	function handleKeyDown(evt: React.KeyboardEvent) {
		if(evt.ctrlKey && !evt.shiftKey) {
			if(evt.key.toLowerCase() == 's') {
				evt.preventDefault()
				handleSave()
			} else if(evt.key.toLowerCase() == 'r') {
				evt.preventDefault()
				callRef(editorRef, api => {
					api.triggerBeforeSave()
				})
			}
		}
	}

	const editorPrefs = useMemo(() => ({
		modifyTitle: {
			default: LNG('title.default'),
			new: LNG('title.new'),
			newDirty: LNG('title.newDirty'),
			clean: LNG('title.new'),
			dirty: LNG('title.newDirty')
		},
		importantWarning: {text: LNG('preview.warning'), height: 19},
		temporarySave: true,
		isMobile: isMobileInitially,
		inspectorOpen: true,
		logTimeStat: true,
		instrumentSourceUrl: './nmn/resource/audio/',
	}), [LNG])

	return <PageHeader text="Sparks NMN Dev Demo" onKeyDown={handleKeyDown}>
		<IntegratedEditor onRequestSave={handleSave} ref={editorRef} editorPrefs={editorPrefs} language={NMNI18n.languages.zh_cn} />
	</PageHeader>
}
