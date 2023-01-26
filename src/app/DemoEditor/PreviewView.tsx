import jquery from 'jquery'
import React, { useEffect } from 'react'
import { createUseStyles } from 'react-jss'
import { Equifield, EquifieldSection } from '../../equifield/equifield'
import { NMNResult, SparksNMN } from '../../nmn'
import languageArray_zh_cn from '../../nmn/i18n/zh_cn'

const maxWidth = 1200
const useStyles = createUseStyles({
	previewContainer: {
		margin: '16px auto',
		width: maxWidth,
		minHeight: 216,
		border: '1px solid #00000022'
	},
	previewContent: {
		padding: '48px 0'
	},
	[`@media(max-width: ${maxWidth + 32}px)`]: {
		previewContainer: {
			width: '100%',
			border: 'none'
		},
		previewContent: {
			padding: '16px 0'
		}
	},
	'@media print': {
		previewContainer: {
			width: '100%',
			border: 'none',
		},
		previewContent: {
			padding: '0'
		}
	}
})

type PreviewViewProps = {
	result: NMNResult | undefined
}
export function PreviewView(props: PreviewViewProps) {
	const classes = useStyles()
	const divRef = React.createRef<HTMLDivElement>()
	
	React.useEffect(() => {
		const element = divRef.current
		if(!element) {
			return
		}
		const ef = new Equifield(element)
		// let testArr: EquifieldSection[] = []
		// for(let i = 0; i < 10; i++) {
		// 	testArr.push({
		// 		element: jquery('<span style="font-size: ' + (3 * Math.pow(0.9, i)) + 'em">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>')[0],
		// 		height: 26 * Math.pow(0.9 * 0.9, i)
		// 	})
		// }
		// ef.render(testArr)
		if(props.result) {
			const fields = SparksNMN.render(props.result.result, languageArray_zh_cn)
			ef.render(fields)
		} else {
			ef.render([{
				element: jquery('<span style="font-size: 2em">Loading preview...</span>')[0],
				height: 3
			}])
		}
		return () => {
			ef.destroy()
		}
	})

	return <div className={classes.previewContainer}>
		<div className={classes.previewContent}>
			<div ref={divRef}></div>
		</div>
	</div>
}
