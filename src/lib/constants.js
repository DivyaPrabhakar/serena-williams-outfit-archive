// ── Core tournament / year constants ─────────────────────────────────────
export const GRAND_SLAMS = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open']
export const ALL_TOURNAMENTS = [...GRAND_SLAMS, 'Olympics']
export const OLYMPICS_YEARS = new Set([1996, 2000, 2004, 2008, 2012, 2016, 2020, 2021])
export const ACTIVE_YEARS = Array.from({ length: 2022 - 1995 + 1 }, (_, i) => 1995 + i)

export const DISCIPLINES = ['Singles', 'Doubles', 'Mixed']

// ── Round helpers ─────────────────────────────────────────────────────────
// Ordered sequence used for slicing into getValidRounds
export const ROUND_SEQUENCE = ['R1', 'R2', 'R3', 'R4', 'QF', 'SF', 'F']

export const ROUND_LABELS = {
  R1: 'Round 1',
  R2: 'Round 2',
  R3: 'Round 3',
  R4: 'Round 4',
  QF: 'Quarter-Final',
  SF: 'Semi-Final',
  F:  'Final',
}

// 1-indexed numeric order matching ROUND_SEQUENCE position
export const ROUND_ORDER = { R1: 1, R2: 2, R3: 3, R4: 4, QF: 5, SF: 6, F: 7 }

// ── SINGLES rounds played per slam per year ───────────────────────────────
// Value = number of rounds played (1–7); 7 = champion
export const ROUNDS_SINGLES = {
  'Australian Open': {1998:2, 1999:3, 2000:4, 2001:5, 2003:7, 2005:7, 2006:3, 2007:7, 2008:5, 2009:7, 2010:7, 2012:4, 2013:5, 2014:4, 2015:7, 2016:7, 2017:7, 2019:5, 2020:3, 2021:6},
  'Roland Garros':   {1998:4, 1999:3, 2001:5, 2002:7, 2003:6, 2004:5, 2007:5, 2008:3, 2009:5, 2010:5, 2012:1, 2013:7, 2014:2, 2015:7, 2016:7, 2018:4, 2019:3, 2020:2, 2021:4},
  'Wimbledon':       {1998:3, 2000:6, 2001:5, 2002:7, 2003:7, 2004:7, 2005:3, 2007:5, 2008:7, 2009:7, 2010:7, 2011:4, 2012:7, 2013:4, 2014:3, 2015:7, 2016:7, 2018:7, 2019:7, 2021:1, 2022:1},
  'US Open':         {1998:3, 1999:7, 2000:5, 2001:7, 2002:7, 2004:5, 2005:4, 2006:4, 2007:5, 2008:7, 2009:6, 2011:7, 2012:7, 2013:7, 2014:7, 2015:6, 2016:6, 2018:7, 2019:7, 2020:6, 2022:3},
  'Olympics':        {2008:5, 2012:5, 2016:3},
}

// ── DOUBLES rounds played per slam per year ───────────────────────────────
export const ROUNDS_DOUBLES = {
  'Australian Open': {1998:3, 1999:6, 2001:7, 2003:7, 2008:5, 2009:7, 2010:7, 2013:5},
  'Roland Garros':   {1999:7, 2009:3, 2010:7, 2013:1, 2016:3, 2018:3},
  'Wimbledon':       {1998:1, 2000:7, 2001:3, 2002:7, 2003:3, 2007:2, 2008:7, 2009:7, 2010:5, 2012:7, 2014:2, 2016:7},
  'US Open':         {1997:1, 1999:7, 2000:6, 2001:3, 2009:7, 2012:3, 2013:6, 2014:5, 2022:1},
  'Olympics':        {2000:5, 2008:5, 2012:5, 2016:1},
}

// ── MIXED DOUBLES rounds played per slam per year ─────────────────────────
// Mixed doubles was never offered at the Olympics
export const ROUNDS_MIXED = {
  'Australian Open': {1998:1, 1999:7},
  'Roland Garros':   {1998:7, 2011:1},
  'Wimbledon':       {1998:7, 2019:3},
  'US Open':         {1998:7},
}

// ── SINGLES participation data ────────────────────────────────────────────
export const SINGLES_DID_NOT_PLAY = {
  'Australian Open': new Set([1995, 1996, 1997, 2002, 2004, 2011, 2018, 2022]),
  'Roland Garros':   new Set([1995, 1996, 1997, 2000, 2005, 2006, 2011, 2017, 2022]),
  'Wimbledon':       new Set([1995, 1996, 1997, 1999, 2006, 2017]),
  'US Open':         new Set([1995, 1996, 1997, 2003, 2010, 2017, 2021]),
}
export const SINGLES_NOT_HELD = {
  'Wimbledon': new Set([2020]),
}

// ── DOUBLES participation data ────────────────────────────────────────────
export const DOUBLES_DID_NOT_PLAY = {
  'Australian Open': new Set([1997, 2000, 2002, 2004, 2005, 2006, 2007, 2011, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]),
  'Roland Garros':   new Set([1997, 1998, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2011, 2012, 2014, 2015, 2017, 2019, 2020, 2021, 2022]),
  'Wimbledon':       new Set([1997, 1999, 2004, 2005, 2006, 2011, 2013, 2015, 2017, 2018, 2019, 2021, 2022]),
  'US Open':         new Set([1998, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2010, 2011, 2015, 2016, 2017, 2018, 2019, 2020, 2021]),
  'Olympics':        new Set([2004, 2020]),
}
export const DOUBLES_NOT_HELD = {
  'Wimbledon': new Set([2020]),
  'Olympics':  new Set([1997, 1998, 1999, 2001, 2002, 2003, 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2015, 2017, 2018, 2019, 2021, 2022]),
}

// ── MIXED DOUBLES participation data ─────────────────────────────────────
export const MIXED_DID_NOT_PLAY = {
  'Australian Open': new Set([2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]),
  'Roland Garros':   new Set([1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022]),
  'Wimbledon':       new Set([1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2021, 2022]),
  'US Open':         new Set([1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022]),
}
export const MIXED_NOT_HELD = {
  'Roland Garros': new Set([2020]),
  'Wimbledon':     new Set([2020]),
  'US Open':       new Set([2020]),
}

// ── Colour map ────────────────────────────────────────────────────────────
export const COLOR_MAP = {
  White:  '#eee',
  Black:  '#111',
  Red:    '#c0392b',
  Gold:   '#C9A84C',
  Blue:   '#2980b9',
  Purple: '#8e44ad',
  Pink:   '#e91e8c',
  Green:  '#27ae60',
  Orange: '#e67e22',
  Multi:  'linear-gradient(135deg,#e91e8c,#2980b9)',
}
