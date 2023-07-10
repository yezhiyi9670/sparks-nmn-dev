import React, { ReactComponentElement, ReactElement, ReactNode, useContext, useState } from 'react'
import { createUseStyles } from 'react-jss'

import * as Icons from 'react-icons/vsc'
import { IntegratedEditorContext } from '../IntegratedEditor'
import { NMNI18n } from '../..'

const useStyles = createUseStyles({
	title: {
		display: 'flex',
		flexDirection: 'row',
		height: '42px',
		borderBottom: '1px solid #0002',
		flexShrink: 0,
	},
	titleSelector: {
		display: 'block',
		height: '100%',
		width: 0,
		flex: 'auto',
		border: 'none',
		borderRadius: 0,
		background: '#FFF',
		padding: '0 12px',
		fontSize: '18px',
		paddingBottom: '1px',
		outline: 'none'
	},
	titleClose: {
		display: 'block',
		height: '100%',
		width: '42px',
		cursor: 'pointer',
		fontSize: '20px',
		border: 'none',
		borderRadius: 0,
		background: '#FFF',
	}
})

type InspectorInfo = {
	id: string,
	content: () => ReactNode,
}

export function InspectorView(props: {
	onClose?: () => void
	inspectors: InspectorInfo[]
}) {
	const i18nPrefix = 'inspector.'
	const classes = useStyles()
	const inspectors = props.inspectors
	const { language } = useContext(IntegratedEditorContext)

	if(inspectors.length == 0) {
		throw new Error('InspectorView: There must be at least one inspector.')
	}
	const [ currentPage, setCurrentPage ] = useState(inspectors[0].id)

	return <>
		<div className={classes.title}>
			<select className={classes.titleSelector} onChange={val => setCurrentPage(val.currentTarget.value)} value={currentPage}>
				{inspectors.map(item => (
					<option key={item.id} value={item.id}>
						{NMNI18n.editorText(language, `${i18nPrefix}${item.id}.title`)}
					</option>
				))}
			</select>
			<button className={classes.titleClose} onClick={() => props.onClose && props.onClose()}>
				<Icons.VscChromeClose style={{transform: 'translateY(2px)'}} />
			</button>
		</div>
		{inspectors.filter(item => item.id == currentPage)[0]?.content()}
	</>
}