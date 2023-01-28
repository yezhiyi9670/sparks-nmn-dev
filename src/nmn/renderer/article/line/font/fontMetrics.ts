import { FontMetric } from "../../../FontMetric";
import { RenderProps } from "../../../props";
import { RenderContext } from "../../../renderer";

const LineFonts: {[_: string]: FontMetric | ((_: RenderProps) => FontMetric)} = {
	note: new FontMetric('SparksNMN-EOPNumber/400', 2.2),
	noteSmall: new FontMetric('SparksNMN-EOPNumber/400', 2.0),
	addNote: new FontMetric('SparksNMN-EOPNumber/400', 1.1),
	addNoteSmall: new FontMetric('SparksNMN-EOPNumber/400', 1.0),
	accidental: new FontMetric('SparksNMN-mscore-20', 2.2),
	accidentalSmall: new FontMetric('SparksNMN-mscore-20', 2.0),
	lyrics: (prop) => new FontMetric(prop.font_lyrics!, 2.16)
}

export function getLineFont(key: string, context: RenderContext) {
	const ret = LineFonts[key]
	if(ret === undefined) {
		throw new Error('Line font ' + key + ' does not exist!')
	}
	if(typeof ret == 'function') {
		return ret(context.render)
	}
	return ret
}
