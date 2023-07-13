/* eslint-disable react/display-name */
import React, { memo, useContext } from 'react'
import { BeatMachineSignature, ControlData, ControlDataPart, DrumlineInstruments, MixingControlUtils, TonicInstruments } from './types'
import { iterateMap } from '../../../../util/array'
import { PartSignature } from '../../../../parser/des2cols/types'
import { useMethod } from '../../../../util/hook'
import { createUseStyles } from 'react-jss'
import { IntegratedEditorContext } from '../../../IntegratedEditor'
import { LanguageArray } from '../../../../i18n'
import { NMNI18n } from '../../../..'
import { Button, ButtonGroup, ButtonMargin, ButtonSelect } from '../../component/button'
import { ReactSelect } from '../../component/react-select'
import { ReactSlider } from '../../component/react-slider'

import * as IconsGo from 'react-icons/go'
import * as IconsTb from 'react-icons/tb'

const i18nPrefix = `inspector.play.controls.`

const useStyles = createUseStyles({
	partCard: {
		padding: '12px 0',
		borderBottom: '1px solid #0004'
	},
	labelLine: {
		fontSize: '16px',
		display: 'flex',
		flexDirection: 'row'
	},
	partLabel: {
		flex: 'auto',
		display: 'table'
	},
	volumeLine: {
		fontSize: '16px',
		display: 'flex',
		flexDirection: 'row',
		padding: '8px 0'
	},
	miscLine: {
		display: 'flex',
		flexDirection: 'row',
		fontSize: '15px'
	},
	controlLabel: {
		paddingRight: '0.4em',
	},
	controlValue: {
		padding: '0 0.4em'
	},
	saveCard: {
		padding: '12px 0'
	},
	saveButton: {
		flexBasis: 0,
		flex: 1,
		fontSize: '15px !important'
	},
	hint: {
		paddingBottom: '0.8em',
		fontSize: '14px',
		opacity: 0.6,
		lineHeight: 1.5
	}
})

// eslint-disable-next-line react/display-name
export const Controls = memo((props: {
	data: ControlData
	setData: (newData: ControlData) => void
	onSaveData: () => void
	onLoadData: () => void
	canLoadData: boolean
}) => {
	const classes = useStyles()
	const { language } = useContext(IntegratedEditorContext)

	const updatePartData = useMethod((hash: string, newData: ControlDataPart) => {
		const data1: ControlData = {
			...props.data,
			[hash]: {
				...props.data[hash],
				control: newData
			}
		}
		props.setData(data1)
	})

	return <>
		{iterateMap(props.data, (part, hash) => {
			return (
				<ControlsPart
					signature={part.signature}
					key={hash}
					partData={part.control}
					setPartData={updatePartData}
				/>
			)
		})}
		<div className={classes.saveCard}>
			<div className={classes.hint}>{NMNI18n.editorText(language, `${i18nPrefix}prefab.hint`)}</div>
			<ButtonGroup>
				<Button classes={[classes.saveButton]} onClick={props.onSaveData}>
					{NMNI18n.editorText(language, `${i18nPrefix}prefab.save`)}
				</Button>
				<ButtonMargin />
				<Button disabled={!props.canLoadData} classes={[classes.saveButton]} onClick={props.onLoadData}>
					{NMNI18n.editorText(language, `${i18nPrefix}prefab.load`)}
				</Button>
			</ButtonGroup>
		</div>
	</>
})

export const ControlsPart = memo((props: {
	signature: PartSignature | BeatMachineSignature
	partData: ControlDataPart,
	setPartData: (hash: string, newData: ControlDataPart) => void
}) => {
	const { language, colorScheme } = useContext(IntegratedEditorContext)
	const { partData } = props
	const classes = useStyles()
	const isBeatMachine = partData.type == 'beatMachine'

	function setPartData(data: ControlDataPart) {
		props.setPartData(props.signature.hash, data)
	}

	function modifyOctave(val: number) {
		if(isBeatMachine) {
			return
		}
		const newOctave = partData.octave + val
		if(Math.abs(newOctave) > MixingControlUtils.maxOctave) {
			return
		}
		setPartData({
			...partData,
			octave: newOctave
		})
	}

	return (
		<div className={classes.partCard}>
			<div className={classes.labelLine}>
				<div className={classes.partLabel} style={{...(isBeatMachine && {fontStyle: 'italic'})}}>
					<span style={{display: 'table-cell', verticalAlign: 'middle'}}>{partLabel(language, props.signature)}</span>
				</div>
				<Button
					selected={partData.mute}
					onClick={() => {setPartData({...partData, mute: !partData.mute, solo: partData.solo && partData.mute})}}
					style={{borderRight: 'none'}}
					mini
				>M</Button>
				<Button
					selected={partData.solo}
					onClick={() => {setPartData({...partData, mute: partData.mute && partData.solo, solo: !partData.solo})}}
					style={{borderLeft: 'none'}}
					mini
				>S</Button>
			</div>
			<div className={classes.volumeLine}>
				<ReactSlider
					style={{flex: 'auto', fontSize: '18px'}}
					highlightColor={colorScheme.positive}
					trackColor={colorScheme.voidaryHover}
					thumbColor={'white'}
					hoverColor={colorScheme.voidary}
					activeColor={colorScheme.voidaryHover}
					min={0} max={MixingControlUtils.maxVolume} step={2} value={partData.volume}
					onChange={(val) => {setPartData({...partData, volume: val})}}
					onRootKeyDown={(evt) => {
						evt.stopPropagation()
					}}
				/>
				<div style={{display: 'table', flex: 0, flexBasis: '2.4em'}}>
					<span style={{display: 'table-cell', textAlign: 'right'}}>
						{partData.volume}
					</span>
				</div>
			</div>
			<div className={classes.miscLine}>
				<span style={{flexBasis: 0, flex: 3}}>
					<span className={classes.controlLabel}>
						{NMNI18n.editorText(language, `${i18nPrefix}synth`)}
					</span>
					{!isBeatMachine && <>
						<IconsGo.GoNumber style={{fontSize: '1.2em', transform: 'translateY(0.2em)'}} />
						<ButtonSelect
							mini
							items={iterateMap(TonicInstruments, (instrument, id) => ({
								value: id,
								label: NMNI18n.editorText(language, `${i18nPrefix}instrument.${id}`)
							}))}
							onChange={val => setPartData({...partData, tonicInstrument: val as any})}
							itemFontSize='14px'
							value={partData.tonicInstrument}
							style={{width: '4em', marginRight: '0.4em'}}
						/>
					</>}
					<>
						<IconsTb.TbLetterX style={{fontSize: '1.2em', transform: 'translateY(0.2em)'}} />
						<ButtonSelect
							mini
							items={iterateMap(DrumlineInstruments, (instrument, id) => ({
								value: id,
								label: NMNI18n.editorText(language, `${i18nPrefix}instrument.${id}`)
							}))}
							onChange={val => setPartData({...partData, drumlineInstrument: val as any})}
							itemFontSize='14px'
							value={partData.drumlineInstrument}
							style={{width: '4em', paddingRight: '0.4em'}}
						/>
					</>
				</span>
				{!isBeatMachine && <span style={{}}>
					<span className={classes.controlLabel}>
						{NMNI18n.editorText(language, `${i18nPrefix}octave`)}
					</span>
					<Button onClick={() => modifyOctave(-1)} mini>{'-'}</Button>
					<span className={classes.controlValue}>
						{(partData.octave < 0 ? '-' : '+') + Math.abs(partData.octave)}
					</span>
					<Button onClick={() => modifyOctave(1)} mini>{'+'}</Button>
				</span>}
			</div>
		</div>
	)
})

function partLabel(language: LanguageArray, signature: PartSignature | BeatMachineSignature) {
	if(signature.type == 'beatMachine') {
		return NMNI18n.editorText(language, `${i18nPrefix}part.beat_machine`)
	}
	if(signature.type == 'titled') {
		let text = ''
		const label = signature.value
		if(label.type == 'scriptedText') {
			text = label.text + '_' + label.sub
		} else {
			text = label.text
		}
		return NMNI18n.editorText(language, `${i18nPrefix}part.titled`, text)
	}
	return NMNI18n.editorText(language, `${i18nPrefix}part.untitled`, '' + (signature.value + 1))
}
