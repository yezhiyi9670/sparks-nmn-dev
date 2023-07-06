import React, { useContext } from 'react'
import { IntegratedEditorContext } from '../../IntegratedEditor'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
	headroom: {
		flexShrink: 0,
		borderBottom: '1px solid #0002'
	},
	contentRoom: {
		flex: 'auto'
	}
})

// eslint-disable-next-line react/display-name
export const PlayPanel = React.memo(function(props: {

}) {
	const { prefs, language, colorScheme } = useContext(IntegratedEditorContext)
	const classes = useStyles()

	return <>
		<div className={classes.headroom}>A</div>
		<div className={classes.contentRoom} style={{...(!prefs.isMobile && {overflowY: 'auto'})}}>
			B
		</div>
	</>
})
