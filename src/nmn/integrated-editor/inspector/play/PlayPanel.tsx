import React, { useContext } from 'react'
import { IntegratedEditorContext } from '../../IntegratedEditor'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
	headroom: {
		flexShrink: 0,
		borderBottom: '1px solid #0002',
	},
	contentroom: {
		flex: 'auto',
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		height: 0,
	},
	room1: {
		flexShrink: 0,
		borderBottom: '1px solid #0002',
	},
	room2: {
		flexShrink: 0,
	}
})

// eslint-disable-next-line react/display-name
export const PlayPanel = React.memo(function(props: {

}) {
	const { prefs, language, colorScheme } = useContext(IntegratedEditorContext)
	const classes = useStyles()

	return <>
		<div className={classes.headroom}>
			Head
		</div>
		<div className={classes.contentroom} style={{...(!prefs.isMobile && {flexShrink: 0, height: '', overflowY: 'hidden'})}}>
			<div className={classes.room1} style={{...(!prefs.isMobile && {flex: 4, height: 0, overflowY: 'auto'})}}>
			</div>
			<div className={classes.room2} style={{...(!prefs.isMobile && {flex: 5, height: 0, overflowY: 'auto'})}}>
			</div>
		</div>
	</>
})
