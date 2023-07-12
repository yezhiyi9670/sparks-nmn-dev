import { PartSignature } from "../../../../parser/des2cols/types"

export type ControlData = {[partHash: string]: {
	control: ControlDataPart
	signature: PartSignature | BeatMachineSignature
}}

export type ControlDataPart = {
	mute: boolean
	solo: boolean
	volume: number
	pan: number
} & ({
	type: 'part'
	octave: number
	tonicInstrument: TonicInstrumentName,
	drumlineInstrument: DrumlineInstrumentName
} | {
	type: 'beatMachine',
	drumlineInstrument: DrumlineInstrumentName
})

export const controlDataPartDefault: ControlDataPart = {
	mute: false,
	solo: false,
	volume: 100,
	pan: 0,
	type: 'part',
	octave: 0,
	tonicInstrument: 'piano',
	drumlineInstrument: 'drum'
}
export const controlDataPartBeatMachine: ControlDataPart = {
	mute: false,
	solo: false,
	volume: 100,
	pan: 0,
	type: 'beatMachine',
	drumlineInstrument: 'dip'
}

export const TonicInstruments = {
	piano: {},
	string: {},
	dah: {}
}
export type TonicInstrumentName = keyof(typeof TonicInstruments)

export const DrumlineInstruments = {
	drum: {},
	dip: {},
	dah: {}
}
export type DrumlineInstrumentName = keyof(typeof DrumlineInstruments)

export type BeatMachineSignature = {
	hash: 'beatMachine',
	type: 'beatMachine'
}

export type Instrument = (typeof TonicInstruments)['piano']
