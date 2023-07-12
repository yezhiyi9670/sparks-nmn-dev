export type ControlData = {[partId: string]: ControlDataPart}

export type ControlDataPart = {
	mute: boolean
	solo: boolean
	octave: number
	volume: number
	tonicInstrument: TonicInstrumentName,
	drumlineInstrument: DrumlineInstrumentName
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
