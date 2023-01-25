import { Ace } from "ace-builds"
import React from "react"
import { SparksNMNLanguage, NMNI18n, NMNIssue } from ".."
import { CodeEditor } from "./CodeEditor/CodeEditor"
import AceEditor from 'react-ace'
import languageArray_zh_cn from '../../nmn/i18n/zh_cn'
import { TextHighlightRules } from 'ace-builds/src-noconflict/mode-text'
import './mode/sparksnmn'

interface SparksNMNEditorProps {
	name: string
	value?: string
	onChange?: (_: string) => void
	issues?: NMNIssue[]
}
export const SparksNMNEditor = (props: SparksNMNEditorProps) => {
	const ref = React.useRef<AceEditor>(null)

	const languageArray = languageArray_zh_cn

	const annotations: Ace.Annotation[] = React.useMemo(() => {
		const ret = props.issues?.map((issue) => {
			return {
				row: Math.max(0, issue.lineNumber - 1),
				column: issue.index,
				type: issue.severity == 'error' ? 'error' : 'warning',
				text: NMNI18n.issueDescription(languageArray, issue)
			}
		}) ?? []
		return ret
	}, [ props.issues ])

	React.useEffect(() => {
		if(ref.current) {
			ref.current.editor.session.setAnnotations(annotations)
		}
	})

	function handleLoad(editor: Ace.Editor) {
		editor.completers = []
		editor.completers.push({
			getCompletions: (editor, session, pos, prefix, callback) => {
				const lineText = session.getLine(pos.row)
				// ===== 行首标识符自动补全 =====
				if(lineText.substring(0, pos.column).trim() == prefix) {
					const completes: Ace.Completion[] = SparksNMNLanguage.commandDefs.map((val): Ace.Completion => {
						return {
							name: val.head,
							value: val.head + ': ',
							score: 100,
							meta: NMNI18n.commandDescription(languageArray, val.head)
						}
					}).concat(SparksNMNLanguage.commandDefs.map((val): Ace.Completion => {
						return {
							name: val.headFull,
							value: val.headFull + ': ',
							score: 90,
							meta: NMNI18n.commandDescription(languageArray, val.head)
						}
					})).filter((suggest) => {
						if(suggest.name!.slice(0, prefix.length).toLocaleLowerCase() == prefix.toLocaleLowerCase()) {
							return true
						}
						return false
					})
					callback(null, completes)
				}
			}
		})
	}
	
	return <CodeEditor
		name={props.name}
		mode='sparksnmn'
		value={props.value ?? ''}
		onChange={props.onChange}
		ref={ref}
		lineWrap={false}
		onLoad={handleLoad}
	/>
}
