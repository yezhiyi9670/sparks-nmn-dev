/* eslint-disable react/display-name */
import React, { ReactNode, forwardRef, useContext } from 'react'
import { IntegratedEditorContext } from '../../IntegratedEditor'
import { useRecreatedStyles } from './styles'

function useStyles() {
	const { colorScheme } = useContext(IntegratedEditorContext)
	return useRecreatedStyles(colorScheme)
}

type ButtonGroup = {
	children: ReactNode
	style?: React.CSSProperties
	classes?: string[]
}
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroup>((props, ref) => {
	const classes = useStyles()

	return <div ref={ref} className={[classes.buttonGroup, ...(props.classes ?? [])].join(' ')} style={props.style}>
		{props.children}
	</div>
})

export function Button(props: {
	children?: ReactNode
	title?: string
	small?: boolean
	large?: boolean
	selected?: boolean
	disabled?: boolean
	onClick?: () => void
	style?: React.CSSProperties
	classes?: string[]
	index?: number
}) {
	const classes = useStyles()

	return <button
		title={props.title}
		className={
			[`${classes.button} ${props.small ? classes.buttonSmall : ''} ${props.large ? classes.buttonLarge : ''} ${props.selected ? 'active' : ''}`,
				...(props.classes ?? [])
			].join(' ')
		}
		onClick={props.onClick}
		disabled={props.disabled}
		style={props.style}
		data-index={props.index}
	>
		{props.children}
	</button>
}

export function ButtonMargin() {
	const classes = useStyles()
	return <div className={classes.buttonMargin}></div>
}

export function ButtonSpacer() {
	const classes = useStyles()
	return <div className={classes.buttonSpacer}></div>
}

export function ButtonSelect(props: {
	children?: ReactNode
	title?: string
	small?: boolean
	large?: boolean
	value?: string
	defaultValue?: string
	onChange?: (val: string) => void
	style?: React.CSSProperties
}) {
	const classes = useStyles()

	return (
		<select
			title={props.title}
			className={`${classes.button} ${props.small ? classes.buttonSmall : ''} ${props.large ? classes.buttonLarge : ''}`}
			style={{flex: 'auto', ...props.style}}
			onChange={(evt) => props.onChange && props.onChange(evt.currentTarget.value)}
			value={props.value}
			defaultValue={props.defaultValue}
		>
			{props.children}
		</select>
	)
}
