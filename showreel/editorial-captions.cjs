'use strict';

// The new cut keeps credits readable without covering the action. Coordinates
// are authored at 1080p; libass scales the same layout for proxy encodes.
const text = value => String(value ?? '').replace(/\\/g, '＼').replace(/[{}]/g, '').replace(/\r?\n/g, '\\N');
function time(value) {
  const cs = Math.max(0, Math.round(value * 100));
  return `${Math.floor(cs / 360000)}:${String(Math.floor(cs / 6000) % 60).padStart(2, '0')}:${String(Math.floor(cs / 100) % 60).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
}

module.exports = function editorialCaptions(segments, duration, timeline) {
  const identity = timeline.identity;
  const lines = [
    '[Script Info]', `Title: ${text(timeline.title)}`, 'ScriptType: v4.00+',
    'PlayResX: 1920', 'PlayResY: 1080', 'WrapStyle: 2',
    'ScaledBorderAndShadow: yes', 'YCbCr Matrix: TV.709', '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Title,Inter Tight,64,&H00EEF3F3,&H00EEF3F3,&H70080706,&H90080706,-1,0,0,0,100,100,-0.6,0,1,0.6,0,7,112,112,64,1',
    'Style: Role,Inter,30,&H00DFE3E3,&H00DFE3E3,&H50080706,&H90080706,0,0,0,0,100,100,0,0,1,0.5,0,7,112,112,64,1',
    'Style: Credit,Inter,24,&H00CFCECA,&H00CFCECA,&H50080706,&H90080706,0,0,0,0,100,100,0,0,1,0.5,0,7,112,112,64,1',
    'Style: Label,IBM Plex Mono,22,&H00DEC6AA,&H00DEC6AA,&H70080706,&H90080706,0,0,0,0,100,100,1.8,0,1,0.5,0,7,112,112,64,1',
    'Style: Name,Inter Tight,100,&H00EEF3F3,&H00EEF3F3,&H70080706,&H90080706,-1,0,0,0,100,100,-1.4,0,1,0,0,7,112,112,64,1',
    'Style: Url,Inter,42,&H00DEC6AA,&H00DEC6AA,&H70080706,&H90080706,0,0,0,0,100,100,0,0,1,0,0,7,112,112,64,1',
    '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  ];
  function event(start, end, style, content, tags = '', layer = 5) {
    if (end > start) lines.push(`Dialogue: ${layer},${time(start)},${time(end)},${style},,0,0,0,,{${tags}}${content}`);
  }
  function scrim(start, end, upper = false) {
    // Broad, blurred tonal support has no visible card edge.
    for (let i = 0; i < 4; i++) {
      const y = upper ? -220 : 744 + i * 58;
      const h = upper ? 490 - i * 48 : 1400 - y;
      event(start, end, 'Role', `m -240 ${y} l 2160 ${y} l 2160 ${y + h} l -240 ${y + h}`,
        `\\an7\\pos(0,0)\\p1\\bord0\\shad0\\c&H080706&\\1a&H${upper ? 'DC' : 'D4'}&\\blur64\\fad(180,160)`, i);
    }
  }
  function rule(start, end, y, width = 60, x = 112) {
    event(start, end, 'Label', `m 0 0 l ${width} 0 l ${width} 3 l 0 3`, `\\an7\\pos(${x},${y})\\p1\\bord0\\fad(180,140)`, 4);
  }

  // Immediate gameplay, with a short author credit over the opening shot.
  scrim(0.1, 3.7, true);
  event(0.16, 3.55, 'Label', 'SELECTED WORK / ' + text(identity.year), '\\pos(112,110)\\fad(200,220)');
  event(0.30, 3.55, 'Name', text(identity.name), '\\pos(108,150)\\fad(220,220)');
  event(0.48, 3.55, 'Role', text(identity.role), '\\pos(112,272)\\fad(220,220)');

  for (const segment of segments) {
    const caption = segment.caption;
    if (!caption) continue;
    const start = segment.timelineStart;
    if (caption.kind === 'outro') {
      const end = duration - 0.1;
      event(start + 0.36, end, 'Label', 'SOUND DESIGN / AUDIO PROGRAMMING', '\\pos(112,320)\\fad(250,240)');
      event(start + 0.44, end, 'Name', text(identity.name), '\\pos(106,370)\\fad(260,240)');
      rule(start + 0.48, end, 525, 1696);
      event(start + 0.58, end, 'Url', text(identity.website), '\\pos(112,574)\\fad(260,240)');
      event(start + 0.6, end, 'Credit', 'Closing audio: Ray · Score by Igor Szuniewicz', '\\pos(112,952)\\fad(220,240)');
      event(start + 0.6, end, 'Credit', 'Sound design: Tijn Valcke + Charlie Vervaecke', '\\pos(112,990)\\fad(220,240)');
      continue;
    }
    const a = start + Number(caption.delay ?? 0.16);
    const b = Math.min(duration, start + Number(caption.showFor)) - 0.04;
    if (caption.layout !== 'tool') scrim(a - 0.06, b);
    rule(a, b, 846);
    event(a + 0.02, b, 'Title', text(caption.title), '\\pos(110,860)\\fad(160,100)');
    event(a + 0.07, b, 'Role', text(caption.role) + '  /  ' + text(caption.detail), '\\pos(112,944)\\fad(160,100)');
    if (caption.credit) event(a + 0.10, b, 'Credit', text(caption.credit), '\\pos(112,993)\\fad(160,100)');
    event(a, b, 'Label', text(caption.category), '\\an9\\pos(1808,868)\\fad(160,100)');
  }
  return lines.join('\n') + '\n';
};
