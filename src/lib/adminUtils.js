export function filterByQuery(list, q) {
  if (!q) return list
  const lq = q.toLowerCase().trim()
  return list.filter(o =>
    (o.tournament ?? '').toLowerCase().includes(lq) ||
    String(o.year  ?? '').includes(lq)              ||
    (o.discipline  ?? '').toLowerCase().includes(lq) ||
    (o.round       ?? '').toLowerCase().includes(lq) ||
    (o.notes       ?? '').toLowerCase().includes(lq) ||
    (o.colors      ?? []).join(' ').toLowerCase().includes(lq) ||
    (o.brand       ?? '').toLowerCase().includes(lq)
  )
}
