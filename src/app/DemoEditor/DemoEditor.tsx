import { Ace } from 'ace-builds'
import React from 'react'
import AceEditor from 'react-ace'
import { createUseStyles } from 'react-jss'
import { CodeEditor } from '../../nmn/react-ace-editor/CodeEditor/CodeEditor'
import { NMNResult, SparksNMN } from '../../nmn/index'
import { SparksNMNEditor } from '../../nmn/react-ace-editor/SparksNMNEditor'
import { createDethrottledApplier, useOnceEffect } from '../../util/event'
import { PreviewView } from './PreviewView'
import { useMethod } from '../../util/hook'

const useStyles = createUseStyles({
	outer: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%'
	},
	editorSide: {
		flexGrow: 2,
		height: '60px',
	},
	delimiter: {
		height: '1px',
		backgroundColor: '#00000022'
	},
	previewSide: {
		flexGrow: 3,
		height: 0,
		overflowY: 'scroll'
	},
	'@media print': {
		outer: {
			height: 'unset'
		},
		delimiter: {
			display: 'none'
		},
		editorSide: {
			display: 'none'
		},
		previewSide: {
			height: 'unset',
			overflow: 'hidden',
			marginTop: '-2em',
		}
	}
})

type CursorData = {
	code: string,
	position: [number, number]
}

type DemoEditorProps = {
	initialContent?: string
	content?: string
	onChange?: (_: string) => void
	onPreviewUpdate?: (_: string) => void
}
export function DemoEditor(props: DemoEditorProps) {
	const classes = useStyles()
	const editorRef = React.createRef<AceEditor>()

	const [ myContent, setMyContent ] = React.useState(props.initialContent ?? '')
	const [ result, setResult ] = React.useState<NMNResult | undefined>(undefined)
	const [ cursorData, setCursorData ] = React.useState<CursorData | undefined>(undefined)
	const parseDethrottle = React.useMemo(() => {
		return createDethrottledApplier(200)
	}, [])
	const cursorChangeDethrottle = React.useMemo(() => {
		return createDethrottledApplier(100)
	}, [])
	const showContent = props.content ?? myContent
	function parseNMN(content: string) {
		let startTime = +new Date()
		const nmnResult = SparksNMN.parse(content)
		let endTime = +new Date()
		console.log('Parse took', endTime - startTime, 'milliseconds')
		console.log(nmnResult)
		setResult(nmnResult)
	}
	function handleChange(newContent: string) {
		setMyContent(newContent)
		if(props.onChange) {
			props.onChange(newContent)
		}
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		if(event.ctrlKey && event.key == 's') {
			parseDethrottle(parseNMN)(showContent)
			event.preventDefault()
		}
	}

	useOnceEffect(() => {
		parseNMN(showContent)
	})

	const handlePosition = useMethod((row: number, col: number) => {
		const editor = editorRef.current?.editor
		if(!editor) {
			return
		}
		editor.moveCursorTo(row - 1, col)
		editor.clearSelection()
		editor.renderer.scrollCursorIntoView(editor.getCursorPosition())
		editor.focus()
	})
	const handleCursorChangeIn = useMethod(() => {
		const editor = editorRef.current?.editor
		if(!editor) {
			return
		}
		const pos = editor.getCursorPosition()
		const cursor: CursorData = {
			code: editor.session.getLine(editor.getCursorPosition().row),
			position: [pos.row + 1, pos.column]
		}
		setCursorData(cursor)
	})
	const handleCursorChange = useMethod(() => {
		cursorChangeDethrottle(handleCursorChangeIn)()
	})
	const resultPreview = React.useMemo(() => {
		return <PreviewView result={result} onPosition={handlePosition} cursor={cursorData} />
	}, [ result, handlePosition, cursorData ])

	return <div className={classes.outer}>
		<div className={classes.previewSide}>
			{resultPreview}
		</div>
		<div className={classes.delimiter} />
		<div className={classes.editorSide} onKeyDown={handleKeyDown}>
			<SparksNMNEditor
				name='code'
				value={showContent}
				onChange={handleChange}
				onCursorChange={handleCursorChange}
				ref={editorRef}
				issues={result?.issues}
			/>
		</div>
	</div>
}
