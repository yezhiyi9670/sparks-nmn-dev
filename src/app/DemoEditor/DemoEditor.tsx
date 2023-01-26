import { Ace } from 'ace-builds'
import React from 'react'
import AceEditor from 'react-ace'
import { createUseStyles } from 'react-jss'
import { CodeEditor } from '../../nmn/react-ace-editor/CodeEditor/CodeEditor'
import { NMNResult, SparksNMN } from '../../nmn/index'
import { SparksNMNEditor } from '../../nmn/react-ace-editor/SparksNMNEditor'
import { createDethrottledApplier, useOnceEffect } from '../../util/event'
import { PreviewView } from './PreviewView'

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
	const parseDethrottle = React.useMemo(() => {
		return createDethrottledApplier(200)
	}, [])
	const showContent = props.content ?? myContent
	function parseNMN(content: string) {
		const nmnResult = SparksNMN.parse(content)
		console.log(nmnResult)
		setResult(nmnResult)
	}
	function handleChange(newContent: string) {
		setMyContent(newContent)
		if(props.onChange) {
			props.onChange(newContent)
		}
		parseDethrottle(parseNMN)(newContent)
	}

	useOnceEffect(() => {
		parseNMN(showContent)
	})

	const resultPreview = React.useMemo(() => {
		return <PreviewView result={result} />
	}, [ result ])

	return <div className={classes.outer}>
		<div className={classes.previewSide}>
			{resultPreview}
		</div>
		<div className={classes.delimiter} />
		<div className={classes.editorSide}>
			<SparksNMNEditor
				name='code'
				value={showContent}
				onChange={handleChange}
				issues={result?.issues}
			/>
		</div>
	</div>
}
