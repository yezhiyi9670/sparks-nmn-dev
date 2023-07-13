import React from 'react'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
	root: {
		padding: '12px',
		overflowY: 'auto'
	}
})

export function InstrumentTestPanel() {
	const classes = useStyles()
	
	return (
		<div className={classes.root}>
			
		</div>
	)
}
