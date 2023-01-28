import React, { ReactNode } from "react"
import { createUseStyles } from "react-jss"
import { Box } from "../util/component"
import { DemoEditor } from "./DemoEditor/DemoEditor"
import testdata1 from "./test/testdata1"

const useStyles = createUseStyles({
	outer: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column'
	},
	header: {
		height: '48px',
		borderBottom: '1px solid #00000029',
		backgroundColor: '#FAFAFA',
		boxSizing: 'border-box',
		padding: '0 12px',
		verticalAlign: 'middle'
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
		flex: 'auto'
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
}
export function PageHeader(props: PageHeaderProps) {
	const classes = useStyles()
	return <div className={classes.outer}>
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
	return <PageHeader text="Sparks NMN Dev Demo">
		<DemoEditor initialContent={testdata1} />
	</PageHeader>
}
