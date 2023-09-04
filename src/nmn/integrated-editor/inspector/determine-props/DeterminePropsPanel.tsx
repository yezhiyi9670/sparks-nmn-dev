import React, { useContext, useState } from 'react'
import { createUseStyles } from 'react-jss'
import { IntegratedEditorContext } from '../../IntegratedEditor'
import { NMNI18n } from '../../..'
import { Button } from '../component/button'
import { PianoInstrument } from '../../../tone/instrument/tonic/PianoInstrument'
import * as Tone from 'tone'

const useStyles = createUseStyles({
	container: {
		padding: '12px'
	},
	title: {
		fontWeight: 700,
		fontSize: '1.08em',
		marginBottom: '12px',
		marginTop: '18px',
		lineHeight: 1.35
	},
	pline: {
		marginBottom: '12px',
		lineHeight: 1.35,
	},
	keyGroup: {
		marginBottom: '12px',
		display: 'table',
		borderCollapse: 'collapse',
		tableLayout: 'fixed',
		width: '100%'
	},
	keyLine: {
	},
	octaveLabel: {
		display: 'table-cell',
		padding: 0
	},
	keyCell: {
		padding: 0,
		border: '1px solid #0003',
	}
})

export function DeterminePropsPanel(props: {}) {
	const i18nPrefix = 'inspector.determine_props.'

	const classes = useStyles()
	const { language } = useContext(IntegratedEditorContext)

	return <div className={classes.container}>
		<div className={classes.pline}>
			{NMNI18n.editorText(language, `${i18nPrefix}tips`)}
		</div>
		<BaseTester />
		<SpeedTester />
	</div>
}

function BaseTester(props: {}) {
	const i18nPrefix = 'inspector.determine_props.base.'

	const classes = useStyles()
	const { prefs, colorScheme, language } = useContext(IntegratedEditorContext)

	const [ selectedNote, setSelectedNote ] = useState(NaN)
	const [ selectedRelation, setSelectedRelation ] = useState(NaN)

	async function handleNoteSelect(pitch: number) {
		setSelectedNote(pitch)
		if(prefs.instrumentSourceUrl === undefined) {
			return
		}
		const freq = 440 * 2 ** ((pitch - 9) / 12)
		PianoInstrument.load(prefs.instrumentSourceUrl)
		await Tone.start()
		await Tone.loaded()
		const instr = new PianoInstrument()
		instr.scheduleNote(freq, 0, 1000)
	}
	function handleRelationSelect(relation: number) {
		setSelectedRelation(relation)
	}

	return <>
		<div className={classes.title}>
			{NMNI18n.editorText(language, `${i18nPrefix}title`)}
		</div>
		<div className={classes.pline}>
			{NMNI18n.editorText(language, `${i18nPrefix}tips.1`)}
		</div>
		<table className={classes.keyGroup}>
			{[4, 5, 6, 7, 8, 9, 10, 11].map(halfOctave => (
				<tr className={classes.keyLine} key={halfOctave}>
					{[0, 1, 2, 3, 4, 5].map(tune => {
						const pitchValue = 6 * (halfOctave - 8) + tune
						return (<td className={classes.keyCell} key={tune}>
							<Button
								small
								selected={selectedNote == pitchValue}
								style={{
									minWidth: '0',
									fontSize: '15px',
									width: '100%',
									border: 'none',
								}}
								onMouseDown={() => handleNoteSelect(pitchValue)}
							>{pitchValue + 60}</Button>
						</td>)
					})}
				</tr>
			))}
		</table>
		<div className={classes.pline}>
			{NMNI18n.editorText(language, `${i18nPrefix}tips.2`)}
		</div>
		<table className={classes.keyGroup}>
			{[-2, -1, 0, 1, 2, 3].map(halfOctave => (
				<tr className={classes.keyLine} key={halfOctave}>
					{[0, 1, 2, 3, 4, 5].map(tune => {
						const relationValue = 6 * halfOctave + tune
						return (<td className={classes.keyCell} key={tune}>
							<Button
								small
								selected={selectedRelation == relationValue}
								style={{
									minWidth: '0',
									fontSize: '15px',
									width: '100%',
									border: 'none',
								}}
								onMouseDown={() => handleRelationSelect(relationValue)}
							>{relationValue}</Button>
						</td>)
					})}
				</tr>
			))}
		</table>
		<div className={classes.pline}>
			{NMNI18n.editorText(language, `${i18nPrefix}tips.3`)}
		</div>
	</>
}

function SpeedTester(props: {}) {
	const i18nPrefix = 'inspector.determine_props.speed.'

	const classes = useStyles()
	const { language } = useContext(IntegratedEditorContext)

	return <>
		<div className={classes.title}>
			{NMNI18n.editorText(language, `${i18nPrefix}title`)}
		</div>
		<div className={classes.pline}>
			{NMNI18n.editorText(language, `${i18nPrefix}tips.1`)}
		</div>
	</>
}
